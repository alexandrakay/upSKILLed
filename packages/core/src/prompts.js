import { getService } from './services.js';

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
