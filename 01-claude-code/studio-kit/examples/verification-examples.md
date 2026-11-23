# Short verification examples

See [before-after.md](before-after.md) for **hypothetical** agent response comparisons.

## Multi-user records

**User request:** “Build a SaaS app with user accounts.”

A proportional review considers server-side authorization for each requested record. A relevant negative test ensures user A cannot read or modify user B's record. This is an illustrative test idea, **not an observed result** from this kit.

## Mutating form

**User request:** “Add a form that saves the appointment.”

Consider positive validation and rejection of missing fields, or unauthorized submission where applicable. Again, this is an illustrative test idea.

## Existing bug

**User request:** “Fix this bug without breaking the rest.”

Inspect existing tests; use focused positive and negative checks; report skipped tests as `NOT_RUN`, not as passing.

## Observed: one Studio ScanPlan pilot, NOT a comparison of agents

The Studio-owned offline ScanPlan CLI failed on escaped unpaired Unicode surrogate input. The documented 2026-11-01 pilot records a red phase of **23 tests with 1 failure and 4 errors**; after one narrow validation fix, **23/23 tests passed locally**. Valid Unicode and deterministic output were retained. **Kernel canonical acceptance: NOT_RUN; independent baseline arm: NOT_RUN; release: HOLD.**

Source: https://github.com/holeyfield33-art/software-research-studio/blob/main/experiments/agent_b_scanplan/trials/STUDIO-PILOT-002/README.md

This evidence is about one local engineering change, not about a measured improvement caused by the kit.
