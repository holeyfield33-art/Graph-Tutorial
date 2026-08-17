# 04 — Dependency analysis

## What am I learning?

The single most important skill in graph engineering: telling a **real
dependency** apart from **mere written order**.

## Why does it matter?

This is the non-negotiable principle behind every topology lesson that
follows:

> **Graph engineering is dependency engineering.**

```text
sequence ≠ dependency
```

An edge should exist for exactly one reason:

> **Node B requires information produced by Node A.**

If B doesn't actually read A's output, writing "A then B" was a choice, not
a requirement — and it's a choice that costs you time for nothing. Every
topology lesson from here on (05–09) is really just "what do you do once
you've correctly identified which edges are real."

## What does it look like?

Four steps to build a dashboard, written in the order a person would
naturally think of them:

```text
A (load profile) → B (load orders) → C (load tickets) → D (build dashboard)
```

Now ask, honestly, for every single arrow:

> Does B actually read A's return value?
> Does C actually read B's return value?
> Does D actually read C's return value?

In this example: no, no, and **yes**. A, B, and C each only need the user's
ID — which was available before any of them ran. D is the only step that
genuinely needs other steps' output; it needs all three. The honest graph
looks like this — three independent loaders, then one join:

```text
        ┌→ A (load profile) ─┐
userId ─┼→ B (load orders)  ─┼→ D (build dashboard)
        └→ C (load tickets) ─┘
```

Notice what changed: A, B, and C no longer point *into each other* — they
all point *out from* the one thing they actually need (`userId`), and only
D points *in from* all three. Nothing was added or removed, only the
direction and shape of the arrows, to match what each step actually reads.

## How does it work?

Open [`example.js`](./example.js). `asWrittenChain()` is what you get by
literally coding the steps in the order you thought of them — `await`, then
`await`, then `await`. `asRealDependencies()` runs the same three
independent loads with `Promise.all()` (fan-out, lesson 06) and only waits
for all three before the one step that needs them (fan-in, lesson 07). Both
versions produce the *exact same result* — dependency analysis doesn't
change what the graph computes, only how much time it wastes waiting on
edges that were never real.

## How do I run it?

This is the first command in the whole curriculum — if you haven't opened a
terminal before, here's exactly how:

- **Windows:** open the Start menu, type `PowerShell` or `Terminal`, press
  Enter.
- **macOS:** open Spotlight (Cmd+Space), type `Terminal`, press Enter.
- **VS Code / most code editors:** use the built-in terminal panel (usually
  View → Terminal, or `` Ctrl+` ``) — it opens already inside your project.

Then, in that terminal, navigate to wherever you downloaded or cloned this
repo (e.g. `cd Downloads/agent-graph-starter` — adjust the path to match
where it actually is on your machine) so you're standing at the repo's root
folder before running the commands below. Every command in this curriculum
assumes you're starting from the repo root unless it says otherwise.

```bash
cd curriculum/04-dependency-analysis
node example.js
```

## What should I expect?

Two runs of the same four steps. The chain version's total time is roughly
the *sum* of A+B+C+D's individual times; the fan version's is roughly the
*slowest single step* plus D. The final line confirms both versions compute
an identical result — proof that the chain's extra edges were never load-
bearing.

## What happens if it fails?

Add a fake dependency on purpose: change `loadOrders(userId)` to
`loadOrders(a.profile.userId)` inside `asRealDependencies`'s `Promise.all`
call. It won't run — `a` doesn't exist in that scope, because `asWrittenChain`'s
`a` and the fan version's inputs are separate. That error is the mechanism
working as intended: JavaScript itself won't let you reference a value
that isn't actually available yet, which is exactly the check you're meant
to be doing by eye for every edge in a graph you design. Undo the change
before moving on.

## What should I experiment with?

Take a real multi-step task you actually do (send a status update: gather
data from three sources, then write one summary). Write down the steps in
the order you'd naturally think of them. Then, for every arrow, ask the same
question this lesson just asked: does the next step *read* the previous
step's output, or does it just happen to come after it in your head? Circle
the edges that survive — those are your real graph.

## Next

Continue to [`05-sequential-graphs/`](../05-sequential-graphs/README.md) —
the topology for when the edges genuinely are real.
