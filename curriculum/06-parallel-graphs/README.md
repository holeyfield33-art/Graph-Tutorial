# 06 — Parallel graphs (fan)

## What am I learning?

The second core topology, **fan**: running independent nodes **at the same
time** instead of one after another.

## Why does it matter?

Chain (lesson 05) forces every step to wait for the one before it, even
when there's no real reason to wait. Lesson 04 taught you how to spot that:
if three checks don't need each other's answers, making them take turns
just burns time for nothing.

```text
       ┌──→ B
A ─────┼──→ C
       └──→ D
```

## What does it look like?

Three independent checks — security, style, quality — that could run in any
order, or all at once, and would get the same answers either way. "Could run
in any order without changing the result" is the actual test for whether
something is safe to parallelize.

**Advantages:** faster wall-clock time when steps are truly independent.

**Disadvantages:** harder to read logs (output interleaves), and — this
matters a lot once real agents are involved — **more cost at the same
moment**, since every concurrent agent is a separate LLM session running
right now, not spread out over time. See [`docs/SAFETY.md`](../../docs/SAFETY.md).

## How does it work?

Open [`example.js`](./example.js). The three check functions are identical
whether run sequentially or in parallel — `Promise.all([...])` is what makes
them run concurrently instead of one at a time with `await` between each. In
plain English: "start all three, then wait for all three to finish," instead
of "start one, wait, start the next, wait."

## How do I run it?

```bash
cd curriculum/06-parallel-graphs
node example.js
```

## What should I expect?

Two timed runs — the same three checks, first one-at-a-time, then all at
once. Watch the `[security]`, `[style]`, `[quality]` lines: in the sequential
run they appear in tidy blocks (start, done, start, done...); in the parallel
run all three `starting...` lines print together, then the `done` lines
arrive out of order based on which check happened to finish first. The
parallel total time should be noticeably lower than the sequential total —
roughly the time of the *slowest single check*, not the *sum* of all three.

## What happens if it fails?

Make `checkStyle` throw (`throw new Error('style check exploded')`) inside
the function, then run again. `Promise.all` rejects the instant any one
promise rejects — you'll see the whole parallel run fail, even though
`checkSecurity` and `checkQuality` might have already finished successfully.
This is a real design question graphs have to answer: should one failed
parallel branch cancel the others, or should you collect every result (both
successes and failures) and decide afterward? Undo your edit before moving
on — lesson 07 deals with collecting results from multiple branches.

## What should I experiment with?

Add a fourth check function and add it to the `Promise.all([...])` array.
Time it again — does adding a fourth *independent* check meaningfully
increase the parallel time? (It shouldn't, much — that's the whole benefit.)

## Aside: does "100 agents" mean 100 different roles?

No — and this matters once you see large multi-agent systems mentioned
elsewhere. A fan doesn't need three *different* node definitions; it can be
**one** node definition, run many times with different input:

```text
                    RESEARCH (one node definition)
                       │
       ┌───────────────┼───────────────┐
       ↓               ↓               ↓
 Research("A")    Research("B")    Research("C")   ... Research("Z")
       │               │               │
       └───────────────┴───────┬───────┘
                               ↓
                             JOIN
```

"100 agents" usually means one role, instantiated 100 times over 100 pieces
of input — not 100 different jobs. The topology is exactly this lesson's
fan, just wider. This starter never actually runs anywhere near that many
(see [`docs/ROADMAP.md`](../../docs/ROADMAP.md) for why that's a scale
question, not a beginner-lesson one) — the point here is just that scaling a
fan doesn't require inventing new roles, only more instances of one.

## Next

Continue to [`07-fan-out-fan-in/`](../07-fan-out-fan-in/README.md) —
what happens after the parallel branches finish and their results need to be
combined.
