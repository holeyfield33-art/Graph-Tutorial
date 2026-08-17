#!/usr/bin/env node
/**
 * observe.js — a small observability tool, not a dashboard.
 *
 * Reads whatever receipts exist in a run folder and prints one line per
 * node: who ran, what status they reported, and when. This is what
 * "observability" means for this starter — the receipts already ARE the
 * observability data; this script just reads them back in a useful order,
 * exactly like a production system would summarize logs/traces/metrics.
 *
 * Usage: node scripts/observe.js <runDir>
 */

'use strict';

const fs = require('fs');
const path = require('path');

// Fixed, known order — a real observability tool shows the graph's actual
// execution order, not whatever order files happen to sort alphabetically.
const KNOWN_RECEIPTS = [
  { file: 'writer-receipt.json', node: 'writer' },
  { file: 'verifier-receipt.json', node: 'verifier' },
  { file: 'style-receipt.json', node: 'style-checker' },
  { file: 'warden-receipt.json', node: 'gate' },
];

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
    console.error('Usage: node scripts/observe.js <runDir>');
    process.exit(1);
  }
  if (!fs.existsSync(runDir)) {
    console.error(`No such run directory: ${runDir}`);
    process.exit(1);
  }

  console.log(`run: ${runDir}`);
  console.log('-'.repeat(72));
  console.log(
    'NODE'.padEnd(16) + 'STATUS'.padEnd(10) + 'TIMESTAMP'.padEnd(26) + 'DETAIL'
  );
  console.log('-'.repeat(72));

  let sawAny = false;
  for (const { file, node } of KNOWN_RECEIPTS) {
    const p = path.join(runDir, file);
    if (!fs.existsSync(p)) continue;
    sawAny = true;
    const receipt = readJson(p);
    const status = receipt.__error ? 'INVALID' : (receipt.status || '?');
    const timestamp = receipt.__error ? '' : (receipt.timestamp || '');
    const detail = receipt.__error
      ? receipt.__error
      : (receipt.summary || receipt.reason || (receipt.failures || []).join('; ') || '');
    console.log(
      node.padEnd(16) + String(status).padEnd(10) + String(timestamp).padEnd(26) + detail
    );
  }

  if (!sawAny) {
    console.log('(no known receipts found in this run directory)');
  }
}

main();
