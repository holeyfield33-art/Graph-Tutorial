# 12 — Artifacts and references

## What am I learning?

Handing the next node a small **reference** to a result instead of the
entire result itself.

## Why does it matter?

A node contract (lesson 10) says output should be structured. It doesn't
say output has to be *large*. As results grow — a full research transcript,
a big file, a long conversation history — pasting the whole thing into every
downstream node's input gets expensive and unwieldy fast:

```text
Agent A
 ↓
huge transcript
 ↓
Agent B
```

versus:

```text
Agent A
 ↓
artifact (written once)
 ↓
artifact ID / reference (small)
 ↓
Agent B reads the artifact only if it actually needs the detail
```

This is exactly what `runs/<run_id>/writer-receipt.json` already does in
this repo's real graph — it's a small reference (a summary, a list of
touched paths) pointing at the actual files under `workspace/`, not the
files themselves pasted into the receipt.

## What does it look like?

One node writes its full result to disk once — that's the **artifact**. It
hands the next node a small object describing *where* that artifact is and
a short summary — that's the **reference**. The next node reads the full
artifact from disk only if it genuinely needs the detail; otherwise the
summary alone is often enough.

## How does it work?

Open [`example.js`](./example.js). `research()` writes a ~200-line
transcript to `artifacts/research-<topic>.txt` and returns a small object —
`artifact_id`, `path`, `bytes`, `summary` — that's the reference.
`synthesizeWithReference()` receives that small object, and only calls
`fs.readFileSync()` on the artifact path when it actually needs the full
text. Compare this to `synthesizeWithFullTranscript()`, which receives the
entire transcript directly, every time, whether or not it needs all of it.

## How do I run it?

```bash
cd curriculum/12-artifacts-and-references
node example.js
```

## What should I expect?

A reference object a few hundred bytes big, an artifact tens of thousands of
bytes big, and a final line reporting roughly a 40× size difference between
what moved through the "good" path versus the "bad" one. The artifact is
left on disk afterward — open
`curriculum/12-artifacts-and-references/artifacts/research-agent-graph-engineering.txt`
yourself and see the full thing the reference was pointing at.

**What this buys you**, beyond just smaller messages:

- **Smaller contexts** — less to pass to every downstream node or model call
- **Better provenance** — the artifact is a fixed file on disk, not a copy
  pasted into three different places that could quietly drift apart
- **Persistence** — the artifact survives after the node that made it exits
- **Easier recovery** — lesson 13's crash/resume exercise depends on exactly
  this: work already done exists as a file, not just as something that was
  said once in a conversation that's now gone

## What happens if it fails?

Delete the `artifacts/` folder while the script is mid-run (you'd need to
add a `setTimeout` to actually catch it mid-flight, or just delete it right
after the first run and rerun `synthesizeWithReference` alone against a
stale reference object) — `fs.readFileSync` throws `ENOENT`. That's the
real cost of references: whoever holds one is depending on the artifact
still existing. A production system needs a policy for that (don't delete
artifacts referenced by an in-progress run); this starter's scope stops at
knowing the failure mode exists.

## What should I experiment with?

**Exercise — persist an artifact and pass a reference.** Add a second node,
`critique(reference)`, that reads the artifact via its reference (same
pattern as `synthesizeWithReference`) and writes its OWN artifact — a
critique file — returning a reference to *that*. Chain it after synthesis.
*Expected result:* two artifact files on disk afterward, and a reference
object at the end that itself points to a reference-producing chain, not a
single giant blob passed hand to hand.

## Next

Continue to [`13-state-and-recovery/`](../13-state-and-recovery/README.md) —
what a graph needs to remember to survive being interrupted.
