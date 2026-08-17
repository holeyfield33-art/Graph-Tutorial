# 19 — Design your own graph

## What am I learning?

Extending the real graph yourself, using everything from lessons 01–18.

## Why does it matter?

Reading about a graph and running someone else's graph both stop short of
"I can build one." This lesson is the actual test of that.

## What does it look like?

You'll add a **third verification node** — a Style Checker — that runs
alongside the existing Verifier (fan-out, lesson 07), and change the Gate so
release requires *both* checks to pass (fan-in + routing, lessons 07–08):

```text
                    ┌→ Verifier ─────┐
Writer ─────────────┤                ├→ Gate → PASS/BLOCK/FREEZE
                    └→ Style Checker ┘
```

## Exercise 1 — trigger a BLOCK on purpose

**Before building anything new**, confirm you can make the *existing* graph
fail on demand — this is the same skill you'll need to test your new node.

- **Task:** Using either platform, change the Writer's task so the Verifier
  is very likely to FAIL it (for example: ask the Writer to skip writing a
  test file entirely).
- **Hint:** Look at
  [`01-claude-code/runs/demo-block/`](../../01-claude-code/runs/demo-block/)
  for what a real BLOCK-triggering pair of receipts looks like.
- **Expected behavior:** `gate.js` prints `BLOCK`, exit code 1.
- **Solution:** Use [Prompt C](../../01-claude-code/PROMPTS.md#prompt-c-force-block-learning)
  (Claude) — it does exactly this on purpose, with the expected output shown
  right there in `PROMPTS.md`.

## Exercise 2 — add a third verification node

- **Task:** Write a "Style Checker" node whose job is narrow: check that the
  Writer's summary in `writer-receipt.json` is non-empty and under, say, 200
  characters (a stand-in for a real style rule — the point is the *shape*,
  not this specific rule). It should write its own receipt,
  `runs/<run_id>/style-receipt.json`, with the same `agent`/`status` fields
  as `verifier-receipt.json`.
- **Hint:** You don't need a new AI agent for this — a style rule this
  simple can be a plain script, same as the Gate. Reuse the pattern in
  [`01-claude-code/scripts/gate.js`](../../01-claude-code/scripts/gate.js):
  read a JSON file, check a rule, write a JSON receipt.
- **Expected behavior:** Running your new script against
  `runs/demo-pass/writer-receipt.json` should produce a `style-receipt.json`
  with `"status": "PASS"`.
- **Solution:**

  <details>
  <summary>Click to reveal a worked solution</summary>

  ```js
  #!/usr/bin/env node
  // scripts/style-check.js — node scripts/style-check.js <runDir>
  'use strict';
  const fs = require('fs');
  const path = require('path');

  const runDir = process.argv[2];
  const writer = JSON.parse(fs.readFileSync(path.join(runDir, 'writer-receipt.json'), 'utf8'));

  const summaryOk = typeof writer.summary === 'string' &&
    writer.summary.length > 0 &&
    writer.summary.length < 200;

  const receipt = {
    agent: 'style-checker',
    run_id: writer.run_id,
    status: summaryOk ? 'PASS' : 'FAIL',
    checks: [{ name: 'summary_length', result: summaryOk ? 'PASS' : 'FAIL', detail: `length=${(writer.summary || '').length}` }],
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(path.join(runDir, 'style-receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
  console.log(JSON.stringify(receipt, null, 2));
  ```

  </details>

## Exercise 3 — require both checks in the Gate

- **Task:** Modify `gate.js` (in a scratch copy, not the real one used by
  other lessons' fixtures) so it also reads `style-receipt.json` and only
  returns PASS if **both** the Verifier and the Style Checker report PASS —
  fan-in logic, same idea as lesson 07's `synthesize()`.
- **Hint:** Add a second `readJson()` call and a second status check, right
  next to the existing `verifier.status !== 'PASS'` check.
- **Expected behavior:** A run where the Verifier passes but your Style
  Checker fails should now BLOCK, even though the original `gate.js` would
  have said PASS.
- **Solution:**

  <details>
  <summary>Click to reveal a worked solution</summary>

  Add near the top of `main()`, after the existing verifier check:

  ```js
  const stylePath = path.join(runDir, 'style-receipt.json');
  if (fs.existsSync(stylePath)) {
    const style = readJson(stylePath);
    if (style.status !== 'PASS') {
      die(1, 'BLOCK', 'style check did not PASS', { style_status: style.status });
    }
  }
  ```

  Placing this after the existing writer/verifier checks means forbidden
  paths and missing receipts still FREEZE first — a new check should extend
  the rule set, not weaken the existing ones.

  </details>

## What should I expect?

By the end of these three exercises, you will have made the graph fail on
purpose (Exercise 1), added a new fan-out branch (Exercise 2), and changed
the Gate's fan-in logic to require it (Exercise 3) — the three moves that
cover almost every real extension to a graph like this one.

## What happens if it fails?

If your modified `gate.js` throws instead of returning a clean BLOCK/FREEZE,
you likely have a typo in the JSON field names — compare your
`style-receipt.json` output against `verifier-receipt.json`'s shape exactly.

## What should I experiment with?

Once this works, try the reverse: make the Style Checker's rule something
that legitimately should FREEZE rather than BLOCK (for example, if
`writer-receipt.json` itself is missing the `summary` field at all, not just
too long). Decide, and justify to yourself, which of BLOCK or FREEZE fits —
[lesson 14](../14-verification-and-gates/README.md) has the reasoning to reuse.

## Before you design your own: when NOT to use a graph

Every lesson so far has been building toward "design a graph." Before you
do, apply the same discipline lesson 04 taught for edges — to the whole
decision of building a graph at all.

**Prefer one agent when:**

- the task is short
- the context fits comfortably in one call
- the steps are genuinely sequential (a real chain, not a fake one)
- a wrong answer is cheap to notice and redo
- a human can trivially eyeball the result

**Consider a graph when:**

- work is genuinely parallel (lesson 06)
- different steps need different tools or permissions
- independent verification actually matters (lesson 14)
- there's meaningful branching (lesson 08)
- the workflow needs to survive being interrupted (lesson 13)
- different routes have different cost or authority requirements (lesson 15)

The rule underneath all of it:

> **Start with the simplest system. Draw the graph when the dependencies
> justify it.**

A graph you didn't need is not "extra thorough" — it's extra latency, extra
cost (lesson 15), and extra complexity to debug, for no corresponding gain.
Every exercise below should survive you asking "does this actually need to
be a graph?" before you build it.

## Exercise 4 — design a graph for a real-world task

This is the capstone. Pick a real task you actually do (triaging support
tickets, preparing a weekly report, reviewing a small code change — anything
with more than one real step).

Work through the [Graph Design Worksheet](../../docs/GRAPH-DESIGN-WORKSHEET.md)
for it, question by question, in writing. Then, using whichever platform
you've been working in, actually implement the smallest version of it: even
a two-node chain with a deterministic check counts as a complete answer, if
that's genuinely what the dependencies justify.

*Expected result:* a filled-out worksheet plus a small, real, running
graph — or a worksheet that honestly concludes "this doesn't need to be a
graph" (question 20), with one agent call instead. Either outcome is a
correct answer to this exercise; the worksheet's job is to make you justify
whichever one you land on.

## Where to go from here

You've now built the core skill this repo teaches. From here:

- [`docs/ROADMAP.md`](../../docs/ROADMAP.md) — how this starter's 3-node
  graph grows into a 5+, then larger, product graph (Planner, Critic,
  persistent MCP memory, and so on) — none of which you need to understand
  the fundamentals you just learned.
- [`docs/PLATFORM-COMPARISON.md`](../../docs/PLATFORM-COMPARISON.md) — if you
  only did one platform's path, the other is worth a skim now that the
  concepts are solid.
