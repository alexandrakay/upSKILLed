import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getSourceLabel, getRelativeDate } from '../lib/skills-utils.ts';

// ── getSourceLabel ────────────────────────────────────────────────────────────

test('getSourceLabel returns capitalised input for service path', () => {
  assert.equal(getSourceLabel('service', 'github'), 'github');
});

test('getSourceLabel returns input for tool path', () => {
  assert.equal(getSourceLabel('tool', 'nmap'), 'nmap');
});

test('getSourceLabel returns "Custom" for custom-describe path', () => {
  assert.equal(getSourceLabel('custom-describe', 'some long description'), 'Custom');
});

test('getSourceLabel returns "Custom" for custom-help path', () => {
  assert.equal(getSourceLabel('custom-help', '--help output here'), 'Custom');
});

// ── getRelativeDate ───────────────────────────────────────────────────────────

test('getRelativeDate returns "just now" for less than 60 seconds ago', () => {
  const d = new Date(Date.now() - 30_000);
  assert.equal(getRelativeDate(d), 'just now');
});

test('getRelativeDate returns minutes ago', () => {
  const d = new Date(Date.now() - 5 * 60_000);
  assert.equal(getRelativeDate(d), '5 minutes ago');
});

test('getRelativeDate returns "1 minute ago" for singular', () => {
  const d = new Date(Date.now() - 90_000);
  assert.equal(getRelativeDate(d), '1 minute ago');
});

test('getRelativeDate returns hours ago', () => {
  const d = new Date(Date.now() - 3 * 3_600_000);
  assert.equal(getRelativeDate(d), '3 hours ago');
});

test('getRelativeDate returns "1 hour ago" for singular', () => {
  const d = new Date(Date.now() - 90 * 60_000);
  assert.equal(getRelativeDate(d), '1 hour ago');
});

test('getRelativeDate returns days ago', () => {
  const d = new Date(Date.now() - 2 * 86_400_000);
  assert.equal(getRelativeDate(d), '2 days ago');
});

test('getRelativeDate returns "yesterday" for 1 day ago', () => {
  const d = new Date(Date.now() - 86_400_000);
  assert.equal(getRelativeDate(d), 'yesterday');
});
