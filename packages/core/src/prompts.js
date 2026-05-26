import { getService } from './services.js';
import { getTool } from './tools.js';

const MAX_HELP_BYTES = 32 * 1024;

const SYSTEM_PROMPT = `You are an expert at creating Claude skill packages — structured files that help Claude understand and work with a specific API or CLI tool.

A skill package always contains exactly three files:
1. **skill.md** — A rich, descriptive document that Claude reads as context. It explains the service's purpose, authentication model, key capabilities, common patterns, and important gotchas.
2. **config.json** — A machine-readable configuration object that specifies the service name, version, auth type, base URL, and a list of tool definitions (functions Claude can call).
3. **examples.md** — 5-10 realistic, diverse example prompts that demonstrate how a developer would use this skill in their Claude project.

You MUST respond with a single JSON object in this exact schema — no prose, no explanation, just the JSON:

{
  "skill": {
    "name": "<lowercase-slug>",
    "description": "<one sentence>",
    "capabilities": ["<capability 1>", "...", "<capability N>"],
    "markdownContent": "<full markdown content for skill.md>"
  },
  "config": {
    "name": "<lowercase-slug>",
    "version": "1.0.0",
    "service": "<service-or-tool-name>",
    "auth": {
      "type": "<api_key|bearer|oauth2|basic>",
      "envVar": "<ENV_VAR_NAME>",
      "header": "<Authorization-Header-Name>"
    },
    "baseUrl": "<https://api.example.com>",
    "tools": [
      {
        "name": "<snake_case_function_name>",
        "description": "<what it does>",
        "parameters": { "<param>": "<type>" }
      }
    ]
  },
  "examples": [
    { "prompt": "<realistic user prompt>", "description": "<what it accomplishes>" }
  ]
}

Requirements:
- skill.md markdownContent must be rich and detailed (400+ words). Include: overview, auth setup, key capabilities, code examples for the 3 most common operations, error handling notes, and rate limiting info where relevant.
- config.json tools array must have 5-10 realistic tool definitions with descriptive names.
- examples array must have at least 5 diverse, realistic prompts a developer would actually type.
- All strings must be valid JSON (escape special characters properly).`;

export function buildServicePrompt(service, useCase) {
  const svc = getService(service);

  const serviceDefinition = `## Service: ${svc.displayName}

**Description**: ${svc.description}
**Base URL**: ${svc.baseUrl}
**Auth**: ${JSON.stringify(svc.auth)}
**Docs**: ${svc.docsUrl}

**Capabilities**:
${svc.capabilities.map((c) => `- ${c}`).join('\n')}

**Common use cases**: ${svc.useCases.join('; ')}`;

  const userMessage = `${serviceDefinition}

---

**Use case to optimize for**: ${useCase}

Generate a complete Claude skill package for ${svc.displayName}. The skill.md and config.json should be especially helpful for a developer who wants to: ${useCase}.`;

  return { systemPrompt: SYSTEM_PROMPT, userMessage };
}

export function buildToolPrompt(tool, useCase) {
  const t = getTool(tool);

  const toolDefinition = `## CLI Tool: ${t.displayName}

**Description**: ${t.description}
**Docs**: ${t.docsUrl}

**Common flags / subcommands**:
${t.commonFlags.map((f) => `  ${f}`).join('\n')}

**Capabilities**:
${t.capabilities.map((c) => `- ${c}`).join('\n')}

**Common use cases**: ${t.useCases.join('; ')}`;

  const userMessage = `${toolDefinition}

---

**Use case to optimize for**: ${useCase}

Generate a complete Claude skill package for ${t.displayName}. The skill.md should read like expert documentation a security professional or developer would reference while using ${t.displayName} to: ${useCase}.`;

  return { systemPrompt: SYSTEM_PROMPT, userMessage };
}

export function buildDescribePrompt(description, useCase) {
  const userMessage = `## Custom Service/Tool Description

${description}

---

**Use case to optimize for**: ${useCase}

Generate a complete Claude skill package based on the description above. Infer the authentication type, base URL patterns, and capabilities from the description. The skill should be optimized for a developer who wants to: ${useCase}.`;

  return { systemPrompt: SYSTEM_PROMPT, userMessage };
}

export function buildHelpPrompt(helpText, useCase) {
  let truncated = helpText;
  if (Buffer.byteLength(helpText, 'utf8') > MAX_HELP_BYTES) {
    truncated = helpText.slice(0, MAX_HELP_BYTES);
    process.stderr.write(`Warning: --help input exceeded 32KB and was truncated.\n`);
  }

  const userMessage = `## CLI Tool --help Output

\`\`\`
${truncated}
\`\`\`

---

**Use case to optimize for**: ${useCase}

Generate a complete Claude skill package based on the --help output above. Infer the tool name, purpose, authentication, and capabilities from the help text. The skill should be optimized for a developer who wants to: ${useCase}.`;

  return { systemPrompt: SYSTEM_PROMPT, userMessage };
}
