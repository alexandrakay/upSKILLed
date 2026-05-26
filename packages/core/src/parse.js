import { jsonrepair } from 'jsonrepair';

export function parseResponse(text) {
  const stripped = stripCodeFence(text);
  try {
    return JSON.parse(stripped);
  } catch {
    // fall through to jsonrepair
  }
  try {
    return JSON.parse(jsonrepair(stripped));
  } catch {
    throw new Error('Failed to parse response JSON even after jsonrepair');
  }
}

function stripCodeFence(text) {
  return text
    .replace(/^```(?:json)?\s*\n?/m, '')
    .replace(/\n?```\s*$/m, '')
    .trim();
}
