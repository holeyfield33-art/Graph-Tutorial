#!/usr/bin/env node
/**
 * Artifacts and references: a "Research" node produces a large result. It
 * writes that result to disk once (an artifact) and hands the NEXT node
 * only a small reference to it — not the whole thing pasted into every
 * message downstream.
 *
 * Run: node example.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = path.join(__dirname, 'artifacts');

function research(topic) {
  // Stand-in for a large real result — a full research transcript.
  const transcript = `Research transcript on "${topic}":\n` + '='.repeat(40) + '\n' +
    Array.from({ length: 200 }, (_, i) => `Finding ${i + 1}: relevant detail about ${topic}.`).join('\n');

  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const artifactId = `research-${topic.replace(/\s+/g, '-')}`;
  const artifactPath = path.join(ARTIFACT_DIR, `${artifactId}.txt`);
  fs.writeFileSync(artifactPath, transcript, 'utf8');

  // This is what gets handed to the next node — not `transcript` itself.
  return {
    artifact_id: artifactId,
    path: artifactPath,
    bytes: Buffer.byteLength(transcript, 'utf8'),
    summary: `${transcript.split('\n').length - 2} findings collected on "${topic}"`,
  };
}

// --- Passing the whole transcript directly (what NOT to do at scale) ---
function synthesizeWithFullTranscript(transcript) {
  console.log(`[synthesis] received ${Buffer.byteLength(transcript, 'utf8')} bytes directly in its input`);
}

// --- Passing a reference instead ---
function synthesizeWithReference(reference) {
  console.log(`[synthesis] received a ${JSON.stringify(reference).length}-byte reference:`, reference);
  console.log('[synthesis] reading the artifact from disk only because it actually needs the detail...');
  const fullText = fs.readFileSync(reference.path, 'utf8');
  console.log(`[synthesis] read ${Buffer.byteLength(fullText, 'utf8')} bytes on demand`);
}

function main() {
  fs.rmSync(ARTIFACT_DIR, { recursive: true, force: true }); // fresh run each time
  const reference = research('agent graph engineering');

  console.log('--- reference handed downstream ---');
  console.log(reference);

  console.log('\n--- bad: pass the whole thing every time ---');
  const fullText = fs.readFileSync(reference.path, 'utf8');
  synthesizeWithFullTranscript(fullText);

  console.log('\n--- good: pass a small reference, read the artifact only when needed ---');
  synthesizeWithReference(reference);

  console.log(`\nreference size: ${JSON.stringify(reference).length} bytes`);
  console.log(`full artifact size: ${reference.bytes} bytes`);
  console.log(`that's a ${Math.round(reference.bytes / JSON.stringify(reference).length)}x difference in what has to move between nodes.`);
  console.log(`\nartifact left on disk at: ${reference.path} — inspect it, then delete artifacts/ whenever you like.`);
}

main();
