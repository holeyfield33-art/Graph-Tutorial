# Platform comparison: Claude Code vs OpenAI Agents SDK

Both paths in this repo teach the **same graph** — Writer → Verifier → Gate.
They do not use identical APIs, and they shouldn't: the point is that the
architecture (nodes, edges, a script-owned release decision) survives the
switch, not that the code looks the same.

## Concept by concept

| Concept | Claude Code (`01-claude-code/`) | OpenAI Agents SDK (`02-openai-agents/`) |
|---|---|---|
| **Agent** | A subagent: a markdown file (`agents/writer.md`) with instructions, allowed tools, and a model, spawned by Claude Code's main session | A Python `Agent` object (`agents.Agent`) with `instructions`, `tools`, and an `output_type`, run via `Runner.run()` |
| **Node** | Each subagent, plus `gate.js`, is one node | Each `Agent`, plus `gate.js` (the *same file*, invoked as a subprocess), is one node |
| **Handoff** | Not used directly — the parent session spawns writer, waits, then spawns verifier | The SDK supports `handoff()` to transfer a whole conversation between agents; this starter uses sequential `Runner.run()` calls instead, for closer parity with the subagent model — see [`02-openai-agents/README.md`](../02-openai-agents/README.md#design-notes-why-not-handoff) |
| **Tools** | Declared per-subagent in the markdown frontmatter (`tools: Read, Grep, Glob, Edit, Write, Bash`) | Declared per-`Agent` as a Python list of `@function_tool`-decorated functions (`write_workspace_file`, `read_workspace_file`, ...) |
| **State / shared memory** | Files under `runs/<run_id>/`, read and written directly by subagent tool calls | The same *shape* of files, written by `receipts.py` from each agent's structured output — not written directly by the LLM |
| **Parallel work** | Claude Code dynamic workflows (`parallel()` / `pipeline()`) — see [`curriculum/06-parallel-graphs/`](../curriculum/06-parallel-graphs/README.md) | `asyncio.gather()` over multiple `Runner.run()` calls |
| **Verification** | The `verifier` subagent re-reads files with its own tool calls, ignoring the writer's summary | The `verifier` Agent re-reads files with `read_workspace_file`/`list_workspace_files`, ignoring the writer's summary |
| **Gate** | `node scripts/gate.js runs/<run_id>` — a plain script, not an LLM | The exact same script, invoked from Python via `subprocess.run()` — one authority, two frontends |
| **Human approval** | You, reading the PASS/BLOCK/FREEZE JSON and the receipt files before doing anything with the result | Identical — the Gate never auto-publishes anything on either path |

## Claude Code, OpenAI Agents SDK, and Codex are three different things

This trips people up, so it's worth stating plainly:

- **Claude Code** — the coding-agent environment you use to run the `01-claude-code/`
  path. Comparable in role to Codex.
- **OpenAI Agents SDK** — the Python library (`pip install openai-agents`) this
  repo's `02-openai-agents/graph.py` is built on. A library you import and call,
  not an interactive tool.
- **Codex** — OpenAI's own coding-agent *environment/product*, comparable to
  Claude Code. It is **not** the Agents SDK, and installing/using the Agents
  SDK does not require Codex at all. This repo's OpenAI path never uses Codex.

## What stays the same either way

1. An agent's claim is not evidence — a Verifier checks it.
2. A Verifier's claim is not authority — a deterministic Gate decides.
3. PASS means "the graph's own checks passed," not "ship to production."
4. Every run leaves a receipt trail on disk you can read after the fact.

Those four rules are the actual product. Everything else is runtime detail.
