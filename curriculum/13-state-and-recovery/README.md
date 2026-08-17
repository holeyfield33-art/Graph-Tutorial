# 13 — State and recovery

## What am I learning?

What a graph needs to remember so an interrupted run doesn't have to start
over from nothing.

## Why does it matter?

Every lesson so far assumed a graph runs start to finish without incident.
Real ones don't always: a process crashes, a machine restarts, a network
call times out permanently. A graph that can't answer three questions loses
all completed work every time that happens:

```text
What happened?
Why did it happen?
Where can execution safely resume?
```

## What does it look like?

A small state record per run, checkpointed after every step — not a
database, just a file:

```text
run_id
node_id
status
attempt
artifact
decision
evidence
```

This starter uses exactly the `runs/` structure you've already seen
(lesson 03) for this — `state.json` in this lesson's example is the same
idea, made explicit and updated incrementally instead of written once at
the end.

## How does it work?

Open [`example.js`](./example.js). Three steps — `fetch`, `transform`,
`publish` — each checked against `state.json` before running:
`stepDone(state, nodeId)` skips a step already marked `"status": "done"`;
`markDone()` writes the checkpoint immediately after a step finishes, not
batched up for later. If the process exits between steps (simulated here
with `--crash-after=N`), whatever was checkpointed survives; whatever
wasn't gets redone on the next run — and *only* what wasn't.

## Idempotency

A resumed run will sometimes re-invoke a step. That's only safe if the step
is **idempotent** — running it twice has the same effect as running it once.
`transform()` is idempotent on purpose: it *overwrites* `result.json`,
so re-running it produces the identical file, not a duplicate. A step that
instead *appended* to a file, or called an external "charge this card" API,
would NOT be safe to blindly re-run — that's exactly why `publish()` in this
example is gated behind the `stepDone()` check rather than assumed safe to
repeat. **A retry should not accidentally create duplicate artifacts or
duplicate side effects.** Where a step can be made naturally idempotent
(overwrite, not append; upsert by ID, not insert), do that. Where it can't,
the state checkpoint is what prevents the duplicate — simple IDs and run
state, not a production database.

## How do I run it?

```bash
cd curriculum/13-state-and-recovery
node example.js --reset
node example.js --crash-after=2
node example.js
```

## What should I expect?

The `--crash-after=2` run prints `fetch` and `transform` completing, then
"simulated crash after step 2" and exits with code 1 — `publish` never ran.
The following plain `node example.js` run prints `fetch` and `transform` as
**already done — skipping**, then actually runs `publish` for the first
time. Run `node example.js` a third time and even `publish` now says
already done — nothing re-executes, and nothing gets published twice.

## What happens if it fails?

Open `example.js` and find the line `if (stepDone(state, 'publish')) {`.
Change just the condition to `if (false) {` (leave the rest of the
if/else block exactly as it is — this is a one-word edit, not a rewrite)
so `publish()` always runs unconditionally, ignoring the checkpoint. Run
the full sequence again (`--reset`, then two plain runs). You'll see
`[publish] publishing...` print on **both** runs — a duplicate side effect,
exactly the failure mode idempotency and state checkpointing exist to
prevent. Change `if (false)` back to `if (stepDone(state, 'publish'))`
before moving on.

## What should I experiment with?

**Exercise — simulate an interrupted run.** Add a fourth step, `notify`,
that runs after `publish` and is deliberately non-idempotent (it should
print a message making clear it must not run twice, same as `publish`).
Then run `--crash-after=3` (you'll need to add that crash point too) and
confirm a subsequent plain run resumes at exactly `notify`, not earlier and
not by skipping it. *Expected result:* four total steps in the final state
dump, each `"attempt": 1` — never higher, no matter how many times you
re-run after everything's done.

## Next

Continue to [`14-verification-and-gates/`](../14-verification-and-gates/README.md) —
now that a node's output is structured and its state survives interruption,
what does it take to actually trust the result?
