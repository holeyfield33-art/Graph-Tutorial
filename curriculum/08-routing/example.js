#!/usr/bin/env node
/**
 * Conditional routing: a CHECK node's result decides which of two different
 * next nodes actually runs.
 *
 * Run: node example.js pass
 * Run: node example.js fail
 */

'use strict';

function check(simulateResult) {
  console.log(`[check] evaluating... (simulated result: ${simulateResult})`);
  return simulateResult === 'pass' ? 'PASS' : 'FAIL';
}

// --- the two possible next nodes — only ONE of these runs per graph run ---

function onPass() {
  console.log('[route: PASS] shipping the result.');
}

function onFail() {
  console.log('[route: FAIL] sending back for rework.');
}

function main() {
  const arg = process.argv[2];
  if (arg !== 'pass' && arg !== 'fail') {
    console.error('Usage: node example.js <pass|fail>');
    process.exit(1);
  }

  console.log('--- conditional route: A -> CHECK -> (PASS branch) or (FAIL branch) ---');
  const result = check(arg);

  // This is the whole mechanism: one condition, two possible next nodes.
  if (result === 'PASS') {
    onPass();
  } else {
    onFail();
  }
}

main();
