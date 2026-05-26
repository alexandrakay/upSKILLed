'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ServiceGrid } from './ServiceGrid';
import { ToolGrid } from './ToolGrid';
import { CustomTab } from './CustomTab';
import { OutputPanel } from './OutputPanel';
import { SignInModal } from '@/components/auth/SignInModal';
import { useAuth } from '@/lib/auth-context';
import {
  getLocalUsage,
  incrementLocalUsage,
  saveLastGeneration,
  loadLastGeneration,
  parseSSEBuffer,
  type GenerateOutput,
} from '@/lib/generate-logic';

const DAILY_LIMIT = 3;

export function GeneratePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'service' | 'tool' | 'custom'>('service');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [customMode, setCustomMode] = useState<'describe' | 'help'>('describe');
  const [customInput, setCustomInput] = useState('');
  const [useCase, setUseCase] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<GenerateOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState(0);
  const [anonLimited, setAnonLimited] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    const saved = loadLastGeneration();
    if (saved) setOutput(saved);
    setUsageCount(getLocalUsage().count);
  }, []);

  // Clear anon limit when user signs in
  useEffect(() => {
    if (user) setAnonLimited(false);
  }, [user]);

  const getInput = () => {
    if (activeTab === 'service') return selectedService;
    if (activeTab === 'tool') return selectedTool;
    return customInput.trim() || null;
  };

  const getPath = () => {
    if (activeTab === 'service') return 'service';
    if (activeTab === 'tool') return 'tool';
    return customMode === 'describe' ? 'custom-describe' : 'custom-help';
  };

  const rateLimited = !user && anonLimited;
  const canGenerate = Boolean(getInput() && useCase.trim() && !loading && !rateLimited);

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (user) {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ path: getPath(), input: getInput(), use: useCase.trim() }),
      });

      if (!res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const errBody = await res.json();
        throw new Error(errBody.error ?? `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let resultReceived = false;

      outer: while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';
        for (const part of parts) {
          if (!part.startsWith('data: ')) continue;
          const payload = JSON.parse(part.slice(6));
          if (payload.ping || payload.delta !== undefined) continue;
          if (payload.error) {
            if (payload.status === 429) {
              setAnonLimited(true);
              setSignInOpen(true);
            } else {
              setError(payload.error ?? `Error ${payload.status}`);
            }
            break outer;
          }
          resultReceived = true;
          setOutput(payload as GenerateOutput);
          saveLastGeneration(payload as GenerateOutput);
          if (!user) {
            const { count } = incrementLocalUsage();
            setUsageCount(count);
            if (count >= DAILY_LIMIT) setAnonLimited(true);
          }
          break outer;
        }
      }

      // Drain any result event still in the buffer when the stream closed
      if (buffer) {
        const event = parseSSEBuffer(buffer);
        if (event?.type === 'result') {
          resultReceived = true;
          setOutput(event.payload as GenerateOutput);
          saveLastGeneration(event.payload as GenerateOutput);
          if (!user) {
            const { count } = incrementLocalUsage();
            setUsageCount(count);
            if (count >= DAILY_LIMIT) setAnonLimited(true);
          }
        } else if (event?.type === 'error') {
          if (event.payload.status === 429) {
            setAnonLimited(true);
            setSignInOpen(true);
          } else {
            setError(event.payload.error ?? `Error ${event.payload.status}`);
          }
        }
      }

      if (!resultReceived) {
        setError('Generation finished with no output — check Vercel function logs for details.');
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-neutral-100">Generate a skill</h1>
          <p className="mt-2 text-neutral-500">Pick a service, a CLI tool, or describe your own.</p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="mb-6 grid w-full grid-cols-3 bg-white/[0.04]">
            <TabsTrigger value="service">API Service</TabsTrigger>
            <TabsTrigger value="tool">CLI Tool</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          <TabsContent value="service">
            <ServiceGrid selected={selectedService} onSelect={setSelectedService} />
          </TabsContent>
          <TabsContent value="tool">
            <ToolGrid selected={selectedTool} onSelect={setSelectedTool} />
          </TabsContent>
          <TabsContent value="custom">
            <CustomTab
              mode={customMode}
              value={customInput}
              onModeChange={setCustomMode}
              onValueChange={setCustomInput}
            />
          </TabsContent>
        </Tabs>

        <div className="mt-6 space-y-3">
          <Textarea
            value={useCase}
            onChange={(e) => setUseCase(e.target.value)}
            placeholder='What do you want to do? e.g. "manage issues and pull requests"'
            className="resize-none border-white/10 bg-white/[0.03] text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-purple-500/40"
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
          />

          <div className="flex items-center justify-between">
            <div>
              {!user && usageCount > 0 && !anonLimited && (
                <p className="text-xs text-neutral-500">
                  {usageCount} of {DAILY_LIMIT} used today —{' '}
                  <button
                    onClick={() => setSignInOpen(true)}
                    className="text-purple-400 hover:underline"
                  >
                    sign in for unlimited
                  </button>
                </p>
              )}
              {rateLimited && (
                <p className="text-xs text-amber-400">
                  Daily limit reached.{' '}
                  <button
                    onClick={() => setSignInOpen(true)}
                    className="underline hover:text-amber-300"
                  >
                    Sign in for unlimited generations.
                  </button>
                </p>
              )}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="gap-2 bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-40"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Generating…' : 'Generate →'}
            </Button>
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        {output && <OutputPanel output={output} />}
      </div>

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
}
