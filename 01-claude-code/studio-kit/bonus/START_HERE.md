# Studio Engineering Kit — Maintained Repository Starter
**Release candidate v0.3 · Supplement to the public agent instructions (seller approval pending)**

The open core instructions live at:
https://github.com/holeyfield33-art/studio-engineering-kit

This bundle helps a coding agent translate that guidance into the few project documents that keep an actual application maintainable.

## First use
1. Open the repository you want the agent to work on.
2. Give the agent the public kit's `AGENTS.md` instructions using the public platform setup guide, while preserving existing project rules.
3. Choose a bounded prompt from `FIRST_SESSION_PLAYBOOK.md`; use `PROMPT_INSTALL.md` when retrofitting an existing repository. Have the agent **inspect first** and propose only warranted missing documents.
4. Adapt a template **only if its role is missing**. Never blindly overwrite an existing README, AGENTS, status, architecture, or tests.
5. Ask for one narrowly scoped enhancement or repair. Review the actual diff and test results.

## The minimum is contextual
A tiny prototype may need only a clear README, a focused agent entrypoint and tests. An evolving SaaS may need an authoritative STATUS, product/user flow description and project-specific SDLC. A deployed service may need operational and release evidence. No template is mandatory just because it is in this package.

**Files**
- `DOC_MAP.md`: what belongs in each repo document and when it is justified.
- `templates/STATUS.md`: one living current-state authority, not a history dump.
- `templates/SDLC.md`: compact project-specific engineering and verification contract.
- `templates/PRODUCT.md`: optional users, workflows, constraints, success criteria.
- `PROMPT_INSTALL.md`: a cautious, paste-ready instruction for an existing repo.
- `FIRST_SESSION_PLAYBOOK.md`: focused new-build, retrofit and release-readiness prompts.
- Platform setup reference: https://github.com/holeyfield33-art/studio-engineering-kit/blob/main/docs/PLATFORM_SETUP.md

## Evidence and authority
This is derived from Software Research Studio's 2026-11-01 agent-facing guidance, not from an automatic selector. It is not a security audit, permission grant, certification, or measured performance claim. It does not install code, execute tests or deploy anything.

## License, refunds, support and updates

The seller must approve and show the final terms in the storefront before accepting payments. This release-candidate ZIP **does not itself establish** a binding license, refund window or update entitlement. The public instructions remain free on GitHub. Access to this download alone does not include custom engineering help or a performed audit.
