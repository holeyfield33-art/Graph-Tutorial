#!/usr/bin/env node
/**
 * An unnecessary join: a 4th branch (Metrics) that nothing downstream
 * actually needs before deciding PASS/FAIL, joined anyway "for tidiness" —
 * and slow. Same mistake as chapter 04's fake chain dependency, but applied
 * to a join instead of a chain edge.
 *
 * Run: node unnecessary-join.js
 */

'use strict';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkSecurity() {
  await delay(200);
  return { check: 'security', result: 'PASS' };
}
async function checkQuality() {
  await delay(200);
  return { check: 'quality', result: 'PASS' };
}
async function checkStyle() {
  await delay(200);
  return { check: 'style', result: 'PASS' };
}
// Metrics is slow and its output isn't read by the release decision below —
// it's only useful for a dashboard someone checks later.
async function collectMetrics() {
  console.log('[metrics] this is slow and nothing release-critical reads it...');
  await delay(1500);
  return { check: 'metrics', result: 'INFO', detail: 'collected timing data' };
}

function decideRelease(results) {
  const failed = results.filter((r) => r.result === 'FAIL');
  return failed.length === 0 ? 'PASS' : 'FAIL';
}

async function withUnnecessaryJoin() {
  const start = Date.now();
  // BAD: waiting on Metrics before deciding release, even though the
  // decision never reads Metrics' result.
  const results = await Promise.all([
    checkSecurity(),
    checkQuality(),
    checkStyle(),
    collectMetrics(),
  ]);
  const decision = decideRelease(results.filter((r) => r.check !== 'metrics'));
  return { decision, ms: Date.now() - start };
}

async function withoutUnnecessaryJoin() {
  const start = Date.now();
  // GOOD: join only what the decision actually needs. Metrics still runs —
  // it's just not on the critical path.
  const releaseResults = await Promise.all([checkSecurity(), checkQuality(), checkStyle()]);
  const decision = decideRelease(releaseResults);
  collectMetrics().then((m) => console.log('[metrics] finished later:', m));
  return { decision, ms: Date.now() - start };
}

async function main() {
  console.log('--- joining on Metrics even though the decision never reads it ---');
  const a = await withUnnecessaryJoin();
  console.log(`decision: ${a.decision}, took ~${a.ms}ms\n`);

  console.log('--- only joining on what the decision actually needs ---');
  const b = await withoutUnnecessaryJoin();
  console.log(`decision: ${b.decision}, took ~${b.ms}ms (metrics keeps running in the background)`);
}

main();
