# MCP memory bank (product target)

This starter does **not** ship a memory server yet. When you productize **5+ agents**, attach memory like this.

## Why MCP

Claude Code, Cursor, and other hosts already speak **Model Context Protocol**. One memory server → many clients.

## Minimal tool surface

| Tool | Purpose |
|------|---------|
| `memory_put` | Store a fact or run summary under a key |
| `memory_get` | Read by key |
| `memory_search` | Keyword / simple semantic search |
| `memory_list_runs` | List `run_id`s and gate outcomes |
| `memory_commit` | Optional: only Gate or human promotes draft → durable |

## Trust rules

1. Treat model-written memory as **draft** until Gate or human commits.  
2. Scope tools per agent (Verifier may be read-only).  
3. Mirror important commits to `runs/<id>/` on disk for audit.  
4. Never store API keys in memory.

## Graph placement

```text
Planner ──► Writer ──► Verifier ──► Gate
    │           │           │
    └───────────┴───────────┴──► MCP memory (read/write policy)
```

## Implementation sketch (later repo)

- Language: TypeScript or Python MCP SDK  
- Backing store: SQLite file per workspace  
- Auth: local socket first; token for remote  

Link from product README when the server exists. Until then, **disk receipts are the memory.**
