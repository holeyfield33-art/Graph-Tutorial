# 09 — Controlled cycles

## What am I learning?

The fourth core topology, **controlled cycle**: an edge that points
**backward** — when a check fails, send the work back to be redone instead
of just stopping.

## Why does it matter?

Lesson 08's FAIL route just stopped. Most real workflows want something
better: "try again, this time knowing what was wrong" — a **controlled
cycle** (a rework loop).

```text
        ┌─────────────┐
        ↓             │
     BUILD → VERIFY ──┘
              │
              └→ PASS
```

## What does it look like?

BUILD produces something, VERIFY checks it. If VERIFY fails, control goes
back to BUILD — not to a totally fresh start, but another attempt. This has
to have a limit: an infinite loop that never passes is not "thorough," it's
a runaway cost with no benefit (see [`docs/SAFETY.md`](../../docs/SAFETY.md)).

Notice what decides the loop continues: `verify()` returning `false` — a
concrete check against `state.quality`, not the model saying "I don't think
that's quite right yet." A controlled cycle is controlled *by evidence*, the
same rule lesson 14 covers for verification in general — a cycle that
continues because a model "feels" unsatisfied, with no concrete check behind
it, isn't controlled at all.

## How does it work?

Open [`example.js`](./example.js). A `for` loop with a fixed `MAX_ATTEMPTS`
stands in for the "go back to BUILD" edge — each iteration is one trip
around the loop. `verify()` returning `false` is what triggers "loop back
instead of stopping"; `verify()` returning `true` is what breaks out of the
loop early via `return`. The loop giving up after `MAX_ATTEMPTS` without
ever passing is the deliberately-included safety valve — a real rework loop
always needs one.

## How do I run it?

```bash
cd curriculum/09-controlled-cycles
node example.js
```

## What should I expect?

Three attempts, then PASS — this example's `build()` is written so quality
increases by exactly 1 each attempt and the bar is 3, so it always passes on
attempt 3, deterministically (no randomness, so you get the same output
every time you run it).

## What happens if it fails?

Change the passing bar in `verify()` from `state.quality >= 3` to
`state.quality >= 10` — now no attempt within `MAX_ATTEMPTS` (5) will ever
pass. Run it again: you should see all 5 attempts fail, then "Gave up after
5 attempts." That message existing at all is the point — a rework loop
without a giving-up condition is a bug, not a feature. Change the bar back
to `3` before moving on.

## What should I experiment with?

**Exercise — add a controlled retry loop.** Change `MAX_ATTEMPTS` to `2` and
re-run with the bar still at `3` — you should now see the loop give up after
2 attempts instead of reaching PASS on attempt 3. Then change `build()` so
quality increases by 2 each attempt instead of 1 (`const quality = attempt * 2;`)
and confirm it now passes in fewer attempts. *Expected result:* the giveup
message disappears once attempts-needed drops back within `MAX_ATTEMPTS`.

In the real 3-agent graph (lessons 17–18), a BLOCK result from the Gate is
exactly this loop's "not good enough yet" — except there, *you* decide
whether to send the Writer back with feedback, rather than an automatic
retry. Look at
[`01-claude-code/runs/demo-block/verifier-receipt.json`](../../01-claude-code/runs/demo-block/verifier-receipt.json)
and think about what you'd tell the Writer to fix if this were a real rework
loop.

## Next

Continue to [`10-node-contracts/`](../10-node-contracts/README.md) — giving
every node in a graph a strict, predictable shape.
