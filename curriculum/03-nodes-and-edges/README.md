# 03 — Nodes, edges, and state

## What am I learning?

The three building blocks every graph in this repo is made of: nodes, edges,
and state — and where "state" actually lives on your disk.

## Why does it matter?

Lessons 05 onward each teach one *shape* a graph can take (sequential,
parallel, fan-out, conditional, looping). All of those shapes are just
different arrangements of nodes and edges. Once these three words are solid,
every later lesson is just a variation on them.

## What does it look like?

- **Node** — a worker. Three kinds appear in this repo:
  - an **LLM agent** (Writer, Verifier)
  - a **script** (Gate — deterministic code, not an LLM)
  - later: a **human approval** step
- **Edge** — a rule for what happens after a node finishes. An edge can be:
  - unconditional ("when Writer finishes, always run Verifier")
  - conditional ("if Gate exits 0, done; if it exits 2, stop hard")
- **State** — the information nodes hand to each other. In this starter,
  state is boringly literal: **files in a folder**, `runs/<run_id>/`.

```text
runs/demo-pass/
├── writer-receipt.json     <- Writer's node output (state Verifier reads)
├── verifier-receipt.json   <- Verifier's node output (state Gate reads)
└── warden-receipt.json     <- Gate's node output (state a human reads)
```

## How does it work?

Open [`01-claude-code/runs/demo-pass/writer-receipt.json`](../../01-claude-code/runs/demo-pass/writer-receipt.json).
That file *is* an edge's payload — it's what the Writer node hands to the
Verifier node. The Verifier doesn't get to see what the Writer was
"thinking"; it only gets this file and the actual files it claims to have
touched. That's deliberate: state is meant to be a small, explicit, checkable
handoff — not "trust my memory of the conversation."

Compare that to a single long chat: the "state" there is the entire
conversation history, which grows, gets noisy, and is hard to check. A graph
keeps state small and explicit on purpose.

## How do I run it?

```bash
cd 01-claude-code
cat runs/demo-pass/writer-receipt.json
cat runs/demo-pass/verifier-receipt.json
cat runs/demo-pass/warden-receipt.json
```

## What should I expect?

Three JSON files, each written by a different node, each one smaller and
more decided than the last — the Writer's receipt is the most narrative, the
Gate's `warden-receipt.json` is the most terse and final.

## What happens if it fails?

If state is missing or malformed (say, `writer-receipt.json` doesn't exist,
or isn't valid JSON), the next node in the chain has nothing to check —
that's not a "soft" failure, it's treated as a hard stop. You'll see exactly
this in lesson 14 and again for real in lessons 17–18's FREEZE demo.

## What should I experiment with?

Edit a scratch copy of `writer-receipt.json` (don't touch the real
`runs/demo-pass/` file) and remove the `"agent"` field entirely. Given what
you now know about state being "just a file the next node reads," what do
you predict the Verifier or Gate would do with a receipt missing that field?
Lesson 14 gives you the actual answer.

## Next

Continue to [`04-dependency-analysis/`](../04-dependency-analysis/README.md) —
before you build anything, learn to tell a real dependency from mere written
order.
