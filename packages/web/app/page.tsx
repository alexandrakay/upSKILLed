"use client";

import { useState } from "react";
import Link from "next/link";
import { Terminal, Sparkles, Check, Copy, ArrowRight, Download, FolderOpen, MessageSquare } from "lucide-react";
import { SERVICES, TOOLS } from "@/lib/catalog";

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
          className="flex items-center justify-center rounded-md border border-white/[0.06] bg-white/[0.03] p-2.5 transition-colors hover:border-purple-500/20 hover:bg-purple-500/5"
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
          className="flex flex-col items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.03] p-2.5 transition-colors hover:border-purple-500/20 hover:bg-purple-500/5"
        >
          <Terminal className="h-3.5 w-3.5 text-neutral-500" />
          <span className="truncate text-[10px] text-neutral-600 w-full text-center">{tool.label}</span>
        </div>
      ))}
    </div>
  );
}

const STATS = [
  { label: "API services", value: "10" },
  { label: "CLI tools", value: "8" },
  { label: "Files generated", value: "3" },
  { label: "Seconds to skill", value: "~10" },
];

const HOW_IT_WORKS = [
  { icon: Sparkles, step: "01", title: "Generate", desc: "Pick a service, tool, or describe your own." },
  { icon: FolderOpen, step: "02", title: "Add to project", desc: "Reference skill.md from your CLAUDE.md." },
  { icon: MessageSquare, step: "03", title: "Claude knows it", desc: "Loaded automatically every session." },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 pb-24 pt-20 sm:pt-28">

      {/* Hero */}
      <div className="relative mb-20 flex flex-col gap-6">
        {/* Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-purple-600/20 blur-3xl" />

        <div className="inline-flex self-start items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_6px_#4ade80]" />
          Now live on npm
        </div>

        <h1 className="text-[clamp(2.8rem,9vw,4.5rem)] font-bold leading-[1.05] tracking-tight text-neutral-100">
          Claude,{" "}
          <span className="bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
            upSKILLed.
          </span>
        </h1>

        <p className="text-xl text-neutral-400 leading-relaxed max-w-lg">
          Generate Claude skill files for any API or CLI tool — in seconds.
        </p>

        <p className="text-[0.95rem] text-neutral-600 leading-relaxed max-w-lg">
          Pick a service, pick a tool, or paste your{" "}
          <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.82em] text-neutral-400">--help</code>{" "}
          output. Get a production-ready skill package:{" "}
          <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.82em] text-neutral-400">skill.md</code>,{" "}
          <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.82em] text-neutral-400">config.json</code>,{" "}
          and{" "}
          <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[0.82em] text-neutral-400">examples.md</code>.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition-colors hover:bg-purple-500"
          >
            Try the web app <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="https://github.com/alexandrakay/upSKILLed"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-neutral-300 transition-colors hover:bg-white/[0.08]"
          >
            GitHub
          </a>
        </div>
      </div>

      {/* Stats strip */}
      <div className="mb-20 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STATS.map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] py-4"
          >
            <span className="text-2xl font-bold text-purple-400">{value}</span>
            <span className="text-xs text-neutral-600">{label}</span>
          </div>
        ))}
      </div>

      {/* Category cards */}
      <div className="mb-20 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="group flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 transition-colors hover:border-purple-500/20 hover:bg-purple-500/[0.03]">
          <div>
            <p className="text-sm font-semibold text-neutral-200">API Services</p>
            <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
              10 popular APIs with pre-loaded context — endpoints, auth, and capabilities.
            </p>
          </div>
          <ServiceLogoGrid />
        </div>

        <div className="group flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 transition-colors hover:border-purple-500/20 hover:bg-purple-500/[0.03]">
          <div>
            <p className="text-sm font-semibold text-neutral-200">CLI Tools</p>
            <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
              8 security and DevOps tools with flag context and domain expertise baked in.
            </p>
          </div>
          <ToolIconGrid />
        </div>

        <div className="group flex flex-col gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 transition-colors hover:border-purple-500/20 hover:bg-purple-500/[0.03]">
          <div>
            <p className="text-sm font-semibold text-neutral-200">Custom</p>
            <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
              Describe any tool in plain English — or paste{" "}
              <code className="rounded bg-white/[0.06] px-1 font-mono text-[0.85em] text-neutral-400">--help</code>{" "}
              output. Any CLI ever made, supported instantly.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 transition-colors group-hover:border-white/10">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-purple-400" />
              <span className="text-xs text-neutral-500">Describe it in plain English</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-md border border-white/[0.06] bg-white/[0.03] px-3 py-2.5 transition-colors group-hover:border-white/10">
              <Terminal className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
              <span className="font-mono text-xs text-neutral-500">Paste --help output</span>
            </div>
          </div>
        </div>
      </div>

      {/* How it works teaser */}
      <div className="mb-20 rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-200">How it works</p>
          <Link href="/how-it-works" className="text-xs text-neutral-500 transition-colors hover:text-purple-400">
            See full walkthrough →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {HOW_IT_WORKS.map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-purple-500">{step}</span>
                <Icon className="h-3.5 w-3.5 text-neutral-500" />
                <span className="text-xs font-semibold text-neutral-300">{title}</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CLI install */}
      <div className="mb-16">
        <div className="mb-3 flex items-center gap-2">
          <Download className="h-3.5 w-3.5 text-neutral-600" />
          <p className="text-xs font-medium uppercase tracking-widest text-neutral-600">
            Install the CLI
          </p>
        </div>
        <CopySnippet />
        <p className="mt-2 text-xs text-neutral-700">
          v1.0.1 · Node.js v18+ · Requires <code className="font-mono">ANTHROPIC_API_KEY</code>
        </p>
      </div>

      {/* Footer links */}
      <div className="flex flex-wrap gap-5 pt-2 border-t border-white/[0.06]">
        <Link href="/how-it-works" className="text-sm text-neutral-600 transition-colors hover:text-neutral-300">
          How it works →
        </Link>
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
