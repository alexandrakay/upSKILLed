import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { generate } from '../src/generate.js';

const VALID_RESPONSE = {
  skill: {
    name: 'github',
    description: 'GitHub API skill for managing repositories, issues, and pull requests.',
    capabilities: ['list repos', 'create issues', 'merge PRs'],
    markdownContent: '# GitHub Skill\n\nUse this skill to manage GitHub repos, issues, and PRs.',
  },
  config: {
    name: 'github',
    version: '1.0.0',
    service: 'github',
    auth: { type: 'bearer', header: 'Authorization', envVar: 'GITHUB_TOKEN' },
    baseUrl: 'https://api.github.com',
    tools: ['list_repos', 'create_issue', 'merge_pr'],
  },
  examples: [
    { prompt: 'List all open issues in my repo', description: 'Retrieves open issues with labels and assignees' },
    { prompt: 'Create a PR for feature/auth targeting main', description: 'Opens a draft PR with auto-assigned reviewers' },
    { prompt: 'Close all stale issues older than 30 days', description: 'Batch-closes and comments on stale issues' },
    { prompt: 'Generate a release summary for v1.2.0', description: 'Aggregates merged PRs since the last tag' },
    { prompt: 'Add the "bug" label to all issues mentioning crash', description: 'Searches and labels matching issues' },
  ],
};

function mockClient(responseText) {
  return {
    messages: {
      create: async () => ({
        content: [{ type: 'text', text: responseText }],
      }),
    },
  };
}

test('throws when --use is missing', async () => {
  await assert.rejects(
    () => generate({ path: 'service', input: 'github' }, { client: mockClient('') }),
    /--use is required/
  );
});

test('throws when no input path is specified', async () => {
  await assert.rejects(
    () => generate({ useCase: 'manage issues' }, { client: mockClient('') }),
    /specify one of/
  );
});

test('throws when API key is missing', async () => {
  const saved = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  try {
    await assert.rejects(
      () => generate({ path: 'service', input: 'github', useCase: 'manage issues' }),
      /Set ANTHROPIC_API_KEY or use --key flag/
    );
  } finally {
    if (saved !== undefined) process.env.ANTHROPIC_API_KEY = saved;
  }
});

test('writes 3 files to output directory', async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'upskilled-test-'));
  const client = mockClient(JSON.stringify(VALID_RESPONSE));

  await generate(
    { path: 'service', input: 'github', useCase: 'manage issues', output: outDir, apiKey: 'test-key' },
    { client }
  );

  const files = await readdir(outDir);
  assert.ok(files.includes('github-skill.md'), 'missing github-skill.md');
  assert.ok(files.includes('github-config.json'), 'missing github-config.json');
  assert.ok(files.includes('github-examples.md'), 'missing github-examples.md');
});

test('--name overrides the file prefix', async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'upskilled-test-'));
  const client = mockClient(JSON.stringify(VALID_RESPONSE));

  await generate(
    { path: 'service', input: 'github', useCase: 'manage issues', output: outDir, name: 'my-skill', apiKey: 'test-key' },
    { client }
  );

  const files = await readdir(outDir);
  assert.ok(files.includes('my-skill-skill.md'), 'missing my-skill-skill.md');
  assert.ok(files.includes('my-skill-config.json'), 'missing my-skill-config.json');
  assert.ok(files.includes('my-skill-examples.md'), 'missing my-skill-examples.md');
});

test('config.json is valid JSON with required fields', async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'upskilled-test-'));
  const client = mockClient(JSON.stringify(VALID_RESPONSE));

  await generate(
    { path: 'service', input: 'github', useCase: 'manage issues', output: outDir, apiKey: 'test-key' },
    { client }
  );

  const raw = await readFile(join(outDir, 'github-config.json'), 'utf8');
  const config = JSON.parse(raw);
  assert.ok(config.name, 'config missing name');
  assert.ok(config.version, 'config missing version');
  assert.ok(config.baseUrl, 'config missing baseUrl');
});

test('examples.md contains at least 5 prompts', async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'upskilled-test-'));
  const client = mockClient(JSON.stringify(VALID_RESPONSE));

  await generate(
    { path: 'service', input: 'github', useCase: 'manage issues', output: outDir, apiKey: 'test-key' },
    { client }
  );

  const content = await readFile(join(outDir, 'github-examples.md'), 'utf8');
  const promptCount = (content.match(/^###?\s+/gm) || []).length;
  assert.ok(promptCount >= 5, `expected ≥5 prompts, got ${promptCount}`);
});

test('jsonrepair fallback handles fence-wrapped response', async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'upskilled-test-'));
  const fenced = '```json\n' + JSON.stringify(VALID_RESPONSE) + '\n```';
  const client = mockClient(fenced);

  await generate(
    { path: 'service', input: 'github', useCase: 'manage issues', output: outDir, apiKey: 'test-key' },
    { client }
  );

  const files = await readdir(outDir);
  assert.ok(files.includes('github-skill.md'));
});
