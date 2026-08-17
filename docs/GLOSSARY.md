# Glossary

Every specialized term used in this repo, in plain English. If you hit a word
you don't recognize anywhere in this project, it should be here.

**Agent** — an LLM given a role, some instructions, and (usually) some tools,
run to do one job. In this repo: Writer and Verifier. See
[`curriculum/01-what-is-an-agent/`](../curriculum/01-what-is-an-agent/README.md).

**Agent Graph** — a set of nodes (agents, scripts, humans) connected by edges
that say what runs next and on what condition. The design, not any specific
runtime. See [`curriculum/02-what-is-a-graph/`](../curriculum/02-what-is-a-graph/README.md).

**Artifact** — a full result a node writes to disk once, so the next node
can be handed a small reference to it instead of the whole thing. See
[`curriculum/12-artifacts-and-references/`](../curriculum/12-artifacts-and-references/README.md).

**Dependency** — the reason a real edge exists: node B genuinely reads node
A's output. Written order alone is not a dependency. See
[`curriculum/04-dependency-analysis/`](../curriculum/04-dependency-analysis/README.md).

**Edge** — a rule for what happens after a node finishes: which node runs
next, and under what condition (always, only on success, only on a specific
exit code). See [`curriculum/03-nodes-and-edges/`](../curriculum/03-nodes-and-edges/README.md).

**Evidence** — the concrete, checkable facts a Verifier points to instead of
an opinion — a file's actual content, a command's actual exit code. The
opposite of "looks good."

**Exit code** — the number a program reports when it finishes, read by
whatever ran it to decide what happened. `0` conventionally means success;
any other number means some kind of failure — this repo's Gate uses `0` for
PASS, `1` for BLOCK, `2` for FREEZE (see
[`curriculum/14-verification-and-gates/`](../curriculum/14-verification-and-gates/README.md)).
After running a command, you can check the exit code of the last command
with `echo $?` (macOS/Linux/Git Bash) or `echo $LASTEXITCODE` (Windows
PowerShell).

**Failure state** — a specific, named way a node did not cleanly succeed
(`not_found`, `invalid`, `timeout`, `partial`, `needs_review`, ...), routed
on individually instead of collapsed into one generic error. See
[`curriculum/11-failure-as-data/`](../curriculum/11-failure-as-data/README.md).

**Fan-in** — multiple parallel branches converging back into one node that
combines their results (e.g. three checks feeding one synthesis step). See
[`curriculum/07-fan-out-fan-in/`](../curriculum/07-fan-out-fan-in/README.md).

**Fan-out** — one node's output triggering several independent branches at
once (e.g. one task spawning a security check, a style check, and a quality
check in parallel). See [`curriculum/07-fan-out-fan-in/`](../curriculum/07-fan-out-fan-in/README.md).

**Gate** — the deterministic (non-LLM) node that decides PASS, BLOCK, or
FREEZE by checking receipts against fixed rules. `01-claude-code/scripts/gate.js`
in this repo. See [`curriculum/14-verification-and-gates/`](../curriculum/14-verification-and-gates/README.md).

**Guardrail** — a check (often automatic) that constrains what an agent is
allowed to input or output, independent of whether the agent "wants" to
comply. The Writer's tool being restricted to `workspace/` in the OpenAI path
is a guardrail enforced in code, not just instructions.

**Handoff** — an OpenAI Agents SDK feature where one agent transfers an
entire in-progress conversation to another agent. See
[`docs/PLATFORM-COMPARISON.md`](./PLATFORM-COMPARISON.md).

**Human-in-the-loop** (also called **human approval**) — a point in the
graph where a real person must approve before anything proceeds (e.g.
before a PASS actually ships to production). See
[`docs/SAFETY.md`](./SAFETY.md) and
[`curriculum/14-verification-and-gates/`](../curriculum/14-verification-and-gates/README.md).

**Idempotency** — the property that running a step twice has the same
effect as running it once. What makes it safe for a resumed run to
potentially redo a step. See
[`curriculum/13-state-and-recovery/`](../curriculum/13-state-and-recovery/README.md).

