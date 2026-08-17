# 02 — What is a graph?

## What am I learning?

What "graph" means here, using an analogy before any technical definition.

## Why does it matter?

"Agent graph engineering" is the name of the whole discipline this repo
teaches. If "graph" stays a buzzword, the rest won't click.

## What does it look like?

Think of a graph as **a map with roads between workers**:

- **Node = worker** — an agent, a script, or a human approval step; someone
  or something that does one job (lesson 01, and later lesson 03)
- **Edge = road** — a rule for what happens after a worker finishes: which
  worker gets the result next, and under what condition
- **Graph = the whole map** — every worker and every road between them, laid
  out on purpose

A single chat with an AI is like asking one person to be the architect, the
builder, the inspector, and the building's own final sign-off — all in one
head, with no one checking anyone else's work. A graph is deciding, in
advance, that those are different jobs done by different workers, connected
by explicit roads.

```text
        ┌─────────────┐
        │   Writer    │  (worker 1 — does the work)
        └──────┬──────┘
               │  road: "when Writer finishes, go to Verifier"
               ▼
        ┌─────────────┐
        │  Verifier   │  (worker 2 — checks the work)
        └──────┬──────┘
               │  road: "when Verifier finishes, go to Gate"
               ▼
        ┌─────────────┐
        │   Gate      │  (worker 3 — a script, decides PASS/BLOCK/FREEZE)
        └─────────────┘
```

This is the exact graph you'll run in lessons 17–18.

## How does it work?

Why not just use one very capable agent for everything? Three concrete
reasons, from [`docs/WHY.md`](../../docs/WHY.md):

- A single agent handling a long task can lose track of an early constraint
  as the conversation grows
- A single agent checking its own work tends to say "looks good" — it has no
  independent perspective on itself
- Doing the work and deciding to release the work are different
  responsibilities; mixing them means nothing stops a confident-but-wrong
  answer from shipping

A graph fixes this by **structural separation**, not by asking the AI to try
harder. The Verifier is a different agent from the Writer, so it has no
stake in defending the Writer's choices. The Gate is not an AI at all, so it
can't be talked into anything.

## How do I run it?

Nothing to run yet. Lesson 03 looks closer at nodes and edges specifically;
lesson 05 is your first hands-on run.

## Where graph engineering sits

Graph engineering is not a replacement for everything below it — it's the
top of a stack, and it only works if the layers underneath are solid:

```text
Prompt engineering     (what you tell one model to do)
        ↓
Context engineering    (what information that model can see)
        ↓
Harness engineering    (what tools/environment the model runs in)
        ↓
Loop engineering        (how a single agent iterates: act, observe, retry)
        ↓
Graph engineering      (how MULTIPLE agents and scripts fit together)
```

A perfectly designed graph with a badly-written prompt at one node still
fails at that node. Graph engineering decides *who does what, in what order,
with what authority* — it doesn't replace the skill of writing a good
individual prompt or giving an agent the right context and tools.

## What should I expect?

You should be able to redraw the Writer → Verifier → Gate diagram from memory
and explain, in your own words, why it's three separate workers instead of
one.

## What happens if it fails?

Not applicable yet.

## What should I experiment with?

Try sketching a graph (on paper is fine) for a task you actually do —
writing an email, planning a trip, reviewing a document. What would the
nodes be? Would you want a "verifier" node for it? What would that node
actually check?

## Next

Continue to [`03-nodes-and-edges/`](../03-nodes-and-edges/README.md).
