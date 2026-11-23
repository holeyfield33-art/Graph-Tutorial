# Studio Engineering Kit v0.3 — four-agent graph orchestration

**Mode:** DESIGN_REVIEW completed; bounded MODEL_ASSISTED_ENGINEERING experiment.

## Frozen knowledge authority
Use the exact supplied Studio Engineering Kit v0.3 release-candidate ZIP as the **authoritative** knowledge snapshot, not the public repository HEAD. Archive SHA-256:

`c87ab198d3ebfe128c1caf5273630c01eab868c01360ea48b2500d96d30c8c52`

Extract all 13 Markdown files, preserving relative paths, beneath `studio-kit/`. Verify the archive hash before extraction. The public `holeyfield33-art/studio-engineering-kit` main was only partially identical at review: core `AGENTS.md`, `PRACTICES.md`, `BOUNDARIES.md` matched, while README/examples differed and seven bonus files were not at matching public paths. The ZIP wins on conflict. Missing files are a stop, not a license to fetch replacements.

## Run from `01-claude-code/`

1. Create `runs/<run_id>/` and a bounded task. Ask **studio-intake** to read the kit and return a scoped plan with applicable practices, assumptions, and critical boundary checks. Record the plan in the run workspace if useful.
2. Ask **studio-writer** to implement the smallest coherent task under `runs/<run_id>/workspace/` and produce `writer-receipt.json` using the existing tutorial contract.
3. Ask **studio-verifier** to independently inspect and test Writer output, including applicable negative cases, and produce `verifier-receipt.json`. A critical boundary with insufficient evidence requires overall Verifier FAIL, not PASS.
4. Optionally ask **studio-synth** to summarize evidence and unresolved risk. Synth is read-only and cannot influence release authority.
5. The **parent**, not any agent, runs `node scripts/gate.js runs/<run_id>`. Report the actual Gate JSON and exit code: 0 PASS, 1 BLOCK, 2 FREEZE. Do not override it.

## Limits
Existing tutorial agents, `PROMPTS.md`, and `scripts/gate.js` are unchanged. The Gate validates existing receipt shape, identities, declared files, and statuses; it **does not independently enforce** the new critical-boundary annotations or guarantee that negative authorization tests ran. Gate PASS means only its own checks passed, **not** production readiness, security certification, or measured kit effectiveness. No kernel changes, 003R promotion, autonomous release, new framework, RAG, dashboard, or performance claims. Do not push, publish, or merge automatically.
