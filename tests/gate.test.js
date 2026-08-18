#!/usr/bin/env node
/**
 * gate.test.js — offline smoke tests for the deterministic gate.
 *
 * No API key, no network, no npm install. Just: does gate.js return the exit
 * code we promise, for each situation the course teaches? Run with:
 *
 *     node tests/gate.test.js
 *
 * If this ever goes red, the gate's behavior drifted from what the curriculum
 * says it does — which is exactly the early warning the audit asked for.
 */

'use strict';

const assert = require('node:assert');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const REPO = path.resolve(__dirname, '..');
const GATE = path.join(REPO, '01-claude-code', 'scripts', 'gate.js');

let passed = 0;
let failed = 0;

/** Run the gate on a run dir; return { code, out } without throwing. */
function runGate(runDir) {
  try {
    const out = execFileSync('node', [GATE, runDir], { encoding: 'utf8' });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status, out: String(e.stdout || '') };
  }
}

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok  ${name}`);
  } catch (e) {
    failed += 1;
    console.log(`FAIL  ${name}`);
    console.log(`      ${e.message}`);
  }
}

/** Build a throwaway run dir with the given receipts + optional workspace files.
 *  Each receipt body may be a value or a (runId) => value builder, so a test
 *  can stamp the just-created run's id into the receipt. */
function makeRun(receipts, files = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gate-run-'));
  const runId = path.basename(dir);
  for (const [name, raw] of Object.entries(receipts)) {
    const body = typeof raw === 'function' ? raw(runId) : raw;
    if (body === undefined) continue;
    const payload = typeof body === 'string' ? body : JSON.stringify(body, null, 2);
    fs.writeFileSync(path.join(dir, name), payload);
  }
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(dir, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
  }
  return { dir, runId };
}

function writer(over = {}) {
  return {
    agent: 'writer',
    status: 'PASS',
    summary: 'wrote a file',
    files_touched: ['workspace/hello.js'],
    ...over,
  };
}
function verifier(over = {}) {
  return {
    agent: 'verifier',
    status: 'PASS',
    checks: [{ name: 'files_exist', result: 'PASS', detail: 'read it' }],
    failures: [],
    ...over,
  };
}
const GOOD_FILES = { 'workspace/hello.js': 'module.exports = 1;\n' };

console.log('gate.js — committed demo fixtures');
for (const base of ['01-claude-code', '02-openai-agents']) {
  test(`${base}/demo-pass  -> PASS (exit 0)`, () => {
    assert.strictEqual(runGate(path.join(REPO, base, 'runs', 'demo-pass')).code, 0);
  });
  test(`${base}/demo-block -> BLOCK (exit 1)`, () => {
    assert.strictEqual(runGate(path.join(REPO, base, 'runs', 'demo-block')).code, 1);
  });
  test(`${base}/demo-freeze -> FREEZE (exit 2)`, () => {
    assert.strictEqual(runGate(path.join(REPO, base, 'runs', 'demo-freeze')).code, 2);
  });
}

console.log('gate.js — hardening invariants (synthetic runs)');

test('claimed file missing on disk -> FREEZE', () => {
  const { dir } = makeRun({
    'writer-receipt.json': (id) => writer({ run_id: id }),
    'verifier-receipt.json': (id) => verifier({ run_id: id }),
  }); // note: no workspace file written
  const r = runGate(dir);
  assert.strictEqual(r.code, 2, r.out);
  assert.match(r.out, /do not exist/);
});

test('claimed file empty on disk -> FREEZE', () => {
  const { dir } = makeRun(
    {
      'writer-receipt.json': (id) => writer({ run_id: id }),
      'verifier-receipt.json': (id) => verifier({ run_id: id }),
    },
    { 'workspace/hello.js': '' }
  );
  assert.strictEqual(runGate(dir).code, 2);
});

test('all claimed files present -> PASS', () => {
  const { dir } = makeRun(
    {
      'writer-receipt.json': (id) => writer({ run_id: id }),
      'verifier-receipt.json': (id) => verifier({ run_id: id }),
    },
    GOOD_FILES
  );
  assert.strictEqual(runGate(dir).code, 0);
});

test('forbidden path claim -> FREEZE (even if file absent)', () => {
  const { dir } = makeRun({
    'writer-receipt.json': (id) => writer({ run_id: id, files_touched: ['scripts/gate.js'] }),
    'verifier-receipt.json': (id) => verifier({ run_id: id }),
  });
  assert.strictEqual(runGate(dir).code, 2);
});

test('path traversal (..) -> FREEZE', () => {
  const { dir } = makeRun({
    'writer-receipt.json': (id) => writer({ run_id: id, files_touched: ['../escape.js'] }),
    'verifier-receipt.json': (id) => verifier({ run_id: id }),
  });
  assert.strictEqual(runGate(dir).code, 2);
});

test('run_id mismatch between receipt and dir -> FREEZE', () => {
  const { dir } = makeRun(
    {
      'writer-receipt.json': writer({ run_id: 'not-this-run' }),
      'verifier-receipt.json': verifier({ run_id: 'not-this-run' }),
    },
    GOOD_FILES
  );
  assert.strictEqual(runGate(dir).code, 2);
});

test('verifier PASS with zero checks -> BLOCK (no evidence)', () => {
  const { dir } = makeRun(
    {
      'writer-receipt.json': (id) => writer({ run_id: id }),
      'verifier-receipt.json': (id) => verifier({ run_id: id, checks: [] }),
    },
    GOOD_FILES
  );
  assert.strictEqual(runGate(dir).code, 1);
});

test('missing verifier receipt -> FREEZE', () => {
  const { dir } = makeRun(
    { 'writer-receipt.json': (id) => writer({ run_id: id }) },
    GOOD_FILES
  );
  assert.strictEqual(runGate(dir).code, 2);
});

test('invalid JSON in a receipt -> FREEZE', () => {
  const { dir } = makeRun(
    {
      'writer-receipt.json': '{ not json',
      'verifier-receipt.json': (id) => verifier({ run_id: id }),
    },
    GOOD_FILES
  );
  assert.strictEqual(runGate(dir).code, 2);
});

console.log('');
console.log(`${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
