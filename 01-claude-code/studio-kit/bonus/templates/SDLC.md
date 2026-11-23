# Project-specific engineering contract

**Project:** [name]    **Scope/revision:** [branch/commit or UNKNOWN]
**Owner / release authority:** [role or UNKNOWN]

This is a selective, living **engineering guide**, not a mandate to execute all SDLC stages.

## Product and interfaces
- Primary users and job-to-be-done: [short]
- Interface(s): [web/API/CLI/mobile/other]
- Critical user path(s): [short, observable]
- Non-goals: [what we won't build now]

## Existing architecture — inspect before specifying
- Runtime and dependencies: [verified versions or UNKNOWN]
- Important modules and data paths: [links]
- Invariants or compatibility contracts: [short]
- Deployment / data persistence: [actual state or NOT_APPLICABLE]

## Risk-relevant engineering decisions
- Authentication versus authorization: [applicable boundary and owner or NOT_APPLICABLE]
- Data ownership / tenant isolation: [applicable? why?]
- Input validation / failures: [relevant examples]
- Secrets, capabilities and external services: [where applicable]
- Recovery, migration or rollback: [where applicable]

## Proportional verification
| Behavior | Positive check | Negative/failure check | Actual evidence |
|---|---|---|---|
| [critical path] | [expected valid behavior] | [expected denial or error] | [NOT_RUN until executed] |

## Release and maintenance
- Commands that actually build/test: [verified command or UNKNOWN]
- Who can approve production changes: [role]
- Rollback or recovery approach: [when deployed or changing persisted data]
- Maintenance triggers: changes, dependencies, incidents, releases; periodic review only if operated
- Current truth lives in: [one STATUS path if maintained]

## Stop conditions
Hold consequential actions if authority is absent, version or risk is unknown, source facts conflict, or verification evidence is missing. Do not treat local tests as proof of production readiness.

Keep project-specific facts here. Avoid copying status, inventing controls, or adding enterprise architecture for a small app.
