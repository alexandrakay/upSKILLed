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

async function callClaude(client, systemPrompt, userMessage) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userMessage }],
  });
  return response.content.find((b) => b.type === 'text')?.text ?? '';
}

async function generateWithRetry(client, systemPrompt, userMessage) {
  const raw = await callClaude(client, systemPrompt, userMessage);
  try {
    return parseResponse(raw);
  } catch {
    const retryText = await callClaude(client, systemPrompt, userMessage + SCHEMA_REMINDER);
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

  const { systemPrompt, userMessage } = await buildPrompt(options);
  const result = await generateWithRetry(anthropicClient, systemPrompt, userMessage);

  return writeFiles(result, { output: options.output, name: options.name });
}

// Returns content as strings instead of writing to disk — used by the web API route.
export async function generateContent(options, { client } = {}) {
  validate(options);

  const apiKey = client ? null : resolveApiKey(options);
  const anthropicClient = client ?? new Anthropic({ apiKey });

  const { systemPrompt, userMessage } = await buildPrompt(options);
  const result = await generateWithRetry(anthropicClient, systemPrompt, userMessage);

  return formatContent(result, options.name);
}
