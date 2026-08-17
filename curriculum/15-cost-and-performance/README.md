# 15 — Cost and performance

## What am I learning?

That quality, latency, cost, and complexity are four **separate** variables
— and that more agents is not automatically a better graph.

## Why does it matter?

Lesson 06 showed parallel execution making a graph faster. It's tempting to
read that as "parallel = better" and keep adding branches. It isn't that
simple:

```text
more parallelism
 ↓
lower wall-clock latency, potentially
 ↓
more model calls happening at once
 ↓
higher token cost
```

A 100-agent system is not automatically superior to a one-agent system. It
might be faster. It will almost certainly cost more. Whether that trade is
worth it depends entirely on what you're building — a graph design decision,
not a default to reach for.

## What does it look like?

Four variables that move independently of each other:

- **Quality** — does the output actually solve the task well?
- **Latency** — how long until you have an answer?
- **Cost** — how much did producing that answer cost, in tokens/dollars?
- **Complexity** — how hard is this graph to reason about, debug, and change?

Adding parallel branches can improve latency without touching quality.
Adding a Verifier improves quality (lesson 14) at the cost of both latency
(another model call in the path) and money. Neither move is "free" just
because it makes one number look better.

## How does it work?

Open [`example.js`](./example.js). `costAndLatency()` computes both numbers
for a given node count and execution mode. The key line: `totalCostUsd` is
`nodeCount * costPerCallUsd` **regardless of `parallel`** — running things
at the same time changes how long you wait, not how many calls you made or
what they cost. `latencySeconds` is the one that responds to `parallel`.

## How do I run it?

```bash
cd curriculum/15-cost-and-performance
node example.js
```

## What should I expect?

Sequential vs. parallel at the same node count: identical cost, very
different latency. Then node count scaling up (5 → 20 → 100) while staying
parallel: latency barely moves (bounded by the slowest single call), cost
scales linearly with node count every time.

## What happens if it fails?

Set `costPerCallUsd` to a real number from your actual provider's pricing
page and `nodeCount` to a plan you're actually considering (say, a 5-node
product graph from [`docs/ROADMAP.md`](../../docs/ROADMAP.md)). If the
resulting number surprises you, that's the exercise working — this
calculator exists so a surprise happens here, on paper, instead of on your
first real bill. See [`docs/SAFETY.md`](../../docs/SAFETY.md) for the same
discipline stated as a rule of thumb.

## What should I experiment with?

Model a graph with a rework loop (lesson 09): if `MAX_ATTEMPTS` is 5 and
each attempt costs the same as one node, what's the worst-case cost of a
single run that never passes? Add that calculation to `example.js`. This is
exactly the kind of number a controlled cycle's giveup limit should be
chosen with in mind, not picked arbitrarily.

## Next

Continue to [`16-observability/`](../16-observability/README.md) — how you'd
actually know any of this happened, after the fact.
