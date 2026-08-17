# Roadmap: from starter → product

## Phase 0 — this repo (done as template)

- [x] 3 nodes: Writer, Verifier, Gate.js  
- [x] Receipts + PASS / BLOCK / FREEZE  
- [x] Copy-paste prompts for no-code users  
- [x] Optional OpenAI handoffs twin  

## Phase 1 — teach and harden (days)

- [x] Add a tiny `workspace/` sample project the Writer must edit  
- [x] Demo BLOCK path (verifier fails → rework instructions) — `01-claude-code/runs/demo-block/`
      and `02-openai-agents/runs/demo-block/`
- [x] Full beginner curriculum (`curriculum/00-start-here/` … `19-design-your-own-graph/`)
- [x] Real, runnable OpenAI Agents SDK path (`02-openai-agents/graph.py`) — no longer a sketch
- [ ] One saved Claude **workflow** prompt that always uses the same agents  
- [ ] Screenshot / short Loom of a PASS and a FREEZE run  

## Phase 2 — five-or-more agent product graph

Example product topology:

```text
Planner        → breaks goal into tasks (LLM)
Writer         → implements (LLM)
Verifier       → attacks / tests (LLM)
Critic         → style or policy review (LLM)
Memory I/O     → read/write MCP memory bank (tool node)
Gate           → deterministic PASS/BLOCK/FREEZE (script)
Human          → final approval (edge out)
```

Rules that stay:

1. Gate is never an LLM.  
2. No agent marks its own work RELEASE.  
3. Every run has a `run_id` and receipts on disk (and later in memory).  

## Phase 3 — MCP persistent memory bank

**Goal:** facts and run summaries survive across sessions and machines.

Suggested approach:

| Item | Choice |
|------|--------|
| Interface | MCP server (so Claude Code / Cursor / other hosts share one tool surface) |
| Store | SQLite or embedded KV first; Postgres when multi-user |
| Tools | `memory_get`, `memory_put`, `memory_search`, `memory_list_runs` |
| Trust | Agents may propose writes; optional “commit” tool only Gate or human can call |

Wire-up sketch:

```text
Claude Code  ──MCP──►  memory-bank server  ──►  SQLite
     ▲                        │
     └──── receipts/runs also mirrored on disk for audit
```

Starter does **not** ship the server yet — only the hooks in docs and empty `memory/` notes so the product path is obvious.

## Scaling note: what "100 agents" actually means

Larger multi-agent systems get described in terms of agent *count*, which
invites the wrong mental model. In practice it almost always means one node
*definition*, instantiated many times over many pieces of input — the fan
topology from [`curriculum/06-parallel-graphs/`](../curriculum/06-parallel-graphs/README.md),
just wider:

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

Scaling a fan doesn't require inventing new roles — it requires more
instances of one, plus the cost/latency math from
[`curriculum/15-cost-and-performance/`](../curriculum/15-cost-and-performance/README.md)
actually adding up for your use case. This starter never runs anywhere near
that many agents; the point is understanding the shape, not the scale.

## The intended progression

```text
FREE
3-agent beginner graph            <- this repo, today
        ↓
CUSTOM
5-agent graph
        ↓
ADVANCED
8–16 agent graph
        ↓
HOROS + MNEME + MCP               <- persistent memory, context routing, governance
        ↓
CUSTOM GRAPH ENGINEERING
```

Horos and Mneme are future product names for the persistent-memory and
governance layer described in Phase 3 above — nothing in
[`curriculum/`](../curriculum/README.md) depends on them, and nothing in the
beginner path requires knowing they exist. They belong here, in the
roadmap, not in the lessons.

## Phase 4 — monetize (later)

Ideas aligned with the graph:

1. **Template pack** — industry-specific graphs (support, security review, content)  
2. **Hosted memory + audit** — teams pay for durable runs and receipts  
3. **Gate-as-a-service** — CI checks the same PASS/BLOCK/FREEZE contracts  
4. **Course / cohort** — “zero to graph” with office hours  

Ship free teaching material first; paid layer sits on memory, templates, and compliance, not on locking the README.

## Non-goals

- Replacing LangGraph for every enterprise case on day one  
- 1000-agent demos as the default tutorial  
- Letting the model own production deploy keys  
