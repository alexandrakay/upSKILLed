import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getLocalUsage,
  incrementLocalUsage,
  buildFilenames,
  parseSSEBuffer,
  loadLastGeneration,
  saveLastGeneration,
  type GenerateOutput,
} from '../lib/generate-logic.ts';

// ── localStorage mock ─────────────────────────────────────────────────────────

const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, val: string) => { store[key] = val; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => Object.keys(store).forEach((k) => delete store[k]),
};
(globalThis as any).localStorage = localStorageMock;

// ── Usage counter ─────────────────────────────────────────────────────────────

test('getLocalUsage returns 0 when no data exists', () => {
  localStorageMock.clear();
  const { count } = getLocalUsage();
  assert.equal(count, 0);
});

test('incrementLocalUsage increments count', () => {
  localStorageMock.clear();
  const { count: c1 } = incrementLocalUsage();
  assert.equal(c1, 1);
  const { count: c2 } = incrementLocalUsage();
  assert.equal(c2, 2);
  const { count: c3 } = incrementLocalUsage();
  assert.equal(c3, 3);
});

test('incrementLocalUsage resets when date changes', () => {
  localStorageMock.clear();
  // Simulate yesterday's data
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  localStorageMock.setItem('upskilled:usage', JSON.stringify({
    date: yesterday.toDateString(),
    count: 3,
  }));
  const { count } = incrementLocalUsage();
  assert.equal(count, 1);
});

test('getLocalUsage returns 0 when stored date is yesterday', () => {
  localStorageMock.clear();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  localStorageMock.setItem('upskilled:usage', JSON.stringify({
    date: yesterday.toDateString(),
    count: 3,
  }));
  const { count } = getLocalUsage();
  assert.equal(count, 0);
});

// ── SSE buffer parser ─────────────────────────────────────────────────────────

test('parseSSEBuffer returns result payload from incomplete buffer (no trailing \\n\\n)', () => {
  const output: GenerateOutput = { name: 'github', skillContent: '# skill', configContent: '{}', examplesContent: '# ex' };
  const buffer = `data: ${JSON.stringify(output)}`;
  const event = parseSSEBuffer(buffer);
  assert.equal(event?.type, 'result');
  assert.deepEqual(event?.payload, output);
});

test('parseSSEBuffer skips delta events and returns result', () => {
  const output: GenerateOutput = { name: 'github', skillContent: '# skill', configContent: '{}', examplesContent: '# ex' };
  const buffer = `data: {"delta":"token1"}\n\ndata: {"delta":"token2"}\n\ndata: ${JSON.stringify(output)}`;
  const event = parseSSEBuffer(buffer);
  assert.equal(event?.type, 'result');
  assert.deepEqual(event?.payload, output);
});

test('parseSSEBuffer returns error payload', () => {
  const buffer = `data: {"error":"Rate limit exceeded","status":429}`;
  const event = parseSSEBuffer(buffer);
  assert.equal(event?.type, 'error');
  assert.equal(event?.payload.status, 429);
});

test('parseSSEBuffer returns null for empty buffer', () => {
  assert.equal(parseSSEBuffer(''), null);
});

// ── loadLastGeneration validation ────────────────────────────────────────────

test('loadLastGeneration returns null when cache has name "undefined"', () => {
  localStorageMock.clear();
  localStorageMock.setItem('upskilled:last-generation', JSON.stringify({
    name: 'undefined',
    skillContent: '',
    configContent: '{}',
    examplesContent: '',
  }));
  assert.equal(loadLastGeneration(), null);
});

test('loadLastGeneration returns null when cache has empty name', () => {
  localStorageMock.clear();
  localStorageMock.setItem('upskilled:last-generation', JSON.stringify({
    name: '',
    skillContent: '# skill',
    configContent: '{}',
    examplesContent: '# ex',
  }));
  assert.equal(loadLastGeneration(), null);
});

test('loadLastGeneration returns null when cache has no name field', () => {
  localStorageMock.clear();
  localStorageMock.setItem('upskilled:last-generation', JSON.stringify({
    skillContent: '# skill',
    configContent: '{}',
    examplesContent: '# ex',
  }));
  assert.equal(loadLastGeneration(), null);
});

test('loadLastGeneration returns valid entry unchanged', () => {
  localStorageMock.clear();
  const saved: GenerateOutput = { name: 'github', skillContent: '# s', configContent: '{}', examplesContent: '# e' };
  saveLastGeneration(saved);
  const loaded = loadLastGeneration();
  assert.deepEqual(loaded, saved);
});

// ── File name helpers ─────────────────────────────────────────────────────────

test('buildFilenames returns 3 correctly named files', () => {
  const output: GenerateOutput = {
    name: 'github',
    skillContent: '# skill',
    configContent: '{}',
    examplesContent: '# examples',
  };
  const names = buildFilenames(output);
  assert.equal(names.skill, 'github-skill.md');
  assert.equal(names.config, 'github-config.json');
  assert.equal(names.examples, 'github-examples.md');
});
