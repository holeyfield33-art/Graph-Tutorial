# OpenAI Agents SDK path

The same 3-node graph as [`01-claude-code/`](../01-claude-code/), built on the
**OpenAI Agents SDK** instead of Claude Code subagents. This is a real, runnable
implementation — running `graph.py` makes actual API calls, writes actual receipt
files, and calls the actual same `gate.js` script the Claude path uses.

You do **not** need Claude or Claude Code to follow this path. You do need an
OpenAI account with API access (this uses the API, billed per token — see
[Cost](#cost) below).

## Before you code

**What is happening?** Two OpenAI Agents SDK `Agent`s run one after another —
`writer`, then `verifier` — each backed by a real LLM call. The writer has exactly
one tool, restricted to writing files under the run's own
`runs/<run_id>/workspace/`. The verifier has two
read-only tools and is never shown the writer's summary as ground truth — it has
to re-read the files itself. Both agents return a structured, typed answer
(a Pydantic model), and plain Python code — not the model — turns that answer into
the receipt JSON files on disk. Then Python shells out to
`node ../01-claude-code/scripts/gate.js` on those receipts, exactly like the
Claude path does.

**Why is it designed this way?** Two reasons. First, parity: one Gate script
should be the single release authority regardless of which platform ran the
agents — see [`docs/PLATFORM-COMPARISON.md`](../docs/PLATFORM-COMPARISON.md).
Second, trust: the receipt file is the thing `gate.js` decides on, so it must not
be something the model free-typed into existence — it's assembled by
[`receipts.py`](./receipts.py), plain deterministic code, from the model's
structured output. See [`curriculum/14-verification-and-gates/`](../curriculum/14-verification-and-gates/README.md).

**What will happen when you run it?** You'll see `[graph] Writer: ...` then
`[graph] Verifier: ...` then the same PASS/BLOCK/FREEZE JSON from `gate.js` that
the Claude path prints, with the same three exit codes (0/1/2).

## Setup

```bash
cd 02-openai-agents
python -m venv .venv
# macOS/Linux:
source .venv/bin/activate
# Windows (PowerShell):
.venv\Scripts\Activate.ps1

pip install -r requirements.txt
```

**How do I know this worked?** Run `python -c "import agents; print(agents.__version__)"`
— it should print a version number (this repo was verified against `0.21.0`), not an
`ImportError`.

Set your API key (get one at platform.openai.com — this is a *separate* account
from ChatGPT/Claude and is billed separately):

```bash
# macOS/Linux:
export OPENAI_API_KEY=sk-...
# Windows (PowerShell):
$env:OPENAI_API_KEY = "sk-..."
```

## Try it with zero API cost first

Every receipt in this folder's `runs/demo-pass/`, `runs/demo-freeze/`, and
`runs/demo-block/` is a real, static fixture — you can exercise the actual Gate
right now, no key, no install beyond Node.js:

```bash
node ../01-claude-code/scripts/gate.js runs/demo-pass
node ../01-claude-code/scripts/gate.js runs/demo-freeze
node ../01-claude-code/scripts/gate.js runs/demo-block
```

Expected: `PASS` (exit 0), then `FREEZE` (exit 2), then `BLOCK` (exit 1) — same
three outcomes, same script, as the Claude path. That's the platform-parity claim
made concrete: **the graph's authority is the same file, not a reimplementation.**

## Run the real graph (needs OPENAI_API_KEY)

```bash
python graph.py
```

### What you should see

```text
[graph] run_id=demo-20260816-101500
[graph] Writer: starting...
[graph] Writer: PASS — Added hello.js and a test that checks the return value.
[graph] Verifier: starting...
[graph] Verifier: PASS
[graph] Gate: node 01-claude-code\scripts\gate.js runs/demo-20260816-101500
{
  "agent": "gate",
  "status": "PASS",
  ...
}
```

**What this means:** the writer LLM call produced a file and a structured
status; the verifier LLM call independently re-read that file with its own
tools and agreed; the Gate — plain code, no model involved — checked both
receipts against its rules and let it through. Read
`runs/demo-<id>/*.json` afterward to see exactly what each node claimed.

### If the verifier disagrees

The verifier is instructed not to trust the writer's summary, so it will
sometimes return `FAIL` on a real run — for example if it decides the test
file doesn't meaningfully check the output. That's the graph working as
intended: run `cat runs/<run_id>/verifier-receipt.json` to see the specific
`failures` it found, same as the Claude path's BLOCK outcome.

### Try your own task

```bash
python graph.py --task "Create workspace/add.js exporting add(a, b) that returns a + b, and workspace/add.test.js that checks add(2, 3) === 5"
```

## Cost

Every `graph.py` run is two real API calls (writer, verifier), each with tool
calls in the loop. Costs vary by model — check your OpenAI usage dashboard
after your first run to calibrate before running it many times. See
[`docs/SAFETY.md`](../docs/SAFETY.md) for the same discipline applied to the
Claude path.

## A real parallel example

`graph.py` is a sequential release graph — writer, then verifier, then
gate. It's not the only topology worth seeing on this platform.
[`graph_parallel.py`](./graph_parallel.py) is a second, independent script
showing genuine fan-out/join:

```text
Request
   ├→ Worker("pricing")
   ├→ Worker("security")
   └→ Worker("performance")
         ↓
       Join
```

Run it:

```bash
python graph_parallel.py
```

One `Agent` definition (`worker_agent`), instantiated three times with
`asyncio.gather` — not three different agents. Each call gets a different
topic; all three run concurrently, not one after another. A plain Python
function (`join()`) — not another model call — combines the three
structured results once every worker has reported back. See
[`curriculum/06-parallel-graphs/`](../curriculum/06-parallel-graphs/README.md)
for the same idea without any SDK involved, and
[`curriculum/18-openai-agents/`](../curriculum/18-openai-agents/README.md)
for the full lesson.

There's no Gate in this script — it's demonstrating a topology, not a
release decision, so there's nothing to PASS/BLOCK/FREEZE.

## Design notes: why not `handoff()`?

The Agents SDK's signature feature is **handoffs** — one agent can transfer an
entire conversation to another mid-run. That's a real and useful pattern, but
it blurs the per-node structure this starter is trying to teach (which agent
produced which receipt, at which point). `graph.py` instead makes two separate,
sequential `Runner.run()` calls — one per node — which maps directly onto the
Claude path's "spawn one subagent, then spawn the next" model. Once you
understand the graph shape, `handoff()` is worth learning as an alternative way
to wire the same edges; see the
[official handoffs docs](https://openai.github.io/openai-agents-python/handoffs/).

## Codex vs Agents SDK

These are two different things with a similar name:

| Name | What it is |
|------|------------|
| **OpenAI Agents SDK** (`openai-agents`, imported as `agents`) | The Python library this folder uses to build agents, give them tools, and run them. This is what `graph.py` runs on. |
| **Codex** | OpenAI's coding-agent *environment/product* (comparable to Claude Code itself) — a place you interactively ask an agent to write code for you. It is not the library used here and importing `agents` has nothing to do with it. |

See [`docs/PLATFORM-COMPARISON.md`](../docs/PLATFORM-COMPARISON.md) for the full
concept-by-concept table against the Claude path.

## Files

| File | Purpose |
|------|---------|
| `graph.py` | The runnable release graph: writer agent → verifier agent → `gate.js` |
| `graph_parallel.py` | A runnable fan-out/join graph: 3 concurrent Worker calls → plain-code join |
| `receipts.py` | Deterministic, network-free receipt-writing (run `python receipts.py` for a self-test) |
| `requirements.txt` | Pinned SDK dependency (0.21.x) |
| `runs/<run_id>/workspace/` | Where each run's writer agent creates its files (one workspace per run) |
| `runs/demo-{pass,freeze,block}/` | Static fixtures with real files — exercise `gate.js` with zero API cost |
