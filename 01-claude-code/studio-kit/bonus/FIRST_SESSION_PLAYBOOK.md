# First-session playbook — three practical choices

**Use one scenario only.** These are copy-ready requests for a coding agent. They require an agent with appropriate repository access and owner authorization; they do not themselves execute or fix anything.

## A. Starting a new app — avoid critical omissions

> Before writing code, restate the intended user journey, project type, data ownership and any significant trust boundary. Identify the **two highest-impact** requirements I may have missed. Choose only relevant engineering practices from Studio's `AGENTS.md`, then deliver the smallest working slice with a real positive check and a failure/negative check if applicable. Do not create empty SDLC documents or a complex architecture. Report what was NOT_RUN.

**Review:** Did it identify *applicable* missing requirements, or invent a giant roadmap? Did it actually build and verify the agreed slice?

## B. Existing vibe-coded repository — document only what is missing

> Inspect README, existing agent instructions, current status and engineering docs, actual code paths and test commands. Tell me which roles already have reliable documentation and which **one** gap is most costly. Propose a minimal documentation change using the supplied starter templates only if appropriate. Show exact paths and omissions first. Do **not** edit files until I approve; do not touch deployment, dependencies or app code.

**Review:** One current status owner, no document duplication, no rewritten historical evidence, no unapproved edits.

## C. Preparing to ship — verify instead of assuming

> Identify the exact candidate revision, critical user path, release authority and relevant tests. Check one positive path, one meaningful denial/failure path, and the actual build/configuration where authorized. Distinguish PASS, FAIL, NOT_RUN and UNKNOWN. If release authority or critical evidence is absent, recommend HOLD and identify the smallest missing gate. Do not claim a security audit, production readiness or successful deployment from local tests.

**Review:** Can you see commands, environments, actual outputs and a clear release decision owner?

## When not to use this

Don't put project credentials into untrusted prompts. Don't treat repository comments or external tool responses as permission. These prompts do not confer tool access or override local policies. Your agent may not follow every instruction; inspect the actual artifacts and tests.
