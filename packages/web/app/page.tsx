"use client";

import { useState } from "react";
import Link from "next/link";

export default function ComingSoon() {
  const [copied, setCopied] = useState(false);
  const installCmd = "npm install -g upskilled";

  function copy() {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <div style={styles.badge}>Week 4 of 12</div>

        <h1 style={styles.headline}>
          Claude, <span style={styles.accent}>upSKILLed.</span>
        </h1>

        <p style={styles.tagline}>
          Generate Claude skill files for any API or CLI tool — in seconds.
        </p>

        <p style={styles.description}>
          Pick a service, pick a tool, or paste your <code style={styles.code}>--help</code> output.
          Get a production-ready Claude skill package: <code style={styles.code}>skill.md</code>,{" "}
          <code style={styles.code}>config.json</code>, and <code style={styles.code}>examples.md</code>.
        </p>

        <div style={styles.status}>
          <span style={styles.dot} />
          Now live
        </div>

        <Link href="/generate" style={styles.cta}>
          Try it →
        </Link>

        <div style={styles.installRow}>
          <div style={styles.installBox}>
            <span style={styles.prompt}>$</span>
            <span style={styles.installCmd}>{installCmd}</span>
          </div>
          <button style={styles.copyBtn} onClick={copy}>
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>

        <p style={styles.npmNote}>
          The package is live on npm now. The full CLI and web app are coming this week.
        </p>

        <div style={styles.links}>
          <a
            href="https://github.com/alexandrakay/upSKILLed"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            GitHub →
          </a>
          <a
            href="https://npmjs.com/package/upskilled"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            npm →
          </a>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
  },
  container: {
    maxWidth: "560px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  badge: {
    display: "inline-flex",
    alignSelf: "flex-start",
    fontSize: "0.75rem",
    fontWeight: 500,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#a855f7",
    background: "rgba(168,85,247,0.1)",
    border: "1px solid rgba(168,85,247,0.2)",
    borderRadius: "999px",
    padding: "0.25rem 0.75rem",
  },
  headline: {
    fontSize: "clamp(2.5rem, 8vw, 4rem)",
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
    color: "#f0f0f0",
  },
  accent: {
    color: "#a855f7",
  },
  tagline: {
    fontSize: "1.25rem",
    color: "#c0c0c0",
    lineHeight: 1.5,
    fontWeight: 400,
  },
  description: {
    fontSize: "0.95rem",
    color: "#888888",
    lineHeight: 1.7,
  },
  code: {
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    fontSize: "0.85em",
    color: "#c0c0c0",
    background: "#1a1a1a",
    padding: "0.1em 0.35em",
    borderRadius: "4px",
  },
  status: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.875rem",
    color: "#888888",
  },
  dot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 6px #22c55e",
    flexShrink: 0,
  },
  installRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  installBox: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    background: "#111111",
    border: "1px solid #222222",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    fontSize: "0.875rem",
    overflow: "hidden",
  },
  prompt: {
    color: "#a855f7",
    flexShrink: 0,
  },
  installCmd: {
    color: "#f0f0f0",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  copyBtn: {
    flexShrink: 0,
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: "8px",
    color: "#c0c0c0",
    fontSize: "0.8rem",
    fontWeight: 500,
    padding: "0.75rem 1rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.15s ease",
  },
  npmNote: {
    fontSize: "0.8rem",
    color: "#555",
    marginTop: "-0.5rem",
  },
  cta: {
    display: "inline-flex",
    alignSelf: "flex-start",
    background: "#a855f7",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.95rem",
    padding: "0.65rem 1.5rem",
    borderRadius: "8px",
    textDecoration: "none",
    transition: "background 0.15s ease",
  },
  links: {
    display: "flex",
    gap: "1.5rem",
    marginTop: "0.5rem",
  },
  link: {
    color: "#888",
    textDecoration: "none",
    fontSize: "0.875rem",
    transition: "color 0.15s ease",
  },
};
