'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Terminal, FolderOpen, MessageSquare, ArrowRight } from 'lucide-react';

function useTypewriter(text: string, startDelay = 0, speed = 28) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    let timeout: ReturnType<typeof setTimeout>;
    const start = setTimeout(() => {
      const tick = () => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i < text.length) {
          timeout = setTimeout(tick, speed);
        } else {
          setDone(true);
        }
      };
      tick();
    }, startDelay);
    return () => { clearTimeout(start); clearTimeout(timeout); };
  }, [text, startDelay, speed]);

  return { displayed, done };
}

function CodeBlock({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <pre className={`overflow-x-auto rounded-lg border border-white/10 bg-[#0d1117] p-4 text-sm font-mono leading-relaxed ${className}`}>
      {children}
    </pre>
  );
}

function Step1() {
  const cmd = useTypewriter('upskilled --service github --use "manage issues and PRs"', 400);
  const output = useTypewriter(
    'Generated skill package for: github-issues-prs\n  → .claude/skills/github-issues-prs-skill.md\n  → .claude/skills/github-issues-prs-config.json\n  → .claude/skills/github-issues-prs-examples.md',
    cmd.done ? 200 : 99999,
    18
  );

  return (
    <CodeBlock>
      <span className="text-purple-400">$ </span>
      <span className="text-neutral-100">{cmd.displayed}</span>
      {!cmd.done && <span className="animate-pulse text-neutral-400">▌</span>}
      {cmd.done && output.displayed && (
        <>
          {'\n'}
          <span className="text-green-400">{output.displayed}</span>
          {!output.done && <span className="animate-pulse text-neutral-400">▌</span>}
        </>
      )}
    </CodeBlock>
  );
}

function Step2() {
  const line1 = useTypewriter('# CLAUDE.md', 400, 30);
  const line2 = useTypewriter('\n\n@.claude/skills/github-issues-prs-skill.md', line1.done ? 300 : 99999, 22);

  return (
    <CodeBlock>
      <span className="text-neutral-500"># CLAUDE.md</span>
      {line1.done && (
        <span className="text-purple-300">{line2.displayed}</span>
      )}
      {line1.done && !line2.done && <span className="animate-pulse text-neutral-400">▌</span>}
    </CodeBlock>
  );
}

function Step3() {
  const prompt = useTypewriter('Help me triage the open issues in this repo and suggest priorities.', 400, 20);
  const response = useTypewriter(
    "I'll use the GitHub Issues & PRs skill to help you triage. Let me list open issues, group them by severity, and suggest a priority order…",
    prompt.done ? 600 : 99999,
    16
  );

  return (
    <CodeBlock>
      <div className="mb-3">
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">You</span>
        <div className="mt-1 text-neutral-200">
          {prompt.displayed}
          {!prompt.done && <span className="animate-pulse text-neutral-400">▌</span>}
        </div>
      </div>
      {prompt.done && response.displayed && (
        <div>
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Claude</span>
          <div className="mt-1 text-neutral-300">
            {response.displayed}
            {!response.done && <span className="animate-pulse text-neutral-400">▌</span>}
          </div>
        </div>
      )}
    </CodeBlock>
  );
}

const STEPS = [
  {
    number: '01',
    icon: Terminal,
    title: 'Generate a skill',
    description: 'Pick an API service, CLI tool, or describe your own. upSKILLed generates 3 files: a skill definition, a config, and example prompts.',
    demo: <Step1 />,
  },
  {
    number: '02',
    icon: FolderOpen,
    title: 'Add it to your project',
    description: 'Place the skill.md file in your project and reference it from CLAUDE.md using an @ path. That\'s it — one line.',
    demo: <Step2 />,
  },
  {
    number: '03',
    icon: MessageSquare,
    title: 'Claude knows your tools',
    description: 'At the start of every Claude Code session, the skill is loaded automatically. Claude has full context on the service — its API, auth patterns, and best practices.',
    demo: <Step3 />,
  },
];

export function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-28">
      <div className="mb-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-100 sm:text-4xl">
          How it works
        </h1>
        <p className="mt-4 text-base text-neutral-500">
          Claude skills give Claude deep knowledge of a specific tool or API — loaded automatically at the start of every session.
        </p>
      </div>

      <div className="space-y-16">
        {STEPS.map((step) => (
          <div key={step.number} className="group">
            <div className="mb-4 flex items-center gap-3">
              <span className="font-mono text-xs font-semibold text-purple-500">{step.number}</span>
              <step.icon className="h-4 w-4 text-neutral-500" />
              <h2 className="text-base font-semibold text-neutral-100">{step.title}</h2>
            </div>
            <p className="mb-4 text-sm text-neutral-500 leading-relaxed">{step.description}</p>
            {step.demo}
          </div>
        ))}
      </div>

      <div className="mt-20 rounded-xl border border-purple-500/20 bg-purple-500/5 p-8 text-center">
        <p className="mb-2 text-base font-semibold text-neutral-100">Ready to build your first skill?</p>
        <p className="mb-6 text-sm text-neutral-500">Takes about 10 seconds. No account required.</p>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-500"
        >
          Generate a skill <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
