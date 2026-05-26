import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleGenerate } from '../lib/generate-handler.ts';

// ── Mock helpers ──────────────────────────────────────────────────────────────

const VALID_CONTENT = {
  name: 'github',
  skillContent: '# GitHub Skill',
  configContent: '{"name":"github","version":"1.0.0","baseUrl":"https://api.github.com"}',
  examplesContent: '# GitHub Examples\n\n### 1. ...',
};

function makeDb(usageData: Record<string, any> = {}) {
  const store: Record<string, any> = { ...usageData };
  const logs: any[] = [];

  return {
    _logs: logs,
    runTransaction: async (fn: (tx: any) => Promise<any>) => {
      const doc = (id: string) => store[id];
      const tx = {
        get: async (ref: any) => ({
          exists: ref.id in store,
          data: () => store[ref.id],
        }),
        set: (_ref: any, data: any) => { store[_ref.id] = data; },
        update: (_ref: any, data: any) => { store[_ref.id] = { ...store[_ref.id], ...data }; },
      };
      return fn(tx);
    },
    collection: (name: string) => ({
      doc: (id: string) => ({ id, _col: name }),
      add: async (data: any) => { logs.push({ _col: name, ...data }); return { id: 'gen-1' }; },
    }),
  };
}

function makeGenerateContent(result = VALID_CONTENT) {
  return async (_opts: any) => result;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test('returns 400 when use is missing', async () => {
  const db = makeDb();
  const res = await handleGenerate(
    { path: 'service', input: 'github' } as any,
    { db, generateContent: makeGenerateContent(), getClientIP: () => '1.2.3.4', uid: null }
  );
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /use/i);
});

test('returns 400 for unrecognized path', async () => {
  const db = makeDb();
  const res = await handleGenerate(
    { path: 'bad-path', input: 'github', use: 'manage issues' } as any,
    { db, generateContent: makeGenerateContent(), getClientIP: () => '1.2.3.4', uid: null }
  );
  assert.equal(res.status, 400);
  const body = await res.json();
  assert.match(body.error, /path/i);
});

test('returns 429 when anonymous rate limit exceeded', async () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCHours(24, 0, 0, 0);

  const db = makeDb({
    'ip:1.2.3.4': {
      count: 3,
      resetAt: { toDate: () => tomorrow },
      lastGeneratedAt: { toDate: () => now },
    },
  });

  const res = await handleGenerate(
    { path: 'service', input: 'github', use: 'manage issues' },
    { db, generateContent: makeGenerateContent(), getClientIP: () => '1.2.3.4', uid: null }
  );
  assert.equal(res.status, 429);
  const body = await res.json();
  assert.ok(body.resetAt, 'missing resetAt in 429 response');
});

test('returns 200 with content fields on success', async () => {
  const db = makeDb();
  const res = await handleGenerate(
    { path: 'service', input: 'github', use: 'manage issues' },
    { db, generateContent: makeGenerateContent(), getClientIP: () => '1.2.3.4', uid: null }
  );
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.name, 'github');
  assert.ok(body.skillContent);
  assert.ok(body.configContent);
  assert.ok(body.examplesContent);
});

test('authenticated users bypass rate limit', async () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCHours(24, 0, 0, 0);

  // Exhausted anonymous limit — but uid is set, so should pass
  const db = makeDb({
    'uid:user-abc': {
      count: 999,
      resetAt: { toDate: () => tomorrow },
      lastGeneratedAt: { toDate: () => now },
    },
  });

  const res = await handleGenerate(
    { path: 'service', input: 'github', use: 'manage issues' },
    { db, generateContent: makeGenerateContent(), getClientIP: () => '1.2.3.4', uid: 'user-abc' }
  );
  assert.equal(res.status, 200);
});

test('generation is logged with uid:null for anonymous requests', async () => {
  const db = makeDb();
  await handleGenerate(
    { path: 'service', input: 'github', use: 'manage issues' },
    { db, generateContent: makeGenerateContent(), getClientIP: () => '1.2.3.4', uid: null }
  );
  assert.equal(db._logs.length, 1);
  assert.equal(db._logs[0].uid, null);
  assert.ok(!('ip' in db._logs[0]), 'IP must not be stored for anonymous generations');
});

test('generation is logged with uid for authenticated requests', async () => {
  const db = makeDb();
  await handleGenerate(
    { path: 'service', input: 'github', use: 'manage issues' },
    { db, generateContent: makeGenerateContent(), getClientIP: () => '1.2.3.4', uid: 'user-xyz' }
  );
  assert.equal(db._logs[0].uid, 'user-xyz');
});
