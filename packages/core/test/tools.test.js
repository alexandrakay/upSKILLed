import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { generate } from '../src/generate.js';
import { getService } from '../src/services.js';
import { getTool } from '../src/tools.js';
import { buildToolPrompt, buildDescribePrompt, buildHelpPrompt } from '../src/prompts.js';

const VALID_RESPONSE = JSON.stringify({
  skill: {
    name: 'ffuf',
    description: 'ffuf is a fast web fuzzer.',
    capabilities: ['fuzz URLs', 'filter by status code'],
    markdownContent: '# ffuf Skill\n\nUse this skill to fuzz web endpoints.',
  },
  config: {
    name: 'ffuf',
    version: '1.0.0',
    service: 'ffuf',
    auth: { type: 'none' },
    baseUrl: 'local',
    tools: [{ name: 'fuzz_url', description: 'Fuzz a URL', parameters: {} }],
  },
  examples: [
    { prompt: 'Fuzz /api for hidden endpoints', description: 'Directory fuzzing' },
    { prompt: 'Find hidden subdomains', description: 'Subdomain enumeration' },
    { prompt: 'Test for backup files', description: 'Extension fuzzing' },
    { prompt: 'Fuzz with a custom wordlist', description: 'Custom wordlist' },
    { prompt: 'Filter out 404 responses', description: 'Status filtering' },
  ],
});

function mockClient(responseText) {
  return {
    messages: {
      create: async () => ({
        content: [{ type: 'text', text: responseText }],
      }),
    },
  };
}

// ── Tool definitions ─────────────────────────────────────────────────────────

test('getTool throws on unknown tool', () => {
  assert.throws(() => getTool('badtool'), /Unknown tool/);
});

test('getTool returns definition for each of the 8 tools', () => {
  const tools = ['ffuf', 'nmap', 'gobuster', 'sqlmap', 'burpsuite', 'gh', 'vercel', 'stripe'];
  for (const t of tools) {
    const def = getTool(t);
    assert.ok(def.displayName, `${t} missing displayName`);
    assert.ok(def.description, `${t} missing description`);
    assert.ok(Array.isArray(def.capabilities), `${t} missing capabilities`);
    assert.ok(def.capabilities.length >= 8, `${t} needs ≥8 capabilities`);
  }
});

// ── Prompt builders ───────────────────────────────────────────────────────────

test('buildToolPrompt includes tool name and use case', () => {
  const { systemPrompt, userMessage } = buildToolPrompt('ffuf', 'fuzz web directories');
  assert.ok(systemPrompt.length > 100, 'systemPrompt too short');
  assert.ok(userMessage.includes('ffuf'), 'userMessage missing tool name');
  assert.ok(userMessage.includes('fuzz web directories'), 'userMessage missing use case');
});

test('buildDescribePrompt includes description and use case', () => {
  const { systemPrompt, userMessage } = buildDescribePrompt('a REST API for sending SMS', 'send alerts');
  assert.ok(userMessage.includes('a REST API for sending SMS'));
  assert.ok(userMessage.includes('send alerts'));
});

test('buildHelpPrompt includes help text and use case', () => {
  const helpText = 'Usage: ffuf [options]\n  -u  target URL';
  const { userMessage } = buildHelpPrompt(helpText, 'directory fuzzing');
  assert.ok(userMessage.includes(helpText));
  assert.ok(userMessage.includes('directory fuzzing'));
});

test('buildHelpPrompt truncates input over 32KB', () => {
  const bigHelp = 'x'.repeat(40 * 1024);
  const { userMessage } = buildHelpPrompt(bigHelp, 'test');
  const MAX = 32 * 1024;
  assert.ok(userMessage.length < bigHelp.length + 500, 'should be shorter than original');
  assert.ok(!userMessage.includes(bigHelp), 'should not contain full input');
  const contained = userMessage.includes('x'.repeat(MAX));
  assert.ok(contained, 'should contain first 32KB of input');
});

// ── Tool path generation ──────────────────────────────────────────────────────

test('tool path writes 3 files', async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'upskilled-test-'));
  await generate(
    { path: 'tool', input: 'ffuf', useCase: 'fuzz web directories', output: outDir, apiKey: 'test-key' },
    { client: mockClient(VALID_RESPONSE) }
  );
  const files = await readdir(outDir);
  assert.ok(files.includes('ffuf-skill.md'));
  assert.ok(files.includes('ffuf-config.json'));
  assert.ok(files.includes('ffuf-examples.md'));
});

test('custom-describe path writes 3 files', async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'upskilled-test-'));
  await generate(
    { path: 'custom-describe', input: 'a REST API for SMS', useCase: 'send alerts', output: outDir, apiKey: 'test-key' },
    { client: mockClient(VALID_RESPONSE) }
  );
  const files = await readdir(outDir);
  assert.equal(files.length, 3);
});

test('custom-help path writes 3 files', async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'upskilled-test-'));
  await generate(
    { path: 'custom-help', input: 'Usage: ffuf [options]\n  -u  URL', useCase: 'fuzz', output: outDir, apiKey: 'test-key' },
    { client: mockClient(VALID_RESPONSE) }
  );
  const files = await readdir(outDir);
  assert.equal(files.length, 3);
});

test('custom-help-file path reads file and writes 3 files', async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'upskilled-test-'));
  const helpFile = join(outDir, 'help.txt');
  await writeFile(helpFile, 'Usage: ffuf [options]\n  -u  URL');

  await generate(
    { path: 'custom-help-file', input: helpFile, useCase: 'fuzz', output: outDir, apiKey: 'test-key' },
    { client: mockClient(VALID_RESPONSE) }
  );
  const files = (await readdir(outDir)).filter((f) => f !== 'help.txt');
  assert.equal(files.length, 3);
});
