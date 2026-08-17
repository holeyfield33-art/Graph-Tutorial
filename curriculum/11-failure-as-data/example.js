#!/usr/bin/env node
/**
 * Failure-as-data: instead of one generic exception for everything that
 * isn't a clean success, a node returns a specific, named outcome — and the
 * graph routes differently for each one.
 *
 * Run: node example.js
 */

'use strict';

// A lookup that can end up in several genuinely different situations, each
// one a legitimate outcome, not necessarily a "crash."
function lookupRecord(query) {
  if (query === '') {
    return { status: 'invalid', reason: 'query must not be empty' };
  }
  if (query === 'slow-service') {
    return { status: 'timeout', reason: 'upstream did not respond in time' };
  }
  if (query === 'missing-id') {
    return { status: 'not_found', reason: 'no record with that id' };
  }
  if (query === 'flagged-id') {
    return { status: 'needs_review', reason: 'record matched a sensitive-content filter' };
  }
  if (query === 'partial-id') {
    return { status: 'partial', reason: 'record found but missing required fields', record: { id: query, name: null } };
  }
  return { status: 'success', reason: null, record: { id: query, name: 'Example Record' } };
}

// The graph routes on the SPECIFIC status, not just "ok vs not ok".
function route(result) {
  switch (result.status) {
    case 'success':
      return 'SYNTHESIS (use the record)';
    case 'not_found':
      return 'FALLBACK_SEARCH (try a different source)';
    case 'needs_review':
      return 'HUMAN (do not auto-process, ask a person)';
    case 'invalid':
      return 'REWORK (the request itself was malformed, fix it and retry)';
    case 'partial':
      return 'REWORK (record incomplete, fill in the gaps before synthesis)';
    case 'timeout':
      return 'RETRY (transient — same request might work next time)';
    default:
      // A status this code has never seen is itself worth flagging loudly,
      // not silently falling through as if it were a success.
      throw new Error(`unrecognized status: ${result.status}`);
  }
}

function main() {
  const queries = ['user-42', '', 'slow-service', 'missing-id', 'flagged-id', 'partial-id'];
  for (const q of queries) {
    const result = lookupRecord(q);
    console.log(`query=${JSON.stringify(q)} -> status=${result.status} -> ${route(result)}`);
  }
}

main();
