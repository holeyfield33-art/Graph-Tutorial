#!/usr/bin/env node
/**
 * Node contracts: a node with ONE job, an EXPLICIT input, a STRUCTURED
 * output, and EXPLICIT failure states — versus one that just returns
 * prose and hopes whoever reads it can figure out what happened.
 *
 * Run: node example.js
 */

'use strict';

const SOURCES = {
  'user-42': ['source-001', 'source-002'],
  'user-99': [],
};

// --- BAD: free text. A human can read it. A router or gate cannot. ---
function searchBad(userId) {
  const found = SOURCES[userId] || [];
  if (found.length === 0) {
    return `I looked for sources for ${userId} but didn't really find anything useful, sorry.`;
  }
  return `I found three useful sources and here is what I think you should do: check ${found.join(' and ')}, they look promising.`;
}

// --- GOOD: a node contract. ---
// ONE job: find sources for a user.
// EXPLICIT input: a userId string.
// STRUCTURED output: a fixed shape, always the same fields.
// EXPLICIT failure states: distinguishes "found some" from "found none"
// instead of forcing the caller to parse a sentence to find out.
function searchGood(userId) {
  const found = SOURCES[userId] || [];
  if (found.length === 0) {
    return { status: 'not_found', sources: [], count: 0 };
  }
  return { status: 'success', sources: found, count: found.length };
}

// A router can trust searchGood's shape without reading any prose:
function routeOnResult(result) {
  if (result.status === 'success') return `route: SYNTHESIS (${result.count} sources)`;
  if (result.status === 'not_found') return 'route: FALLBACK_SEARCH';
  return `route: UNKNOWN (unrecognized status "${result.status}")`;
}

function main() {
  console.log('--- BAD: free text output ---');
  const bad = searchBad('user-42');
  console.log(bad);
  console.log('-> a router reading this has to guess at meaning from wording.\n');

  console.log('--- GOOD: node contract, structured output ---');
  const good = searchGood('user-42');
  console.log(JSON.stringify(good, null, 2));
  console.log(routeOnResult(good));

  console.log('\n--- GOOD, different case: no sources found ---');
  const goodEmpty = searchGood('user-99');
  console.log(JSON.stringify(goodEmpty, null, 2));
  console.log(routeOnResult(goodEmpty));
}

main();
