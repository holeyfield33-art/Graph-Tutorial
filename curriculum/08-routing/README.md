# 08 — Routing

## What am I learning?

The third core topology, **router**: an edge that isn't automatic — it picks
**which** node runs next based on a result.

## Why does it matter?

Every graph so far always ran every node. Real graphs need to make
decisions: if the check passed, ship it; if it failed, don't. That decision
point is a **router**.

```text
             ┌→ PASS
A → CHECK ───┤
             └→ FAIL
```

## What does it look like?

One check produces a result. An `if`/`else` — nothing fancier — decides
which of two (or more) next nodes actually runs. Only one branch executes
per run; this is different from fan-out (lesson 07), where *every* branch
always runs.

## How does it work?

Open [`example.js`](./example.js). `check()` returns either `'PASS'` or
`'FAIL'`. The `if (result === 'PASS') { onPass(); } else { onFail(); }` block
*is* the conditional edge — in plain English, "if the check result was PASS,
go to the PASS node; otherwise go to the FAIL node." The real
`01-claude-code/scripts/gate.js` does exactly this at a bigger scale — it
picks between three routes (PASS / BLOCK / FREEZE) using nothing more exotic
than a chain of `if` statements.

## Who has the authority to route?

A router can be fed by an LLM's classification ("is this request simple,
normal, or complex?") — that's fine, and often useful. What matters is what
happens *after* the classification:

```text
LLM
 ↓
classification
 ↓
structured label            ("simple" / "normal" / "complex" — not prose)
 ↓
deterministic route table   (plain code decides what each label is allowed to do)
 ↓
execution
```

Not this:

```text
LLM
 ↓
"I think we should do X"
 ↓
system blindly follows X
```

The difference is subtle but load-bearing: in the first version, the model
only ever produces a *label*, and a fixed table you wrote decides what that
label is permitted to trigger. In the second, the model's free-text opinion
directly becomes an action. The first can't be talked into routing
somewhere it isn't allowed to; the second can be, by nothing more than a
persuasively worded response. This is the same "claim ≠ authority" rule
lesson 14 covers for verification, applied here to routing instead.

## How do I run it?

```bash
cd curriculum/08-routing
node example.js pass
node example.js fail
```

## What should I expect?

Running with `pass` prints `[route: PASS] shipping the result.`. Running
with `fail` prints `[route: FAIL] sending back for rework.`. Same script,
same code — only the input changed which branch ran.

## What happens if it fails?

Run it with no argument at all (`node example.js`) — you should see a
`Usage:` error and a non-zero exit. That's intentional: a router should have
a defined behavior for every input it might see, including invalid ones,
rather than silently guessing.

## What should I experiment with?

**Exercise — add a router.** Add a third possible result, `'FREEZE'`, with
its own route (e.g. an `onFreeze()` that prints something and calls
`process.exit(2)`). You'll get the full explanation of what PASS/BLOCK/
FREEZE each mean in lesson 14 — for now, the short version: PASS ships it,
FAIL/BLOCK sends it back to try again, and FREEZE is a harder stop for when
something more serious than "not good enough yet" happened (that's why it
gets its own exit code, `2`, instead of reusing FAIL's route). This
exercise is exactly the shape of the real Gate's three-way route — see it
for real in
[`01-claude-code/scripts/gate.js`](../../01-claude-code/scripts/gate.js).
*Expected result:* `node example.js freeze` (after you extend the usage
check) prints your new FREEZE route's message and exits with code 2.

## Next

Continue to [`09-controlled-cycles/`](../09-controlled-cycles/README.md) — what
happens when the FAIL route needs to try again instead of just stopping.
