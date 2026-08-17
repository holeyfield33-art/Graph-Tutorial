# 18 — OpenAI Agents SDK

## Before you code

**What is happening?** You're about to run two real graphs on the OpenAI
Agents SDK: the same Writer → Verifier → Gate release graph as the Claude
path, plus a genuine parallel fan-out/join example — Request → 3 concurrent
Workers → Join — that the Claude path doesn't have a dedicated script for
(you built the concept by hand in lesson 06).

**Why is it designed this way?** Because a beginner course claiming
"platform parity" (see
[`docs/PLATFORM-COMPARISON.md`](../../docs/PLATFORM-COMPARISON.md)) has to
actually demonstrate more than one topology on both platforms, not just the
release graph. The parallel example also makes concrete something lesson 06
only described: one node *definition*, instantiated many times.

**What will happen when you run it?** For the release graph: a Writer
agent creates real files, a Verifier agent independently checks them, and
the same `gate.js` script the Claude path uses decides PASS/BLOCK/FREEZE.
For the parallel example: three Worker calls run concurrently on three
different topics, then a join step (plain code, not another model call)
combines their findings.

Using Claude Code instead? See [`17-claude-code/`](../17-claude-code/README.md) —
you don't need this lesson.

## What am I learning?

Running the actual `02-openai-agents/` implementations.

## What does it look like?

The same Writer → Verifier → Gate diagram as lesson 02, implemented with
the OpenAI Agents SDK's `Agent` and `Runner` instead of Claude Code
subagents — plus the fan-out/join diagram from lesson 06, made real.

## How does it work?

Full setup, cost notes, and design rationale are in
[`02-openai-agents/README.md`](../../02-openai-agents/README.md) — read its
"Before you code" section first, then come back here.

## How do I run it?

```bash
cd 02-openai-agents
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
export OPENAI_API_KEY=sk-...   # Windows PowerShell: $env:OPENAI_API_KEY = "sk-..."
python graph.py
python graph_parallel.py
```

## What should I expect?

For `graph.py`, see
[`02-openai-agents/README.md`'s "What you should see"](../../02-openai-agents/README.md#what-you-should-see)
for exact expected output.

For `graph_parallel.py`, expect three `[worker:<topic>]` lines printing as
they each finish (order depends on which model call returns first — that's
the fan-out actually running concurrently, same as lesson 06's parallel
checks), then a `[graph_parallel] join:` line, then a JSON object listing
every topic covered and only the findings the workers reported as
high-confidence.

## What happens if it fails?

Same zero-cost sanity checks as the Claude path, using the same shared
`gate.js`:

```bash
node ../01-claude-code/scripts/gate.js runs/demo-pass
node ../01-claude-code/scripts/gate.js runs/demo-freeze
node ../01-claude-code/scripts/gate.js runs/demo-block
node ../01-claude-code/scripts/observe.js runs/demo-pass
```

If a real `python graph.py` run's Verifier disagrees with the Writer, you'll
get a real BLOCK — read `runs/<run_id>/verifier-receipt.json` for the
specific reason, same as the Claude path. `graph_parallel.py` has no gate —
it's illustrating a topology, not a release decision — so there's no
PASS/BLOCK/FREEZE to check there; a failed Worker call would surface as a
normal Python exception from `asyncio.gather`, same failure behavior lesson
06 showed with `Promise.all`.

## What should I experiment with?

Run `python graph.py --task "..."` with a task of your own choosing (see
the example in `02-openai-agents/README.md`). Watch the Verifier's `checks`
array in the resulting receipt — does it actually re-read the file, or does
it seem to be taking the Writer's word for it? That distinction is the
entire point of lesson 14.

Then open `graph_parallel.py` and add a fourth topic to the `topics` list
in `main()`. Re-run — you're adding a fourth instance of the *same* Worker
definition, not writing a fourth agent, exactly like lesson 06's "100
agents ≠ 100 roles" aside.

## Next

Continue to [`19-design-your-own-graph/`](../19-design-your-own-graph/README.md) —
the capstone.
