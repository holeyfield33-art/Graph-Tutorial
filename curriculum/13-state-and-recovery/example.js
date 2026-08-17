#!/usr/bin/env node
/**
 * State and recovery: a multi-step run that checkpoints progress to
 * state.json after each step. If the process is interrupted partway
 * through, running it again picks up where it left off instead of
 * repeating already-completed work.
 *
 * Run:              node example.js                  (normal run, resumes if state.json exists)
 * Simulate a crash:  node example.js --crash-after=2  (does step 1-2, then exits like a crash)
 * Reset:             node example.js --reset          (delete state.json, start over)
 *
 * Try this sequence:
 *   node example.js --reset
 *   node example.js --crash-after=2
 *   node example.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const STATE_FILE = path.join(__dirname, 'state.json');
const RESULT_FILE = path.join(__dirname, 'result.json');
const RUN_ID = 'demo-run';

function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    return { run_id: RUN_ID, steps: {} };
  }
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n');
}

function stepDone(state, nodeId) {
  return state.steps[nodeId]?.status === 'done';
}

function markDone(state, nodeId, evidence) {
  state.steps[nodeId] = { status: 'done', attempt: (state.steps[nodeId]?.attempt || 0) + 1, evidence };
  saveState(state);
}

// Step 1: fetch. No file side effect — safe to redo, but we skip it anyway
// if state already says it's done, so we never do unnecessary work either.
function fetchData() {
  console.log('[fetch] fetching...');
  return { raw: [1, 2, 3, 4, 5] };
}

// Step 2: transform. Writes result.json by OVERWRITING — idempotent. Run it
// five times with the same input, you get the same file every time.
function transform(raw) {
  console.log('[transform] transforming (idempotent: overwrites, never appends)...');
  const result = { sum: raw.reduce((a, b) => a + b, 0) };
  fs.writeFileSync(RESULT_FILE, JSON.stringify(result, null, 2) + '\n');
  return result;
}

// Step 3: publish. In a real system this might call an external API — the
// kind of side effect that's NOT automatically safe to repeat. We treat it
// as done-once via state, specifically because it is not naturally idempotent.
function publish(result) {
  console.log(`[publish] publishing sum=${result.sum} (this step must NOT run twice — see the lesson)`);
  return { published_sum: result.sum };
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--reset')) {
    fs.rmSync(STATE_FILE, { force: true });
    fs.rmSync(RESULT_FILE, { force: true });
    console.log('state reset.');
    return;
  }
  const crashAfterArg = args.find((a) => a.startsWith('--crash-after='));
  const crashAfter = crashAfterArg ? Number(crashAfterArg.split('=')[1]) : null;

  const state = loadState();
  let raw, result;

  if (stepDone(state, 'fetch')) {
    console.log('[fetch] already done — skipping (resumed from state.json)');
    raw = state.steps.fetch.evidence.raw;
  } else {
    raw = fetchData().raw;
    markDone(state, 'fetch', { raw });
  }
  if (crashAfter === 1) {
    console.log('\n--- simulated crash after step 1 ---');
    process.exit(1);
  }

  if (stepDone(state, 'transform')) {
    console.log('[transform] already done — skipping (resumed from state.json)');
    result = state.steps.transform.evidence;
  } else {
    result = transform(raw);
    markDone(state, 'transform', result);
  }
  if (crashAfter === 2) {
    console.log('\n--- simulated crash after step 2 ---');
    process.exit(1);
  }

  if (stepDone(state, 'publish')) {
    console.log('[publish] already done — skipping (resumed from state.json). This is the important one: without this check, a resumed run would publish a second time.');
  } else {
    const published = publish(result);
    markDone(state, 'publish', published);
  }

  console.log('\nrun complete. final state:');
  console.log(JSON.stringify(state, null, 2));
}

main();
