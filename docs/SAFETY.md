# Safety and cost

## Cost

- Every subagent is a separate model session. **Tokens multiply.**
- Claude Code dynamic workflows: up to **16 concurrent**, **1000 total** per run as of this writing — do not aim at the ceiling on day one, and check Claude Code's own current docs if this matters to you, since platform limits change over time and this repo won't stay in sync with them.
- Start with this 3-node graph. Watch `/cost` or your plan usage.
- Prefer smaller models for Writer/Verifier when the platform allows; keep Gate as a script (almost free).

## Permissions

- Do not run agents with blanket “yes to everything” on a repo you care about until you understand the tools.
- Gate and demo scripts only read/write under `runs/` and a small `workspace/` area when you add one.
- Never put API keys in receipts or commit them.

## What this starter will never do

- Auto `git push` to main  
- Auto `npm publish`  
- Auto spend money outside your Claude / OpenAI plan  

**PASS means “graph checks passed,” not “ship to production.”** A human still decides.

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