**Join** — the node where a fan-out's parallel branches are synchronized
and combined; a barrier that waits for the complete set. See
[`curriculum/07-fan-out-fan-in/`](../curriculum/07-fan-out-fan-in/README.md).

**MCP (Model Context Protocol)** — an open protocol that lets an AI host
(Claude Code, Cursor, others) talk to external tools and data sources through
one common interface. Not required anywhere in this starter's beginner path —
see [`docs/MCP-MEMORY.md`](./MCP-MEMORY.md) for where it fits later.

**Model** — the actual AI (Claude, GPT, etc.) that reads text and predicts a
response. Has no memory or opinions of its own until given a prompt. See
[`curriculum/01-what-is-an-agent/`](../curriculum/01-what-is-an-agent/README.md).

**Node** — one worker in the graph: an LLM agent, a deterministic script, or a
human approval step. See [`curriculum/03-nodes-and-edges/`](../curriculum/03-nodes-and-edges/README.md).

**Node contract** — the rule that every meaningful node should have one job,
an explicit input, a structured output, and explicit failure states. See
[`curriculum/10-node-contracts/`](../curriculum/10-node-contracts/README.md).

**Observability** — being able to answer "what happened in this run, and
why?" after the fact, from records the graph already produced — not a
separate dashboard. See
[`curriculum/16-observability/`](../curriculum/16-observability/README.md).

**Orchestration** — the act of running a graph's nodes in the right order,
handling parallel branches, and following its edges. Claude Code's dynamic
workflows and the OpenAI Agents SDK's `Runner` are both orchestration
*runtimes* — the graph is the design they execute.

**Parallelism** — running more than one node at the same time instead of one
after another, because they don't depend on each other's output. See
[`curriculum/06-parallel-graphs/`](../curriculum/06-parallel-graphs/README.md).

**Prompt** — the text sent to a model: instructions plus whatever context it
needs. An agent's role is really just a reusable prompt. See
[`curriculum/01-what-is-an-agent/`](../curriculum/01-what-is-an-agent/README.md).

**Provenance** — a traceable record of where a fact or file came from and
what produced it, so a claim can be checked later instead of just trusted.

**Receipt** — a JSON file a node writes describing what it did and what it
found, e.g. `writer-receipt.json`. Evidence the Gate reads; not itself an
authority.

**Router** — a node (or edge condition) that sends execution down one of
several paths based on a check, e.g. "if verifier PASS, ship; if FAIL, rework."
See [`curriculum/08-routing/`](../curriculum/08-routing/README.md).

**SHA** — a cryptographic hash (e.g. of a git commit or a file) used to prove
exactly which version of something is being referred to, so "the candidate"
can't quietly shift underneath a claim about it.

**State** — the information that carries forward between nodes in a graph. In
this starter: the files under `runs/<run_id>/`.

**Streaming** — letting a downstream node process each parallel branch's
result as it arrives, instead of waiting for the complete set (that's a
join). See [`curriculum/07-fan-out-fan-in/`](../curriculum/07-fan-out-fan-in/README.md#join-vs-streaming).

**Subagent** — Claude Code's term for an agent spawned to do one scoped job
with its own instructions and tools, as a child of the main session. Writer
and Verifier in `01-claude-code/agents/` are subagents.

**Tool** — a specific action a model is allowed to trigger (read a file,
write a file, run a command) instead of only producing text. See
[`curriculum/01-what-is-an-agent/`](../curriculum/01-what-is-an-agent/README.md).

**Verifier** — a node whose entire job is to try to find problems with
another node's work, using evidence, and to never accept a claim just because
it sounds confident. See [`curriculum/14-verification-and-gates/`](../curriculum/14-verification-and-gates/README.md).

**Workflow** — Claude Code's feature for running a scripted, multi-agent
sequence (with parallel fan-out, pipelines, etc.) deterministically rather
than leaving orchestration to a single chat's judgment.
