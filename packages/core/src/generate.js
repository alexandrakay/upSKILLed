import Anthropic from '@anthropic-ai/sdk';
import { readFile } from 'node:fs/promises';
import { buildServicePrompt, buildToolPrompt, buildDescribePrompt, buildHelpPrompt } from './prompts.js';
import { parseResponse } from './parse.js';
import { writeFiles, formatContent } from './write.js';

const MODEL = 'claude-sonnet-4-6';
const SCHEMA_REMINDER = '\n\nIMPORTANT: Respond with ONLY the JSON object. No markdown fences, no prose. Start with { and end with }.';

function validate(options) {
  if (!options.useCase) {
    throw new Error('--use is required');
  }
  if (!options.path) {
    throw new Error('specify one of --service, --tool, --describe, --help-output, or --help-file');
  }
}

function resolveApiKey(options) {
  const key = options.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error('Set ANTHROPIC_API_KEY or use --key flag');
  }
  return key;
}

function buildSystem(systemPrompt, systemContext) {
  const blocks = [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }];
  if (systemContext) {
    blocks.push({ type: 'text', text: systemContext, cache_control: { type: 'ephemeral' } });
  }
  return blocks;
}

async function callClaude(client, systemPrompt, systemContext, userMessage) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: buildSystem(systemPrompt, systemContext),
    messages: [{ role: 'user', content: userMessage }],
  });
  return response.content.find((b) => b.type === 'text')?.text ?? '';
}

async function callClaudeStream(client, systemPrompt, systemContext, userMessage, onDelta) {
  let text = '';
  const stream = client.messages.stream({
    model: MODEL,
    max_tokens: 4096,
    system: buildSystem(systemPrompt, systemContext),
    messages: [{ role: 'user', content: userMessage }],
  });
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
      text += chunk.delta.text;
      onDelta?.(chunk.delta.text);
    }
  }
  return text;
}

async function generateWithRetry(client, systemPrompt, systemContext, userMessage) {
  const raw = await callClaude(client, systemPrompt, systemContext, userMessage);
  try {
    return parseResponse(raw);
  } catch {
    const retryText = await callClaude(client, systemPrompt, systemContext, userMessage + SCHEMA_REMINDER);
    return parseResponse(retryText);
  }
}

async function buildPrompt(options) {
  switch (options.path) {
    case 'service':
      return buildServicePrompt(options.input, options.useCase);
    case 'tool':
      return buildToolPrompt(options.input, options.useCase);
    case 'custom-describe':
      return buildDescribePrompt(options.input, options.useCase);
    case 'custom-help':
      return buildHelpPrompt(options.input, options.useCase);
    case 'custom-help-file': {
      const helpText = await readFile(options.input, 'utf8');
      return buildHelpPrompt(helpText, options.useCase);
    }
    default:
      throw new Error(`Unknown path "${options.path}"`);
  }
}

export async function generate(options, { client } = {}) {
  validate(options);

  const apiKey = client ? null : resolveApiKey(options);
  const anthropicClient = client ?? new Anthropic({ apiKey });

  const { systemPrompt, systemContext, userMessage } = await buildPrompt(options);
  const result = await generateWithRetry(anthropicClient, systemPrompt, systemContext, userMessage);

  return writeFiles(result, { output: options.output, name: options.name });
}

// Streams tokens via onDelta as they arrive; returns formatted content when complete.
export async function streamContent(options, { client, onDelta } = {}) {
  validate(options);

  const apiKey = client ? null : resolveApiKey(options);
  const anthropicClient = client ?? new Anthropic({ apiKey });

  const { systemPrompt, systemContext, userMessage } = await buildPrompt(options);
  const raw = await callClaudeStream(anthropicClient, systemPrompt, systemContext, userMessage, onDelta);
  try {
    const parsed = parseResponse(raw);
    console.log('[core] parsed keys:', Object.keys(parsed), 'skill keys:', Object.keys(parsed.skill ?? {}), 'config.name:', parsed.config?.name);
    return formatContent(parsed, options.name);
  } catch (err) {
    console.error('[core] parse/format failed, retrying:', err?.message, '| raw length:', raw.length, '| raw start:', raw.slice(0, 100));
    const retryRaw = await callClaudeStream(anthropicClient, systemPrompt, systemContext, userMessage + SCHEMA_REMINDER, onDelta);
    return formatContent(parseResponse(retryRaw), options.name);
  }
}

// Returns content as strings instead of writing to disk — used by the web API route.
export async function generateContent(options, { client } = {}) {
  validate(options);

  const apiKey = client ? null : resolveApiKey(options);
  const anthropicClient = client ?? new Anthropic({ apiKey });

  const { systemPrompt, systemContext, userMessage } = await buildPrompt(options);
  const result = await generateWithRetry(anthropicClient, systemPrompt, systemContext, userMessage);

  return formatContent(result, options.name);
}
