import { test } from 'node:test';
import assert from 'node:assert/strict';
import { wrapInSSE } from '../lib/stream-generate.ts';

async function readSSE(res: Response): Promise<string[]> {
  const text = await res.text();
  return text
    .split('\n\n')
    .filter((p) => p.startsWith('data: '))
    .map((p) => p.slice(6));
}

test('response has text/event-stream content type', async () => {
  const res = await wrapInSSE(() => Promise.resolve(Response.json({ name: 'test' })));
  assert.equal(res.headers.get('Content-Type'), 'text/event-stream');
});

test('wraps successful JSON response in data event', async () => {
  const payload = { name: 'github', skillContent: '# skill', configContent: '{}', examplesContent: '# ex' };
  const res = await wrapInSSE(() => Promise.resolve(Response.json(payload)));
  const events = await readSSE(res);
  assert.equal(events.length, 1);
  assert.deepEqual(JSON.parse(events[0]), payload);
});

test('wraps error response in data event with status field', async () => {
  const res = await wrapInSSE(() =>
    Promise.resolve(Response.json({ error: 'Rate limit exceeded' }, { status: 429 }))
  );
  const events = await readSSE(res);
  const data = JSON.parse(events[0]);
  assert.equal(data.error, 'Rate limit exceeded');
  assert.equal(data.status, 429);
});

test('wraps thrown error in data event', async () => {
  const res = await wrapInSSE(() => Promise.reject(new Error('boom')));
  const events = await readSSE(res);
  const data = JSON.parse(events[0]);
  assert.equal(data.error, 'boom');
  assert.equal(data.status, 500);
});

test('ping events are emitted as JSON data events not SSE comments', async () => {
  const res = await wrapInSSE(
    () => new Promise<Response>((resolve) => setTimeout(() => resolve(Response.json({ ok: true })), 20)),
    { pingIntervalMs: 1 }
  );
  const text = await res.text();
  const lines = text.split('\n\n').filter(Boolean);
  const comments = lines.filter((l) => l.startsWith(':'));
  assert.equal(comments.length, 0, 'should have no SSE comment lines');
  const pingEvents = lines
    .filter((l) => l.startsWith('data: '))
    .map((l) => JSON.parse(l.slice(6)))
    .filter((e) => e.ping === true);
  assert.ok(pingEvents.length >= 1, 'should have at least one ping data event');
});
