#!/usr/bin/env node
/**
 * A rework loop: BUILD -> VERIFY, and if VERIFY fails, go back to BUILD
 * instead of stopping — up to a maximum number of attempts.
 *
 * Run: node example.js
 */

'use strict';

const MAX_ATTEMPTS = 5;

function build(attempt) {
  // Simulates a Writer that gets a little better each retry. Deterministic
  // (not random) on purpose, so this example behaves the same every time.
  const quality = attempt; // attempt 1 = quality 1, attempt 2 = quality 2, ...
  console.log(`[build] attempt ${attempt}: producing a draft (quality=${quality})`);
  return { quality };
}

function verify(state) {
  const passed = state.quality >= 3; // arbitrary bar: needs quality 3+ to pass
  console.log(`[verify] checking draft (quality=${state.quality}) -> ${passed ? 'PASS' : 'FAIL'}`);
  return passed;
}

function main() {
  console.log('--- rework loop: BUILD -> VERIFY -> (loop back on FAIL) ---');

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const state = build(attempt);
    const ok = verify(state);

    if (ok) {
      console.log(`\nPASS after ${attempt} attempt(s). Loop ends.`);
      return;
    }
    console.log('  -> not good enough yet, looping back to BUILD\n');
  }

  console.log(`\nGave up after ${MAX_ATTEMPTS} attempts without a PASS.`);
  console.log('A real graph should stop here, not loop forever — see docs/SAFETY.md.');
}

main();
