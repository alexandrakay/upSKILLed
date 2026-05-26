'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ServiceGrid } from './ServiceGrid';
import { ToolGrid } from './ToolGrid';
import { CustomTab } from './CustomTab';
import { OutputPanel } from './OutputPanel';
import {
  getLocalUsage,
  incrementLocalUsage,
  saveLastGeneration,
  loadLastGeneration,
  type GenerateOutput,
} from '@/lib/generate-logic';

const DAILY_LIMIT = 3;

export function GeneratePage() {
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
  const [rateLimited, setRateLimited] = useState(false);

  // Restore last generation and usage count on mount
  useEffect(() => {
    const saved = loadLastGeneration();
    if (saved) setOutput(saved);
    setUsageCount(getLocalUsage().count);
  }, []);

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

  const canGenerate = Boolean(getInput() && useCase.trim() && !loading && !rateLimited);

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: getPath(), input: getInput(), use: useCase.trim() }),
      });

      if (res.status === 429) {
        setRateLimited(true);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? `Error ${res.status}`);
        setLoading(false);
        return;
      }

      const data: GenerateOutput = await res.json();
      setOutput(data);
      saveLastGeneration(data);

      const { count } = incrementLocalUsage();
      setUsageCount(count);
      if (count >= DAILY_LIMIT) setRateLimited(true);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-100">Generate a skill</h1>
        <p className="mt-2 text-neutral-500">Pick a service, a CLI tool, or describe your own.</p>
      </div>

      {/* Input tabs */}
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

      {/* Shared: use case + generate */}
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
            {usageCount > 0 && !rateLimited && (
              <p className="text-xs text-neutral-500">
                {usageCount} of {DAILY_LIMIT} generations used today —{' '}
                <span className="text-purple-400">sign in for unlimited</span>
              </p>
            )}
            {rateLimited && (
              <p className="text-xs text-amber-400">
                Daily limit reached. Sign in for unlimited generations.
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

      {/* Output */}
      {output && <OutputPanel output={output} />}
    </div>
  );
}
