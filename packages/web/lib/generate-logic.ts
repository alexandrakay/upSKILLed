const USAGE_KEY = 'upskilled:usage';
const LAST_GEN_KEY = 'upskilled:last-generation';
const DAILY_LIMIT = 3;

export type GenerateOutput = {
  name: string;
  skillContent: string;
  configContent: string;
  examplesContent: string;
};

export type UsageState = {
  count: number;
  date: string;
};

export function getLocalUsage(): UsageState {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (!raw) return { count: 0, date: new Date().toDateString() };
    const saved: UsageState = JSON.parse(raw);
    if (saved.date !== new Date().toDateString()) return { count: 0, date: new Date().toDateString() };
    return saved;
  } catch {
    return { count: 0, date: new Date().toDateString() };
  }
}

export function incrementLocalUsage(): UsageState {
  const current = getLocalUsage();
  const next: UsageState = { count: current.count + 1, date: new Date().toDateString() };
  try { localStorage.setItem(USAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  return next;
}

export function isRateLimited(usage: UsageState, uid: string | null): boolean {
  return !uid && usage.count >= DAILY_LIMIT;
}

export function saveLastGeneration(output: GenerateOutput): void {
  try { localStorage.setItem(LAST_GEN_KEY, JSON.stringify(output)); } catch { /* ignore */ }
}

export function loadLastGeneration(): GenerateOutput | null {
  try {
    const raw = localStorage.getItem(LAST_GEN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function buildFilenames(output: GenerateOutput) {
  return {
    skill: `${output.name}-skill.md`,
    config: `${output.name}-config.json`,
    examples: `${output.name}-examples.md`,
  };
}

export type SSEEvent =
  | { type: 'result'; payload: GenerateOutput }
  | { type: 'error'; payload: { error: string; status?: number } };

export function parseSSEBuffer(buffer: string): SSEEvent | null {
  for (const part of buffer.split('\n\n')) {
    if (!part.startsWith('data: ')) continue;
    let payload: any;
    try { payload = JSON.parse(part.slice(6)); } catch { continue; }
    if (payload.ping || payload.delta !== undefined) continue;
    if (payload.error) return { type: 'error', payload };
    return { type: 'result', payload };
  }
  return null;
}

export function downloadText(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
