#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generate } from '@upskilled/core';

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
  .action(async (options) => {
    const path = options.service ? 'service'
      : options.tool ? 'tool'
      : options.describe ? 'custom-describe'
      : options.helpOutput ? 'custom-help'
      : options.helpFile ? 'custom-help-file'
      : null;

    const input = options.service || options.tool || options.describe || options.helpOutput || options.helpFile;

    try {
      const { prefix, outDir, files } = await generate({
        path,
        input,
        useCase: options.use,
        output: options.output,
        name: options.name,
        apiKey: options.key,
      });

      console.log(`\nGenerated skill package for: ${prefix}`);
      files.forEach((f) => console.log(`  → ${join(outDir, f)}`));
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  });

program.parse();
