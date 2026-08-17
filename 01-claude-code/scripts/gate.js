#!/usr/bin/env node
/**
 * gate.js — deterministic release node (NOT an LLM).
 *
 * Usage:  node scripts/gate.js <runDir>
 *
 * Exit codes (edges in the graph):
 *   0  PASS   — receipts ok, verifier PASS, no freeze conditions
 *   1  BLOCK  — rework (verifier FAIL or soft problems)
 *   2  FREEZE — hard stop (missing receipts, forbidden paths, invalid JSON)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const FORBIDDEN_PREFIXES = [
  'scripts/',
  '.claude/',
  'agents/',
  'node_modules/',
  '.git/',
];

function die(code, status, reason, extra = {}) {
  const out = {
    agent: 'gate',
    status,
    reason,
    timestamp: new Date().toISOString(),
    ...extra,
  };
  const runDir = process.argv[2];
  if (runDir) {
    try {
      fs.mkdirSync(runDir, { recursive: true });
      fs.writeFileSync(
        path.join(runDir, 'warden-receipt.json'),
        JSON.stringify(out, null, 2) + '\n'
      );
    } catch (_) {
      /* still exit with code */
    }
  }
  console.log(JSON.stringify(out, null, 2));
  process.exit(code);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    return { __error: String(e.message || e) };
  }
}

function main() {
  const runDir = process.argv[2];
  if (!runDir) {
    console.error('Usage: node scripts/gate.js <runDir>');
    process.exit(2);
  }

  const writerPath = path.join(runDir, 'writer-receipt.json');
  const verifierPath = path.join(runDir, 'verifier-receipt.json');

  if (!fs.existsSync(writerPath)) {
    die(2, 'FREEZE', 'missing writer-receipt.json');
  }
  if (!fs.existsSync(verifierPath)) {
    die(2, 'FREEZE', 'missing verifier-receipt.json');
  }

  const writer = readJson(writerPath);
  const verifier = readJson(verifierPath);

  if (writer.__error) {
    die(2, 'FREEZE', 'writer-receipt.json invalid JSON', { detail: writer.__error });
  }
  if (verifier.__error) {
    die(2, 'FREEZE', 'verifier-receipt.json invalid JSON', { detail: verifier.__error });
  }

  if (writer.agent !== 'writer') {
    die(2, 'FREEZE', 'writer-receipt.agent must be "writer"');
  }
  if (verifier.agent !== 'verifier') {
    die(2, 'FREEZE', 'verifier-receipt.agent must be "verifier"');
  }

  // Match forbidden dirs as real path segments (not a raw substring test) so a
  // legitimate file like "workspace/scripts/notes.md" does not falsely FREEZE.
  const touched = Array.isArray(writer.files_touched) ? writer.files_touched : [];
  const forbiddenHit = touched.find((p) => {
    const segments = String(p).replace(/\\/g, '/').split('/');
    return FORBIDDEN_PREFIXES.some((pref) => segments.includes(pref.replace(/\/$/, '')));
  });
  if (forbiddenHit) {
    die(2, 'FREEZE', 'forbidden path in writer files_touched', { path: forbiddenHit });
  }

  if (verifier.status === 'FAIL' || writer.status === 'FAIL') {
    die(1, 'BLOCK', 'writer or verifier reported FAIL', {
      writer_status: writer.status,
      verifier_status: verifier.status,
    });
  }

  if (verifier.status !== 'PASS') {
    die(1, 'BLOCK', 'verifier status is not PASS', { verifier_status: verifier.status });
  }

  if (writer.status !== 'PASS') {
    die(1, 'BLOCK', 'writer status is not PASS', { writer_status: writer.status });
  }

  die(0, 'PASS', 'receipts valid and verifier PASS', {
    writer_summary: writer.summary || null,
    files_touched: touched,
  });
}

main();
