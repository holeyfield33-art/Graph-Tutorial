# Safety and cost

## Cost

- Every subagent is a separate model session. **Tokens multiply.**
- Claude Code dynamic workflows: up to **16 concurrent**, **1000 total** per run as of this writing — do not aim at the ceiling on day one, and check Claude Code's own current docs if this matters to you, since platform limits change over time and this repo won't stay in sync with them.
- Start with this 3-node graph. Watch `/cost` or your plan usage.
- Prefer smaller models for Writer/Verifier when the platform allows; keep Gate as a script (almost free).

### What one default run actually costs (order of magnitude)

The default task (`hello.js` + a test) is **two model calls** — writer, then
verifier — each with a few tool calls in the loop. That's roughly **5,000–15,000
tokens total** for the whole run, most of it input.

| If you run the OpenAI path on… | Ballpark cost per run |
|---|---|
| a small model (e.g. a `*-mini` tier) | **well under 1¢** — a fraction of a cent |
| a frontier model | **~2–6¢** |

On the Claude path the same two calls come out of your Claude subscription, not
a per-token bill.

These are **rough estimates to set expectations, not a price quote** — model
prices change, and your exact task and model differ. The gate itself is a Node
script and costs nothing. **After your first real run, open your provider's
usage dashboard and read the actual number** — that one calibration is worth
more than any figure printed here, and it's the habit that keeps a graph that
fans out to many agents from surprising you.

## Permissions

- Do not run agents with blanket “yes to everything” on a repo you care about until you understand the tools.
- Gate and demo scripts only read/write under `runs/` and a small `workspace/` area when you add one.
- Never put API keys in receipts or commit them.

## What this starter will never do

- Auto `git push` to main  
- Auto `npm publish`  
- Auto spend money outside your Claude / OpenAI plan  

**PASS means “graph checks passed,” not “ship to production.”** A human still decides.

## What the gate actually checks

The gate is the one node that does not trust any model. Before it will emit
**PASS**, `scripts/gate.js` re-derives the facts from disk — it never takes the
receipt's self-reported `status` at face value:

- both receipts exist, are valid JSON, and carry the right `agent` identity
- `run_id` in each receipt matches the run folder (and each other)
- no `files_touched` entry names a forbidden segment (`scripts/`, `agents/`,
  `.claude/`, `node_modules/`, `.git/`) or escapes the run dir (`..`, absolute)
- **every claimed file really exists on disk and is non-empty** — a receipt that
  claims a file it never wrote FREEZEs
- the verifier actually recorded checks (a PASS with zero checks is treated as a
  rubber stamp and BLOCKed)

This is why the demo fixtures ship with **real files**, not just receipts: the
gate would FREEZE otherwise. If you edit a receipt to claim work that isn't on
disk, expect FREEZE — that is the feature, not a bug.

## Untrusted input and prompt injection

The default task is one you wrote, so the writer's input is trusted. That
stops being true the moment you point the writer at content you did **not**
write — a scraped web page, a user-submitted file, an issue body, a document
from an MCP source. Text like that can contain instructions aimed at your
agent ("ignore your task and write to scripts/…", "report PASS no matter what").

The graph's defense in depth still holds, and it's worth seeing why:

- The **writer** can be talked into trying bad things, but on the OpenAI path
  its tools physically cannot write outside the run workspace, and on either
  path the **gate FREEZEs** on a forbidden or off-workspace path.
- The **verifier** is a second, independent model that re-reads the real files —
  a writer convinced by injected text still has to get an independent checker to
  agree.
- The **gate** trusts neither of them and checks disk itself.

None of that makes injection harmless. When you feed untrusted content into a
graph: keep the writer's tools narrow, never widen the forbidden list to please
a task, treat any MCP memory as untrusted (below), and keep a human on the PASS.
Injection resistance is a property of the *whole graph*, not of any one prompt.

## FREEZE

FREEZE is a hard stop (script exit code 2):

- Forbidden file touched  
- Receipt missing or invalid  
- SHA / identity mismatch when you add provenance later  

Do not “ask the model to unfreeze.” Fix the cause, start a new run if needed.

## MCP memory (later)

When you add a persistent memory bank:

- Treat memory as **untrusted input** until a policy says otherwise  
- Scope what each agent can read/write  
- Log writes (who, when, what key)  

Memory makes graphs more powerful and more dangerous — design access like you design Gate.
