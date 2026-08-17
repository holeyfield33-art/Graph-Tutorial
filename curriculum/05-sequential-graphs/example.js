#!/usr/bin/env node
/**
 * A sequential graph: A -> B -> C, each node depending on the previous
 * node's output. No AI, no dependencies — just plain functions run in order,
 * so you can see the *shape* without anything else going on.
 *
 * Run: node example.js
 */

'use strict';

function nodeA() {
  console.log('[A] researching topic...');
  return { topic: 'agent graphs' };
}

function nodeB(stateFromA) {
  console.log(`[B] writing draft about "${stateFromA.topic}"...`);
  return { ...stateFromA, draft: `A short piece about ${stateFromA.topic}.` };
}

function nodeC(stateFromB) {
  console.log('[C] editing draft...');
  return { ...stateFromB, final: stateFromB.draft.toUpperCase() };
}

function main() {
  console.log('--- sequential graph: A -> B -> C ---');
  const afterA = nodeA(); // edge: A's output becomes B's input
  const afterB = nodeB(afterA); // edge: B's output becomes C's input
  const afterC = nodeC(afterB); // edge: C's output is the graph's result
  console.log('--- done ---');
  console.log('final state:', afterC);
}

main();
