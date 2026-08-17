# Curriculum: zero to your own agent graph

A guided path from "I don't know what an agent graph is" to "I can build a
basic 3-agent graph myself — and design my own." Go in order — each lesson
builds on the last.

No coding experience is assumed until lesson 05, and even then you're told
exactly what you need to know, when you need to know it.

| # | Lesson | Needs code? | Needs an API key? |
|---|--------|:---:|:---:|
| 00 | [Start here](./00-start-here/README.md) | No | No |
| 01 | [What is an agent?](./01-what-is-an-agent/README.md) | No | No |
| 02 | [What is a graph?](./02-what-is-a-graph/README.md) | No | No |
| 03 | [Nodes and edges](./03-nodes-and-edges/README.md) | No | No |
| 04 | [Dependency analysis](./04-dependency-analysis/README.md) | Yes (runs for you) | No |
| 05 | [Sequential graphs (chain)](./05-sequential-graphs/README.md) | Yes (runs for you) | No |
| 06 | [Parallel graphs (fan)](./06-parallel-graphs/README.md) | Yes (runs for you) | No |
| 07 | [Fan-out and fan-in](./07-fan-out-fan-in/README.md) | Yes (runs for you) | No |
| 08 | [Routing](./08-routing/README.md) | Yes (runs for you) | No |
| 09 | [Controlled cycles](./09-controlled-cycles/README.md) | Yes (runs for you) | No |
| 10 | [Node contracts](./10-node-contracts/README.md) | Yes (runs for you) | No |
| 11 | [Failure as data](./11-failure-as-data/README.md) | Yes (runs for you) | No |
| 12 | [Artifacts and references](./12-artifacts-and-references/README.md) | Yes (runs for you) | No |
| 13 | [State and recovery](./13-state-and-recovery/README.md) | Yes (runs for you) | No |
| 14 | [Verification and gates](./14-verification-and-gates/README.md) | Yes (runs for you) | No |
| 15 | [Cost and performance](./15-cost-and-performance/README.md) | Yes (runs for you) | No |
| 16 | [Observability](./16-observability/README.md) | Yes (runs for you) | No |
| 17 | [Claude Code](./17-claude-code/README.md) | Yes (you run it) | Yes (Claude) |
| 18 | [OpenAI Agents SDK](./18-openai-agents/README.md) | Yes (you run it) | Yes (OpenAI) |
| 19 | [Design your own graph](./19-design-your-own-graph/README.md) | Yes (you write it) | Same as 17/18 |

**"Needs code?"** — lessons 00–03 are pure reading, no terminal required.
Lessons 04–16 each have a tiny, dependency-light snippet you run with one
command (`node example.js`) to see the idea in action — no AI, no account,
no cost. Lessons 17–18 are where you run the real graph on whichever
platform you actually have. Lesson 19 is where you build your own, using the
[Graph Design Worksheet](../docs/GRAPH-DESIGN-WORKSHEET.md).

## How each lesson is structured

Every lesson answers, in order: what am I learning, why does it matter, what
does it look like, how does it work, how do I run it, what should I expect,
what happens if it fails, and what should I experiment with. If you're ever
lost, that ordering is your map back.

## The non-negotiable principle (read this once, it repeats everywhere)

> **Graph engineering is dependency engineering.**
>
> `sequence ≠ dependency`

An edge exists because a node genuinely needs another node's output — not
because you happened to write them in that order. Lesson 04 makes this
concrete; lessons 05–09 are, underneath, all variations on this one rule
applied to different shapes.

## Reference material (use alongside the lessons, not instead of them)

- [`docs/GLOSSARY.md`](../docs/GLOSSARY.md) — every term, defined once
- [`docs/TROUBLESHOOTING.md`](../docs/TROUBLESHOOTING.md) — common errors and fixes
- [`docs/PLATFORM-COMPARISON.md`](../docs/PLATFORM-COMPARISON.md) — Claude Code vs OpenAI side by side
- [`docs/GRAPH-DESIGN-WORKSHEET.md`](../docs/GRAPH-DESIGN-WORKSHEET.md) — the 20 questions behind lesson 19's capstone
- [`docs/SAFETY.md`](../docs/SAFETY.md) — cost, permissions, what this repo will never do
- [`docs/ROADMAP.md`](../docs/ROADMAP.md) — where this goes after the starter graph

## If you just want to run code right now

Skip to [`curriculum/17-claude-code/`](./17-claude-code/README.md) or
[`curriculum/18-openai-agents/`](./18-openai-agents/README.md) — it'll work,
but you'll be pattern-matching instead of understanding. Come back to 00–16
once you're curious why it's built the way it is.
