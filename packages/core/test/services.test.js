import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getService } from '../src/services.js';

test('getService throws on unknown service', () => {
  assert.throws(() => getService('badservice'), /Unknown service/);
});

test('getService returns definition for all 18 services', () => {
  const services = [
    'github', 'notion', 'slack', 'linear', 'stripe', 'jira', 'gmail', 'asana', 'vercel', 'figma',
    'supabase', 'openai', 'twilio', 'huggingface', 'airtable', 'discord', 'hubspot', 'salesforce',
  ];
  for (const s of services) {
    const def = getService(s);
    assert.ok(def.displayName, `${s} missing displayName`);
    assert.ok(def.description, `${s} missing description`);
    assert.ok(def.baseUrl, `${s} missing baseUrl`);
    assert.ok(def.docsUrl, `${s} missing docsUrl`);
    assert.ok(Array.isArray(def.capabilities), `${s} missing capabilities`);
    assert.ok(def.capabilities.length >= 8, `${s} needs ≥8 capabilities, got ${def.capabilities.length}`);
  }
});
