#!/usr/bin/env node
/**
 * gate.js — deterministic release node (NOT an LLM).
 *
 * Usage:  node scripts/gate.js <runDir>
 *
 * Exit codes (edges in the graph):
 *   0  PASS   — receipts ok, claimed files really exist, verifier PASS
 *   1  BLOCK  — rework (verifier FAIL or soft problems)
 *   2  FREEZE — hard stop (missing/invalid receipts, forbidden paths,
 *               claimed files that do not exist, identity/run_id mismatch)
 *
 * The whole point of this file: an agent's *claim* is not evidence. This
 * script re-checks the claims against the actual filesystem before it will
 * emit PASS. It never trusts a receipt's self-reported "status" alone.
 *
 * Files an agent says it touched are resolved RELATIVE TO THE RUN DIRECTORY,
 * so a run is self-contained: writers put their output under
 * runs/<run_id>/workspace/ and record it as "workspace/<file>". That is the
 * "shared state lives under runs/<id>/" rule the README promises.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Directory names an agent is never allowed to touch. Matched as whole path
// segments (not a raw substring) so a legitimate "workspace/scripts-notes.md"
// does not falsely FREEZE, while "scripts/gate.js" does.
const FORBIDDEN_SEGMENTS = ['scripts', '.claude', 'agents', 'node_modules', '.git'];

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

function segments(p) {
  return String(p).replace(/\\/g, '/').split('/').filter(Boolean);
}

function main() {
  const runDir = process.argv[2];
  if (!runDir) {
    console.error('Usage: node scripts/gate.js <runDir>');
    process.exit(2);
  }

  const runId = path.basename(path.resolve(runDir));
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

  // --- Identity: the receipts must be who they say, for the run we are gating.
  if (writer.agent !== 'writer') {
    die(2, 'FREEZE', 'writer-receipt.agent must be "writer"');
  }
  if (verifier.agent !== 'verifier') {
    die(2, 'FREEZE', 'verifier-receipt.agent must be "verifier"');
  }
  if (writer.run_id && writer.run_id !== runId) {
    die(2, 'FREEZE', 'writer-receipt.run_id does not match run directory', {
      run_id: writer.run_id,
      expected: runId,
    });
  }
  if (verifier.run_id && verifier.run_id !== runId) {
    die(2, 'FREEZE', 'verifier-receipt.run_id does not match run directory', {
      run_id: verifier.run_id,
      expected: runId,
    });
  }
  if (
    writer.run_id &&
    verifier.run_id &&
    writer.run_id !== verifier.run_id
  ) {
    die(2, 'FREEZE', 'writer and verifier disagree on run_id', {
      writer_run_id: writer.run_id,
      verifier_run_id: verifier.run_id,
    });
  }

  // --- Forbidden paths: checked on the declared path string BEFORE we look at
  // disk, so a run that even *claims* to touch the gate/agents freezes.
  const touched = Array.isArray(writer.files_touched) ? writer.files_touched : [];
  const forbiddenHit = touched.find((p) =>
    segments(p).some((seg) => FORBIDDEN_SEGMENTS.includes(seg))
  );
  if (forbiddenHit) {
    die(2, 'FREEZE', 'forbidden path in writer files_touched', { path: forbiddenHit });
  }

  // --- No path may escape the run directory. "../secret" is not a workspace file.
  const escapeHit = touched.find((p) => segments(p).includes('..') || path.isAbsolute(String(p)));
  if (escapeHit) {
    die(2, 'FREEZE', 'files_touched path escapes the run directory', { path: escapeHit });
  }

  // --- Evidence, not claims: every file the writer says it touched must
  // actually exist on disk (resolved under the run dir) and be non-empty.
  // This is the check that makes "don't trust the summary" real.
  const runRoot = path.resolve(runDir);
  const missing = [];
  const empty = [];
  for (const rel of touched) {
    const abs = path.resolve(runRoot, String(rel));
    if (abs !== runRoot && !abs.startsWith(runRoot + path.sep)) {
      die(2, 'FREEZE', 'files_touched path escapes the run directory', { path: rel });
    }
    if (!fs.existsSync(abs)) {
      missing.push(rel);
    } else if (fs.statSync(abs).size === 0) {
      empty.push(rel);
    }
  }
  if (missing.length) {
    die(2, 'FREEZE', 'writer claims files that do not exist on disk', { missing });
  }
  if (empty.length) {
    die(2, 'FREEZE', 'writer claims files that are empty on disk', { empty });
  }

  // --- Verifier must show its work: PASS is only meaningful with real checks.
  const checks = Array.isArray(verifier.checks) ? verifier.checks : [];
  const checksAreShaped = checks.every(
    (c) => c && typeof c.name === 'string' && typeof c.result === 'string'
  );
  if (!checksAreShaped) {
    die(2, 'FREEZE', 'verifier-receipt.checks are malformed');
  }

  // --- Status edges.
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
  // A PASS with no checks at all is a rubber stamp, not verification.
  if (checks.length === 0) {
    die(1, 'BLOCK', 'verifier PASS with zero checks — no evidence', {});
  }

  die(0, 'PASS', 'receipts valid, claimed files exist, verifier PASS', {
    writer_summary: writer.summary || null,
    files_touched: touched,
    files_verified: touched.length,
  });
}

main();
