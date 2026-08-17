#!/usr/bin/env node
/**
 * schema.test.js — guards the committed receipt fixtures against silent drift.
 *
 * The gate and the curriculum both depend on receipts having a stable shape.
 * If someone edits a demo receipt and drops a required field, this test fails
 * before a learner ever hits a confusing gate error. No network, no API key.
 *
 *     node tests/schema.test.js
 */

'use strict';

const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const REPO = path.resolve(__dirname, '..');

const WRITER_KEYS = ['agent', 'run_id', 'status', 'summary', 'files_touched', 'timestamp'];
const VERIFIER_KEYS = ['agent', 'run_id', 'status', 'checks', 'timestamp'];

let passed = 0;
let failed = 0;
function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok  ${name}`);
  } catch (e) {
    failed += 1;
    console.log(`FAIL  ${name}\n      ${e.message}`);
  }
}

function load(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

for (const base of ['01-claude-code', '02-openai-agents']) {
  for (const demo of ['demo-pass', 'demo-block', 'demo-freeze']) {
    const dir = path.join(REPO, base, 'runs', demo);

    test(`${base}/${demo} writer-receipt has required keys`, () => {
      const r = load(path.join(dir, 'writer-receipt.json'));
      assert.strictEqual(r.agent, 'writer');
      assert.strictEqual(r.run_id, demo, 'run_id must equal the run folder name');
      for (const k of WRITER_KEYS) assert.ok(k in r, `missing key: ${k}`);
      assert.ok(Array.isArray(r.files_touched));
    });

    test(`${base}/${demo} verifier-receipt has required keys`, () => {
      const r = load(path.join(dir, 'verifier-receipt.json'));
      assert.strictEqual(r.agent, 'verifier');
      assert.strictEqual(r.run_id, demo);
      for (const k of VERIFIER_KEYS) assert.ok(k in r, `missing key: ${k}`);
      assert.ok(Array.isArray(r.checks));
      for (const c of r.checks) {
        assert.ok(typeof c.name === 'string' && typeof c.result === 'string');
      }
    });
  }
}

console.log('');
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
