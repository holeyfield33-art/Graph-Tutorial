# 14 — Verification and gates

## What am I learning?

Three distinct roles that are easy to blur into one: the thing that
**produces** work, the thing that **checks** it, and the thing with actual
**authority** to approve it. Mixing these up is the single most important
mistake this whole repo is designed to prevent.

```text
producer ≠ verifier ≠ authority
```

## Why does it matter?

An LLM saying "I checked, it's fine" is still just an LLM saying words. It
can be wrong, it can be fooled, and — same as any agent — it might quietly
change its mind about what "fine" means.

```text
LLM output       ≠  trusted fact
agent claim      ≠  machine verification
```

This is the actual security model of the whole repo, and it generalizes far
beyond this starter: **the thing that can talk persuasively should never be
the same thing that holds authority to approve.** An LLM is very good at
sounding persuasive. That's exactly why it shouldn't also be the approver.

## What does it look like?

Three roles, three different kinds of trust:

- **Producer** (Writer) — does the work, makes claims about what it did.
- **Verifier** — still an agent (lesson 01): reads evidence, forms an
  opinion, reports PASS or FAIL. More trustworthy than the Writer because
  it's independent and evidence-based — but it is still fundamentally "an
  LLM's answer."
- **Authority** (Gate) — not an agent at all. A plain script with fixed
  rules (does this required field exist, does the verifier status equal
  exactly `"PASS"`, was a forbidden path touched). It cannot be argued with,
  flattered, or worn down over a long conversation, because it isn't having
  one.

Built up in three ideas:

**1. A claim is not evidence.** "I added the login form" is a claim. The
actual file existing, with actual working code in it, is evidence.

**2. Evidence needs to be about the right thing.** It's not enough to prove
*something* exists — it has to be provably the *right* something. A
**receipt** is the evidence a node leaves behind. A production system that
needs to be airtight about this uses a **SHA** — a cryptographic hash — to
pin down exactly which version of a file or commit a claim is about, so
nothing can quietly shift underneath it after the fact. This starter
doesn't need SHAs (the task is small and the run folder is the whole
record), but the same idea — "prove *which* thing, not just *that* a thing
exists" — is why they exist once the stakes go up. **Provenance** is the
general word for this: a traceable record of where something came from and
what produced it.

**3. Authority has to live somewhere that can't be talked into anything.**
A Gate is boring on purpose — see
[`docs/WHY.md`](../../docs/WHY.md#why-a-gate-that-is-not-an-llm). That's why
release authority in this repo lives in a script (`gate.js`), not in the
Verifier agent, however good the Verifier is. **Human approval** sits above
all of it — even a Gate's `PASS` is not "ship it," it's "the graph's own
checks passed." A human still decides what happens with that result. See
[`docs/SAFETY.md`](../../docs/SAFETY.md).

## How does it work?

Open [`example.js`](./example.js). `verifierOpinion()` is written to say
PASS no matter what — deliberately, to make a point. `gate()` doesn't call
`verifierOpinion()` again or ask it to reconsider; it independently checks
`filesTouched` against a fixed forbidden list, and overrules the "PASS" the
moment it finds a real problem.

The three PASS / BLOCK / FREEZE outcomes map onto this trust model
directly:

- **PASS** — evidence supports every claim, no rule was broken. Still not
  "ship to production" — just "the graph's own checks passed."
- **BLOCK** — a claim wasn't supported by evidence (Verifier found a real
  problem). Soft stop: fix it, try again.
- **FREEZE** — something more serious: a forbidden action was taken, or the
  evidence itself is missing or broken. Hard stop: don't try to argue your
  way past it, find the actual cause. See
  [`docs/SAFETY.md#freeze`](../../docs/SAFETY.md#freeze).

## How do I run it?

```bash
cd curriculum/14-verification-and-gates
node example.js
```

Also reread
[`01-claude-code/runs/demo-freeze/warden-receipt.json`](../../01-claude-code/runs/demo-freeze/warden-receipt.json)
with this lesson's framing: notice it's the Gate's own output, not anything
the Writer or Verifier wrote.

## What should I expect?

The Verifier claims PASS. The Gate still returns FREEZE, because
`gate.js` was in the touched-files list — a fact the Gate checked itself,
independent of what the Verifier said. You should be able to explain,
without looking anything up, why a Verifier saying PASS didn't stop the
FREEZE — and why that's a feature, not a bug.

## What happens if it fails?

Remove `'gate.js'` from the `filesTouched` array (line with
`const filesTouched = ...`) and re-run. Now the Gate should return `PASS`,
since the Verifier's `'PASS'` is finally believed — but only because the
Gate independently found no rule violation, not because the Verifier said
so convincingly.

## What should I experiment with?

Make `verifierOpinion()` sometimes return `'FAIL'` based on an argument you
pass in, and see how `gate()`'s decision changes to `BLOCK` instead of
`FREEZE` — same idea as lesson 08's routing, applied to real PASS/BLOCK/
FREEZE logic. Then read the actual production version of this idea:
[`01-claude-code/scripts/gate.js`](../../01-claude-code/scripts/gate.js) — it's
longer, but every branch in it is a rule exactly like the ones you just
wrote.

Then think of a real process you trust (a bank statement, a signed
contract, a test suite passing in CI). Identify: what's the claim, what's
the evidence, and what's the thing with actual authority to approve? Most
trustworthy systems you already rely on have this same three-way split,
whether or not anyone ever called it that.

## Next

Continue to [`15-cost-and-performance/`](../15-cost-and-performance/README.md) —
correctness isn't the only thing a graph design has to answer for.
