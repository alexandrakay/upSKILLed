import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getLocalUsage,
  incrementLocalUsage,
  buildFilenames,
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
