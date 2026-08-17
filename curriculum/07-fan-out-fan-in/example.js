#!/usr/bin/env node
/**
 * Fan-out / fan-in: one task spreads out into several parallel checks
 * (fan-out), then a single synthesis node collects and combines all of
 * their results (fan-in).
 *
 * Run: node example.js
 */

'use strict';

function task() {
  console.log('[task] "Add a login form to the app"');
  return { task: 'Add a login form to the app' };
}

// --- fan-out: three branches, all reading the same task, none reading each other ---

async function checkSecurity(state) {
  console.log('[security] checking...');
  return { check: 'security', result: 'PASS', note: 'no plaintext password storage found' };
}

async function checkQuality(state) {
  console.log('[quality] checking...');
  return { check: 'quality', result: 'PASS', note: 'form has basic validation' };
}

async function checkStyle(state) {
  console.log('[style] checking...');
  return { check: 'style', result: 'FAIL', note: 'button color does not match design system' };
}

// --- fan-in: one node reads ALL three results together ---

function synthesize(results) {
  console.log('[synthesis] combining all check results...');
  const failed = results.filter((r) => r.result === 'FAIL');
  return {
    overall: failed.length === 0 ? 'PASS' : 'FAIL',
    failed_checks: failed.map((r) => r.check),
    all_results: results,
  };
}

async function main() {
  console.log('--- fan-out: task spreads into 3 parallel checks ---');
  const state = task();
  const results = await Promise.all([
    checkSecurity(state),
    checkQuality(state),
    checkStyle(state),
  ]);

  console.log('\n--- fan-in: synthesis waits for ALL 3, then combines them ---');
  const final = synthesize(results);

  console.log('\nfinal:', final);
}

main();
