'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Download, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { buildFilenames, downloadText, type GenerateOutput } from '@/lib/generate-logic';

type Props = { output: GenerateOutput };

type FileTab = { key: 'skill' | 'config' | 'examples'; label: string; lang: string };

const FILE_TABS: FileTab[] = [
  { key: 'skill',    label: 'skill.md',      lang: 'markdown' },
  { key: 'config',   label: 'config.json',   lang: 'json' },
  { key: 'examples', label: 'examples.md',   lang: 'markdown' },
];

function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1 rounded px-2 py-1 text-xs text-neutral-500 transition-colors hover:text-neutral-200"
      aria-label="Copy to clipboard"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function HighlightedCode({ code, lang }: { code: string; lang: string }) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { createHighlighter } = await import('shiki');
        const hl = await createHighlighter({ themes: ['github-dark'], langs: [lang] });
        if (!cancelled) {
          setHtml(hl.codeToHtml(code, { lang, theme: 'github-dark' }));
        }
      } catch {
        // shiki failed — show plain text
      }
    })();
    return () => { cancelled = true; };
  }, [code, lang]);

  if (html) {
    return (
      <div
        className="max-h-[500px] overflow-auto rounded-b-lg text-sm [&>pre]:p-4"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <pre className="max-h-[500px] overflow-auto rounded-b-lg bg-[#0d1117] p-4 text-sm text-neutral-300">
      {code}
    </pre>
  );
}

export function OutputPanel({ output }: Props) {
  const filenames = buildFilenames(output);

  const contentFor = (key: FileTab['key']) => {
    if (key === 'skill')    return output.skillContent;
    if (key === 'config')   return output.configContent;
    return output.examplesContent;
  };

  const handleDownloadAll = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    zip.file(filenames.skill,    output.skillContent);
    zip.file(filenames.config,   output.configContent);
    zip.file(filenames.examples, output.examplesContent);
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${output.name}-skill-package.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.02] animate-slide-up">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <p className="text-sm font-medium text-neutral-200">
          Generated: <span className="text-purple-400">{output.name}</span>
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownloadAll}
          className="gap-1.5 border-white/10 bg-transparent text-neutral-400 hover:text-neutral-200"
        >
          <Archive className="h-3.5 w-3.5" />
          Download .zip
        </Button>
      </div>

      <Tabs defaultValue="skill" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b border-white/10 bg-transparent px-4 pt-2">
          {FILE_TABS.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className="data-[state=active]:border-b-2 data-[state=active]:border-purple-500 data-[state=active]:text-purple-300 rounded-none border-b-2 border-transparent text-xs text-neutral-500 transition-colors hover:text-neutral-300"
            >
              {filenames[tab.key]}
            </TabsTrigger>
          ))}
        </TabsList>

        {FILE_TABS.map((tab) => {
          const content = contentFor(tab.key);
          return (
            <TabsContent key={tab.key} value={tab.key} className="mt-0">
              <div className="flex justify-end gap-1 border-b border-white/5 px-4 py-1.5">
                <CopyButton content={content} />
                <button
                  onClick={() => downloadText(filenames[tab.key], content)}
                  className="flex items-center gap-1 rounded px-2 py-1 text-xs text-neutral-500 transition-colors hover:text-neutral-200"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
              <HighlightedCode code={content} lang={tab.lang} />
            </TabsContent>
          );
        })}
      </Tabs>

      <div className="border-t border-white/10 px-4 py-3">
        <p className="mb-1.5 text-xs font-medium text-neutral-500">Using your skill with Claude</p>
        <ol className="space-y-1 text-xs text-neutral-600">
          <li>1. Download the files above (or grab the .zip)</li>
          <li>2. In your project, add to <span className="font-mono text-neutral-400">CLAUDE.md</span>: <span className="font-mono text-neutral-400">@path/to/{output.name}-skill.md</span></li>
          <li>3. Claude will load the skill automatically at the start of each session</li>
        </ol>
      </div>
    </div>
  );
}
