# Which documents should a maintained repo have?

The goal is **clear project truth**, not the maximum number of Markdown files. Reuse a project's existing names, e.g. `docs/CURRENT_STATUS.md` is fine instead of `docs/STATUS.md`.

| Role | Typical file | Include when | Do not turn into |
|---|---|---|---|
| What the project is | `README.md` | Almost every shared project | Historical report or backlog dump |
| What the coding agent must follow | `AGENTS.md` | An agent actively works on the project | Universal rules that override the owner's policy |
| What is true *now* | `docs/STATUS.md` | Multiple work sessions or nontrivial blockers | A second changelog or invented PASS dashboard |
| Users, flows, scope, non-goals | `docs/PRODUCT.md` | UX, user types or requirements matter | A daily progress log |
| Engineering decisions and checks | `docs/SDLC.md` | Architecture, release, trust and test boundaries warrant durable reference | A compulsory waterfall checklist |
| Changes by version | `CHANGELOG.md` | Public or user-visible behavior changes | The only source of current readiness |
| Why a costly design choice was made | `docs/decisions/` | Alternatives and reversibility need history | A folder of empty ADRs |
| Observed runs, checkpoints | `docs/evidence/` | Consequential proof or reproducibility needed | A claim that tests ran when they did not |

## A minimal read order
1. README — the public purpose and usage.
2. AGENTS — local working constraints and permissions.
3. One current STATUS if the project uses one.
4. Applicable PRODUCT / SDLC pages only for this task.
5. Tests, source, actual current branch and revision.

## Practical project hygiene
- Do not create a file if equivalent authoritative information already exists.
- Leave historical evidence intact. Avoid mass renames, speculative architecture and blank scaffolding.
- Current status must identify whether facts are OBSERVED, DECLARED, PROPOSED or UNKNOWN.
- Tests must distinguish PASS, FAIL, NOT_RUN and HOLD.
- A model may propose a release but cannot authorize it for the owner.
- A project with no deployment has no reason to invent production uptime or rollback artifacts.

Derived from Studio's `docs/REPOSITORY_KNOWLEDGE_LAYOUT.md` (2026-11-01) and `docs/PRODUCT_INTENT.md`.
