# 07 — Fan-out and fan-in

## What am I learning?

Spreading one task into several parallel branches (**fan-out**), then
collecting results back into one node (**fan-in** / **join**) — and when a
join is the right call versus an accidental barrier.

## Why does it matter?

Lesson 06 showed parallel branches running — but it never combined their
results into one decision. Real graphs usually need that combination step:
"security passed AND quality passed AND style passed → overall PASS." A
join should exist for exactly one reason, symmetric to lesson 04's rule for
edges: **the next node genuinely needs the complete set of results.** If it
doesn't, you've quietly turned your parallel graph back into a chain by
making everything wait at a barrier it didn't need.

```text
        ┌→ Security ─┐
Task ───┼→ Quality ──┼→ Synthesis
        └→ Style ────┘
```

## What does it look like?

One task, three independent checks that fan out from it, and one synthesis
node that only runs once *all three* branches are done — that's the join.
The synthesis node's whole job is to look at every branch's result together,
something no single branch could do on its own.

**A join is a synchronization barrier.** Everything waits for the slowest
branch feeding it. That's fine when the next step truly needs everything —
it's a real cost when it doesn't.

## How does it work?

Open [`example.js`](./example.js). `Promise.all([...])` is fan-out — it
starts all three checks without waiting between them. The array `results`
that comes back — one entry per branch, same order they were started — is
what the join reads: `synthesize(results)` is the one place in the whole
graph that sees the full picture.

## Join vs. streaming

A join isn't the only option once branches are running in parallel. Two
different shapes:

```text
Join:                          Streaming:
A ─┐                           A ─→ C
B ─┼→ C   (C waits for all)    B ─→ C   (C processes each as it arrives)
D ─┘                           D ─→ C
```

With a join, C sees a complete, stable set — good when the decision needs
everything at once (like this lesson's synthesis, which can't say "overall
PASS" without knowing about every check). With streaming, C can start
working the moment the *first* result lands, and keeps processing as more
arrive — better when results can be handled independently, like showing
partial results in a live UI as each finishes. This starter's examples all
use joins, because every decision they make genuinely needs the complete
set — but the choice itself is one you make deliberately, not by default.

## How do I run it?

```bash
cd curriculum/07-fan-out-fan-in
node example.js
```

## What should I expect?

Three checks run (interleaved, since they're parallel), then one synthesis
step that reports an overall verdict. This example's style check is written
to deliberately return `FAIL`, so you should see:

```text
final: {
  overall: 'FAIL',
  failed_checks: [ 'style' ],
  all_results: [ ... ]
}
```

## What happens if it fails?

Change `checkStyle`'s `result` from `'FAIL'` to `'PASS'` and re-run — you
should now see `overall: 'PASS'` and an empty `failed_checks` array. This is
the actual mechanism a **router** (lesson 08) would read to decide what
happens next: ship it, or send it back for rework.

## An unnecessary join

Now run the second script in this folder:

```bash
node unnecessary-join.js
```

It adds a 4th, slow branch (`collectMetrics`) whose result the release
decision never actually reads — pure dashboard data. The first version
joins on it anyway, "for tidiness," and pays for it: the decision takes as
long as the slowest branch, `Metrics`, even though nothing needed to wait
on it. The second version only joins on what the decision actually needs;
`Metrics` keeps running in the background and reports in later. You should
see the second version's decision arrive roughly 7× faster, with `Metrics`
finishing after. **Do not accidentally turn a parallel graph back into a
chain by adding barriers everywhere** — join what the next step reads, and
nothing else.

## What should I experiment with?

**Exercise — add a join.** In `example.js`, add a fourth check function
(say, `checkAccessibility`) that also returns `FAIL`, and add it to the
`Promise.all([...])` array feeding `synthesize`. Re-run and confirm
`failed_checks` now lists both failing checks — the join genuinely combines
everything it's given, not just the first failure it happens to see.
*Expected result:* `failed_checks: [ 'style', 'accessibility' ]`.

## Next

Continue to [`08-routing/`](../08-routing/README.md) —
using a result like `overall` to decide which node runs next.
