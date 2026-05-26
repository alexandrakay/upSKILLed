#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

const program = new Command();

program
  .name('upskilled')
  .description('Generate Claude skill files for any API or CLI tool')
  .version(pkg.version)
  .option('--service <name>', 'curated API service (github, notion, slack, linear, stripe, jira, gmail, asana, vercel, figma)')
  .option('--tool <name>', 'curated CLI tool (ffuf, nmap, gobuster, sqlmap, burpsuite, gh, vercel, stripe)')
  .option('--describe <description>', 'plain English description of a service or tool')
  .option('--help-output <output>', "paste the tool's --help output (shell substitution)")
  .option('--help-file <path>', 'path to a file containing --help output (cross-platform alternative)')
  .option('--use <description>', 'what you want to do with the service/tool (required for generation)')
  .option('--output <dir>', 'output directory (default: current directory)')
  .option('--name <prefix>', 'override the inferred file name prefix')
  .option('--key <apiKey>', 'Anthropic API key (overrides ANTHROPIC_API_KEY env var)')
  .action(async (_options) => {
    // Generation logic implemented in issue #3
    console.error('upskilled: generation pipeline not yet implemented — coming in next release');
    process.exit(1);
  });

program.parse();
