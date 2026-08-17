# agent-graph-starter

**Zero → first agent graph.** A beginner course in agent graph engineering,
with a real, runnable 3-node graph as the central example — on Claude Code
**or** the OpenAI Agents SDK, your choice.

## Zero-knowledge start

- **What is this?** A hands-on course plus a working example that teaches
  you how to design a small team of AI agents that work together on a task,
  with a real deterministic checkpoint before anything is called "done."
- **Who is it for?** Someone who has never built an agent — no prior coding
  experience required to learn the concepts (lessons 00–03 are pure reading).
- **What will I learn?** Dependency analysis, sequential and parallel
  execution, fan-out/fan-in, routing, controlled cycles, node contracts,
  failure-as-data, artifacts and references, state and recovery,
  verification, deterministic gates, cost/performance tradeoffs, and
  observability — see the full [`curriculum/`](./curriculum/README.md), a
  20-lesson course (00–19).
- **What do I need?** A computer, ~15 minutes for your first working graph,
  and **either** a Claude Code subscription **or** an OpenAI API account —
  not both.
- **How much does it cost?** Nothing to learn the concepts (no AI calls at
  all through lesson 16). Running the real graph costs a couple of small LLM
  calls — a small fraction of a dollar, or included in a Claude subscription.
- **Do I need Claude?** No — only if you're taking that path.
- **Do I need OpenAI?** No — only if you're taking that path instead.
- **How long does the first exercise take?** About 10–15 minutes from a
  clean checkout, if Node.js (and Claude Code, or Python, depending on your
  path) is already installed.
- **What will I build?** The graph below, run for real, plus two deliberate
  failures so you understand exactly why each one exists.

**Start the curriculum here:** [`curriculum/00-start-here/`](./curriculum/00-start-here/README.md)

---

## What you will build

```text
        ┌─────────────┐
        │   Writer    │  (Agent 1 — does the work)
        └──────┬──────┘
               │  receipt + files
               ▼
        ┌─────────────┐
        │  Verifier   │  (Agent 2 — attacks claims, does not trust Writer)
        └──────┬──────┘
               │  verifier receipt
               ▼
        ┌─────────────┐
        │   Gate.js   │  (deterministic script — NOT an LLM)
        └──────┬──────┘
               │
     PASS ─────┼───── BLOCK ───── FREEZE
   (ok to ship)   (rework)     (hard stop)
```

**Rule that matters:** only the script decides release. Agents write receipts. They never promote themselves.

---

## 15-minute path (skip the curriculum, run code now)

New to agent graphs? Read [`curriculum/00-start-here/`](./curriculum/00-start-here/README.md)
first — this section is for people who want to see it run before reading why.

### 0. You need

- [Claude Code](https://code.claude.com) installed (paid plan; Pro works — enable Dynamic workflows in `/config` if asked)
- Node.js 18+ (`node -v`)
- Git (optional but useful)

(Prefer OpenAI? See [`02-openai-agents/README.md`](./02-openai-agents/README.md) instead — same steps, different platform.)

### 1. Clone or download this repo

```bash
cd agent-graph-starter/01-claude-code
```

### 2. Run the gate on the demo runs (no AI yet)

```bash
node scripts/gate.js runs/demo-pass
node scripts/gate.js runs/demo-freeze
node scripts/gate.js runs/demo-block
```

You should see **PASS**, then **FREEZE**, then **BLOCK**. That is the whole product idea in three commands — see [`curriculum/14-verification-and-gates/`](./curriculum/14-verification-and-gates/README.md) for what each one means.

### 3. Copy agent files into Claude Code

```bash
mkdir -p .claude/agents
cp agents/writer.md .claude/agents/
cp agents/verifier.md .claude/agents/
```

(Or open Claude Code in this folder and ask it to install the agents from `agents/`.)

### 4. Paste one prompt

Open Claude Code in `01-claude-code/` and paste from [`PROMPTS.md`](01-claude-code/PROMPTS.md) — start with **Prompt A (full graph)**.

### 5. Read the run folder

After the run, open `runs/<your-run-id>/`:

- `writer-receipt.json`
- `verifier-receipt.json`
- `warden-receipt.json` (written by `gate.js`)

Or get a one-line-per-node summary instead of opening each file:

```bash
node scripts/observe.js runs/<your-run-id>
```

If anything doesn't match what `PROMPTS.md` says to expect, see [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md).

---

## Why this is "graph engineering"

| Piece | In this repo |
|--------|----------------|
| **Node** | Writer, Verifier, Gate |
| **Edge** | handoff / "when Writer finishes → Verifier" / exit codes from Gate |
| **Shared state** | files under `runs/<id>/` |
| **Trust boundary** | Gate is a script; models are untrusted |

Frontier platforms (Claude subagents + workflows, OpenAI Agents SDK) are the **runtime**. The graph is the **design**. Full concept-by-concept breakdown: [`curriculum/`](./curriculum/README.md).

---

## Folder map

| Path | Purpose |
|------|---------|
| `curriculum/` | The beginner course — start here if you haven't already |
| `01-claude-code/` | Claude path — agents, gate script, prompts, demo runs (PASS/BLOCK/FREEZE) |
| `02-openai-agents/` | OpenAI Agents SDK path — real runnable graph, same gate script |
| `docs/GLOSSARY.md` | Every term used in this repo, defined once |
| `docs/TROUBLESHOOTING.md` | Common errors and fixes |
| `docs/PLATFORM-COMPARISON.md` | Claude Code vs OpenAI Agents SDK vs Codex, concept by concept |
| `docs/GRAPH-DESIGN-WORKSHEET.md` | 20 questions to work through before building your own graph |
| `docs/WHY.md` | Plain-English nodes, edges, why not one big agent |
| `docs/ROADMAP.md` | Path to 5+ agents + MCP memory bank |
| `docs/SAFETY.md` | Cost, permissions, no auto-publish |

---

## What next? (product direction, not required tonight)

This starter is intentionally simple: three nodes, no database, no
dashboard, no hosted infrastructure — see [Non-goals](./docs/ROADMAP.md#non-goals).
Once you're comfortable with the graph shape here, the same rules (a script
owns release, agents propose) scale up:

1. Add Planner + Critic + Release Warden (5 nodes).
2. Attach an **MCP memory bank** so runs share durable facts across sessions.
3. Swap the toy task for your real domain (security gate, content pipeline, etc.).

See [`docs/ROADMAP.md`](docs/ROADMAP.md).

---

## License

MIT — use it, fork it, teach with it.
