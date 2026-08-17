# Security policy

This is a teaching repository — a small, self-contained agent-graph starter
with no server, no database, and no network service. There is no deployed
system to attack. Still, a few things are worth stating.

## Reporting a concern

If you find a problem — a way the gate can be tricked into PASS when it
shouldn't, a path-traversal the checks miss, an unsafe instruction in the
docs, or anything that could mislead a beginner into an unsafe habit — please
open a GitHub issue. If you'd rather not post it publicly, say so in a minimal
issue ("found a gate bypass, prefer to share privately") and a maintainer will
follow up. There is no bug-bounty; this is a learning project.

## Scope and expectations

- The **gate** (`01-claude-code/scripts/gate.js`) is the security-relevant
  component: it is the deterministic authority that decides PASS/BLOCK/FREEZE.
  What it enforces is documented in
  [`docs/SAFETY.md`](./docs/SAFETY.md#what-the-gate-actually-checks) and covered
  by [`tests/gate.test.js`](./tests/gate.test.js). Changes to it should keep
  those tests green and add a test for any new invariant.
- The agents are **untrusted by design**. The whole point is that a model's
  claim is not evidence. Do not "fix" a gate FREEZE by loosening the gate.
- Running the real graph makes **paid API calls** and executes model-authored
  files locally. Read [`docs/SAFETY.md`](./docs/SAFETY.md) before pointing the
  writer at any input you did not write yourself (prompt-injection notes there).

## What this repo will never do on its own

Auto-push to a remote, auto-publish a package, or spend money outside your own
Claude/OpenAI plan. A human decides every release. See `docs/SAFETY.md`.
