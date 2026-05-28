# upskilled

> Claude, upSKILLed.

Generate Claude skill files for any API or CLI tool — in seconds.

## What it does

`upskilled` generates a complete Claude skill package (3 files) from:

- A curated API service (GitHub, Notion, Slack, Linear, Stripe, and more)
- A curated CLI tool (ffuf, nmap, gobuster, sqlmap, gh cli, and more)
- A plain English description of any tool or API
- Raw `--help` output from any CLI tool

## Installation

```bash
npm install -g upskilled
```

## Usage

```bash
upskilled --service github --use "manage issues and PRs"
upskilled --tool ffuf --use "fuzz web directories during recon"
upskilled --describe "a REST API for sending SMS" --use "send build alerts"
upskilled --help-output "$(ffuf --help)" --use "directory fuzzing"
```

## Output

Every generation produces 3 files:

- `{name}-skill.md` — Claude skill file, ready to use in any Claude project
- `{name}-config.json` — Service configuration
- `{name}-examples.md` — 5–10 example prompts

## Using your skill with Claude

After generating, load the skill into any Claude project:

1. Place the downloaded files somewhere in your project (e.g. `.claude/skills/`)
2. Reference the skill in your project's `CLAUDE.md`:
   ```
   @.claude/skills/{name}-skill.md
   ```
3. Claude loads the skill automatically at the start of each session

The `skill.md` file is what Claude reads. `config.json` and `examples.md` are supplementary — keep them alongside it for reference.

## Requirements

- Node.js v18+
- `ANTHROPIC_API_KEY` environment variable
