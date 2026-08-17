#!/usr/bin/env node
/**
 * Dependency analysis: the same 4 steps, written in the same order, but
 * only ONE of the three edges in the "obvious" chain is a real dependency.
 *
 * Task: build a dashboard for a user. Steps, in the order someone might
 * naturally write them down:
 *   A. load the user's profile
 *   B. load the user's recent orders
 *   C. load the user's support tickets
 *   D. build the dashboard from A + B + C
 *
 * Written order suggests A -> B -> C -> D. Ask, for each arrow: does the
 * next step actually READ the previous step's output? Only D does.
 *
 * Run: node example.js
 */

'use strict';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadProfile(userId) {
  console.log('[A: loadProfile] using userId only...');
  await delay(300);
  return { profile: { userId, name: 'Sam' } };
}

async function loadOrders(userId) {
  console.log('[B: loadOrders] using userId only...');
  await delay(400);
  return { orders: ['order-1', 'order-2'] };
}

async function loadTickets(userId) {
  console.log('[C: loadTickets] using userId only...');
  await delay(250);
  return { tickets: ['ticket-1'] };
}

function buildDashboard(profile, orders, tickets) {
  console.log('[D: buildDashboard] this is the ONLY step that reads other steps\' output');
  return { ...profile, ...orders, ...tickets };
}

// --- Version 1: the "written order" chain, A -> B -> C -> D ---
// Notice: B and C never touch A's return value. C never touches B's.
// This version pays for that with wall-clock time it didn't need to.
async function asWrittenChain(userId) {
  const start = Date.now();
  const a = await loadProfile(userId); // B does not use `a` below
  const b = await loadOrders(userId);  // C does not use `b` below
  const c = await loadTickets(userId);
  const result = buildDashboard(a, b, c);
  return { result, ms: Date.now() - start };
}

// --- Version 2: the dependency-correct graph ---
// A, B, C only ever needed userId, which was available from the start.
// D is the only real dependency: it genuinely needs all three outputs.
async function asRealDependencies(userId) {
  const start = Date.now();
  const [a, b, c] = await Promise.all([
    loadProfile(userId),
    loadOrders(userId),
    loadTickets(userId),
  ]);
  const result = buildDashboard(a, b, c);
  return { result, ms: Date.now() - start };
}

async function main() {
  console.log('--- version 1: written as a chain, A -> B -> C -> D ---');
  const chainResult = await asWrittenChain('user-42');

  console.log('\n--- version 2: same task, edges match REAL dependencies ---');
  const fanResult = await asRealDependencies('user-42');

  console.log(`\nchain version took ~${chainResult.ms}ms`);
  console.log(`fan version took   ~${fanResult.ms}ms`);
  console.log('\nSame inputs, same final dashboard, only the edges changed:');
  console.log(JSON.stringify(fanResult.result) === JSON.stringify(chainResult.result)
    ? '(results are identical)'
    : '(results differ — that would be a bug)');
}

main();
