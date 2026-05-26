"use client";

import { useState } from "react";
import Link from "next/link";
import { Terminal, Sparkles, Check, Copy } from "lucide-react";
import { SERVICES, TOOLS } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const installCmd = "npm install -g upskilled";

function CopySnippet() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 items-center gap-3 overflow-hidden rounded-lg border border-white/10 bg-[#111] px-4 py-3 font-mono text-sm">
        <span className="shrink-0 text-purple-400">$</span>
        <span className="truncate text-neutral-100">{installCmd}</span>
      </div>
      <button
        onClick={copy}
        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-3 text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-100"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

function ServiceLogoGrid() {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {SERVICES.map((svc) => (
        <div
          key={svc.id}
          title={svc.label}
          className="flex items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.03] p-2"
        >
          <svg
            role="img"
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill={`#${svc.icon.hex}`}
            aria-label={svc.label}
          >
            <path d={svc.icon.path} />
          </svg>
        </div>
      ))}
    </div>
  );
}

function ToolIconGrid() {
  return (
    <div className="grid grid-cols-4 gap-1.5">
      {TOOLS.map((tool) => (
        <div
          key={tool.id}
          className="flex flex-col items-center gap-1 rounded-md border border-white/[0.06] bg-white/[0.03] p-2"
        >
          <Terminal className="h-3.5 w-3.5 text-neutral-500" />
          <span className="truncate text-[10px] text-neutral-600 w-full text-center">{tool.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
      {/* Hero */}
      <div className="flex flex-col gap-5 mb-16">
        <div className="inline-flex self-start items-center rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-purple-400">
          Week 4 of 12
        </div>

        <h1 className="text-[clamp(2.5rem,8vw,4rem)] font-bold leading-[1.1] tracking-tight text-neutral-100">
          Claude,{" "}
          <span className="text-purple-400">upSKILLed.</span>
        </h1>

        <p className="text-xl text-neutral-400 leading-relaxed max-w-lg">
          Generate Claude skill files for any API or CLI tool — in seconds.
        </p>

        <p className="text-[0.95rem] text-neutral-600 leading-relaxed max-w-lg">
          Pick a service, pick a tool, or paste your{" "}
          <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.82em] text-neutral-400">--help</code>{" "}
          output. Get a production-ready Claude skill package:{" "}
          <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.82em] text-neutral-400">skill.md</code>,{" "}
          <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.82em] text-neutral-400">config.json</code>, and{" "}
          <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.82em] text-neutral-400">examples.md</code>.
        </p>

        <div className="flex items-center gap-2 text-sm text-neutral-500">
          <span className="h-2 w-2 shrink-0 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]" />
          Now live
        </div>

        <Link
          href="/generate"
          className="inline-flex self-start items-center rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-500"
        >
          Try it →
        </Link>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-16">
        {/* API Services */}
        <div className="flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
          <div>
            <p className="text-sm font-semibold text-neutral-200">API Services</p>
            <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
              10 popular APIs with pre-loaded context — endpoints, auth, and capabilities.
            </p>
          </div>
          <ServiceLogoGrid />
        </div>

        {/* CLI Tools */}
        <div className="flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
          <div>
            <p className="text-sm font-semibold text-neutral-200">CLI Tools</p>
            <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
              8 security and DevOps tools with flag context and domain expertise baked in.
            </p>
          </div>
          <ToolIconGrid />
        </div>

        {/* Custom */}
        <div className="flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
          <div>
            <p className="text-sm font-semibold text-neutral-200">Custom</p>
            <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
              Describe any tool in plain English — or paste{" "}
              <code className="rounded bg-white/[0.06] px-1 font-mono text-[0.85em] text-neutral-400">--help</code>{" "}
              output. Any CLI ever made, supported instantly.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-purple-400" />
              <span className="text-xs text-neutral-500">Describe it in plain English</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
              <Terminal className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
              <span className="font-mono text-xs text-neutral-500">Paste --help output</span>
            </div>
          </div>
        </div>
      </div>

      {/* npm install */}
      <div className="mb-6">
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-600">
          Install the CLI
        </p>
        <CopySnippet />
        <p className="mt-2 text-xs text-neutral-700">
          v1.0.0 on npm. Generates skill files directly to your project from the terminal.
        </p>
      </div>

      {/* Footer links */}
      <div className="flex gap-5 pt-2">
        <a
          href="https://github.com/alexandrakay/upSKILLed"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-neutral-600 transition-colors hover:text-neutral-300"
        >
          GitHub →
        </a>
        <a
          href="https://npmjs.com/package/upskilled"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-neutral-600 transition-colors hover:text-neutral-300"
        >
          npm →
        </a>
      </div>
    </main>
  );
}
