import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const exec = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const bin = join(__dirname, '..', 'bin', 'upskilled.js');
const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

test('--version prints package version', async () => {
  const { stdout } = await exec('node', [bin, '--version']);
  assert.equal(stdout.trim(), pkg.version);
});

test('--help lists all required flags', async () => {
  const { stdout } = await exec('node', [bin, '--help']);
  const flags = ['--service', '--tool', '--describe', '--help-output', '--help-file', '--use', '--output', '--name', '--key'];
  for (const flag of flags) {
    assert.ok(stdout.includes(flag), `missing flag: ${flag}`);
  }
});
