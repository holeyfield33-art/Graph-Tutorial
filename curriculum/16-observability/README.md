# 16 — Observability

## What am I learning?

What a graph needs to record so a human can answer "what actually happened
in this run?" without re-running it or guessing.

## Why does it matter?

Lesson 13 introduced state for recovery — what a *graph* needs to remember
to resume itself. Observability is the related but different question of
what a *human* needs to see, after the fact, to understand and trust a run.
You've had the data all along (every receipt this repo writes); this lesson
is about actually reading it back usefully.

## What does it look like?

A production graph's observability record typically covers:

```text
node
run
status
input/reference
output/artifact
decision
failure
retry
evidence
cost
timing
```

This starter's `runs/<run_id>/*.json` receipts already cover most of this —
node (the `agent` field), status, a summary/decision, and a timestamp, per
node, per run. Observability isn't a separate system you bolt on; it's
*reading the receipts you were already writing for trust reasons* (lesson
14) through a different lens.

## How does it work?

Open [`01-claude-code/scripts/observe.js`](../../01-claude-code/scripts/observe.js) —
a small, real, reusable tool, not a toy for this lesson only. It reads
whatever receipts exist in a run folder, in a fixed, known execution order
(writer → verifier → gate, plus the style-checker if lesson 19's exercise
added one), and prints one line per node: node name, status, timestamp, and
a short detail pulled from whichever field makes sense for that receipt
(`summary`, `reason`, or `failures`).

## How do I run it?

```bash
cd 01-claude-code
node scripts/observe.js runs/demo-pass
node scripts/observe.js runs/demo-block
node scripts/observe.js runs/demo-freeze
```

It works identically against the OpenAI path's runs, because they're the
same receipt shape:

```bash
cd ../02-openai-agents
node ../01-claude-code/scripts/observe.js runs/demo-pass
```

## What should I expect?

A small table, one row per node that actually left a receipt, showing the
whole run's story at a glance — including `demo-block`'s row for `verifier`
showing `FAIL` with the specific failure text, and `gate` showing `BLOCK`
right below it. You should be able to tell what happened in any of this
repo's demo runs from this output alone, without opening any of the
individual JSON files.

## What happens if it fails?

Run it against a directory with no receipts at all
(`node scripts/observe.js runs/` — the parent folder, not a specific run) —
you should see `(no known receipts found in this run directory)` rather
than a crash or a misleading blank table. An observability tool that fails
silently on missing data is worse than useless; this one says plainly that
it found nothing.

## What should I experiment with?

Point `observe.js` at a run folder with a corrupted receipt (copy
`runs/demo-pass/` to a scratch folder and truncate `writer-receipt.json` to
invalid JSON, e.g. delete its closing brace). Re-run `observe.js` against
it — you should see `INVALID` in the status column with the actual parse
error as the detail, rather than the whole tool crashing. That's the same
principle as lesson 11's failure-as-data, applied to the observability tool
itself: a broken receipt is information, not a reason to stop reporting on
everything else that's readable.

## Next

Continue to [`17-claude-code/`](../17-claude-code/README.md) — running the
real graph, on the platform you actually have access to.
