# 00 — Start here

## What is this?

A hands-on course that teaches you how to design and run a small team of AI
agents that work together on a task — an **agent graph** — using a real,
runnable 3-agent example as the central case study.

## Who is it for?

Someone who has never built an agent, and may never have written much code
at all. If you already know what a DAG or an orchestrator is, you can safely
skim or skip ahead — but nothing here assumes you do.

## What will I learn?

By the end, you'll understand: what an agent is, what a graph is, nodes and
edges, how to tell a real dependency from mere written order, running agents
one after another (sequential) and at the same time (parallel), fan-out/
fan-in, routing based on a condition, controlled cycles that send work back
for rework, giving a node a strict contract, treating failure as data
instead of an exception, passing artifacts by reference instead of huge
transcripts, surviving an interrupted run, verification, deterministic
gates, cost and performance tradeoffs, observability, and why "the AI said
it's done" is never enough on its own. You'll be able to explain all of
that, and you'll have run a real graph that demonstrates it — plus a
[Graph Design Worksheet](../../docs/GRAPH-DESIGN-WORKSHEET.md) for planning
one of your own.

## What do I need?

- A computer (Windows, macOS, or Linux)
- About 15 minutes for your first working graph, longer if you do the full
  curriculum
- **Either** a Claude Code subscription **or** an OpenAI API account — you
  do not need both. Pick whichever you already have; the two paths teach the
  identical concepts (see [`docs/PLATFORM-COMPARISON.md`](../../docs/PLATFORM-COMPARISON.md))

## How much does it cost?

- Lessons 00–16 cost nothing — no AI calls, no account needed at all.
- Lessons 17–18 (running the real graph) cost whatever your platform charges
  for a couple of small LLM calls — typically a small fraction of a dollar,
  or included in a Claude subscription's usage. See
  [`docs/SAFETY.md`](../../docs/SAFETY.md) for cost discipline.

## Do I need Claude?

No. You need **either** Claude Code **or** OpenAI API access, not both.

## Do I need OpenAI?

Same answer — only if you're taking that path instead of Claude Code.

## Do I need coding experience?

No, for lessons 00–03 (pure reading) and to *run* lessons 04–18 (you paste a
command, you don't write one). Lesson 19, the capstone, is a real step up —
it asks you to write a new small script and modify an existing one, not
just change one value in a file you're given. It's still doable without
prior coding background, because every exercise comes with a hint and a
worked solution you can check yourself against, and every piece of code
you'll write closely mirrors something you've already seen run
successfully in an earlier lesson — but budget more time and patience for
it than for lessons 04–16.

## How long does the first exercise take?

About 10–15 minutes from a clean checkout to seeing a real PASS and a real
FREEZE, if you already have Node.js installed. Longer if you need to install
Node.js or Claude Code first.

## What will I build?

A graph like this:

```text
HUMAN TASK
    |
    v
  WRITER          (an agent that does the work)
    |
    v
 VERIFIER         (an agent that tries to find problems with the work)
    |
    v
   GATE           (a plain script — not an AI — that makes the final call)
    |
    v
PASS / BLOCK / FREEZE
```

You'll run it for real, see it succeed, then deliberately make it fail two
different ways so you understand exactly why each failure mode exists.

## Next

Continue to [`01-what-is-an-agent/`](../01-what-is-an-agent/README.md).
