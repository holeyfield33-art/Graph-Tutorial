#!/usr/bin/env node
/**
 * Parallel nodes: three independent "checks" that don't need each other's
 * output, run at the same time instead of one after another.
 *
 * Run: node example.js
 */

'use strict';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkSecurity() {
  console.log('[security] starting...');
  await delay(500);
  console.log('[security] done');
  return { check: 'security', result: 'PASS' };
}

async function checkStyle() {
  console.log('[style] starting...');
  await delay(300);
  console.log('[style] done');
  return { check: 'style', result: 'PASS' };
}

async function checkQuality() {
  console.log('[quality] starting...');
  await delay(400);
  console.log('[quality] done');
  return { check: 'quality', result: 'PASS' };
}

async function sequentialVersion() {
  const start = Date.now();
  await checkSecurity();
  await checkStyle();
  await checkQuality();
  return Date.now() - start;
}

async function parallelVersion() {
  const start = Date.now();
  await Promise.all([checkSecurity(), checkStyle(), checkQuality()]);
  return Date.now() - start;
}

async function main() {
  console.log('--- running the three checks ONE AT A TIME (sequential) ---');
  const sequentialMs = await sequentialVersion();

  console.log('\n--- running the three checks ALL AT ONCE (parallel) ---');
  const parallelMs = await parallelVersion();

  console.log(`\nsequential took ~${sequentialMs}ms`);
  console.log(`parallel took   ~${parallelMs}ms`);
  console.log('Same three checks, same results — parallel just does not wait between them.');
}

main();
