#!/usr/bin/env node
/**
 * Verifier vs Gate: a Verifier's opinion is not the final word. A Gate
 * checks concrete rules and can override an overly-optimistic Verifier.
 *
 * This mirrors 01-claude-code/scripts/gate.js at toy scale, on purpose —
 * so the real one feels familiar in lesson 11.
 *
 * Run: node example.js
 */

'use strict';

const FORBIDDEN_FILES = ['gate.js', 'secrets.env'];

// A Verifier: an opinion, based on SOME evidence, but still just an opinion.
function verifierOpinion(filesTouched) {
  console.log('[verifier] "I checked the files, everything looks fine to me." -> PASS');
  return 'PASS'; // deliberately wrong below, to prove the Gate does not just trust this
}

// A Gate: a fixed rule, checked against real facts, no persuasion possible.
function gate(filesTouched, verifierResult) {
  const forbiddenHit = filesTouched.find((f) => FORBIDDEN_FILES.includes(f));
  if (forbiddenHit) {
    return { status: 'FREEZE', reason: `forbidden file touched: ${forbiddenHit}` };
  }
  if (verifierResult !== 'PASS') {
    return { status: 'BLOCK', reason: 'verifier did not PASS' };
  }
  return { status: 'PASS', reason: 'no forbidden files, verifier PASS' };
}

function main() {
  const filesTouched = ['app.js', 'gate.js']; // gate.js should never be touched

  console.log('--- files this run touched:', filesTouched, '---\n');

  const verifierResult = verifierOpinion(filesTouched);

  console.log('\n[gate] checking fixed rules against the real file list (ignoring the opinion above)...');
  const decision = gate(filesTouched, verifierResult);

  console.log('\nfinal decision:', decision);
  console.log(
    decision.status === 'FREEZE'
      ? '\nThe Verifier said PASS. The Gate overruled it anyway — that is the whole point.'
      : '\n(nothing overruled here)'
  );
}

main();
