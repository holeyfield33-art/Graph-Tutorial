# 17 — Claude Code

## Before you code

**What is happening?** You're about to run the real graph every earlier
lesson was pointing at: Writer → Verifier → Gate, for real, on your machine,
using Claude Code **subagents** — Claude Code's name for an agent (lesson
01) spawned to do one scoped job with its own instructions and tools, as a
child of your main session. Writer and Verifier are each a subagent here.

**Why is it designed this way?** Because lessons 01–16 already explained
every individual piece — this lesson doesn't introduce anything new
conceptually, it's where those pieces stop being diagrams and start being a
real run you can inspect on disk afterward.

**What will happen when you run it?** A Writer subagent will create real
files. A Verifier subagent will independently check them. A Gate script —
not an LLM — will read both receipts and print PASS, BLOCK, or FREEZE with
a real exit code. You'll then deliberately break it two different ways to
see BLOCK and FREEZE for yourself, not just read about them.

Using OpenAI instead? Skip to [`18-openai-agents/`](../18-openai-agents/README.md) —
you don't need this lesson.

## What am I learning?

Running the actual `01-claude-code/` implementation.

## What does it look like?

Exactly the diagram from [lesson 02](../02-what-is-a-graph/README.md), now
with real files behind every box.

## How does it work?

1. You need [Claude Code](https://code.claude.com) installed and Node.js 18+
   (`node -v`).
2. `cd 01-claude-code` — every command below assumes this working directory.
3. Copy the two agent definitions where Claude Code looks for them:

   ```bash
   mkdir -p .claude/agents
   cp agents/writer.md .claude/agents/
   cp agents/verifier.md .claude/agents/
   ```

   **How do I know this worked?** `ls .claude/agents/` should list
   `writer.md` and `verifier.md`.

4. Open Claude Code with this folder as its working directory, and paste
   **Prompt A** from [`01-claude-code/PROMPTS.md`](../../01-claude-code/PROMPTS.md#prompt-a-full-starter-graph-recommended).

## How do I run it?

Paste Prompt A, wait for it to finish, then read the last thing it prints —
the Gate's JSON output.

## What should I expect?

See [`PROMPTS.md`'s "What you should see"](../../01-claude-code/PROMPTS.md#what-you-should-see-prompt-a)
section for the exact expected output — a `PASS` with `exit 0`, and a
pointer to what each field means. Then try:

```bash
node scripts/observe.js runs/<your-run-id>
```

to see lesson 16's observability tool summarize the run you just made.

## What happens if it fails?

Two deliberate failure exercises, both explained with exact expected output
in `PROMPTS.md`:

- **Force a FREEZE** — [Prompt B](../../01-claude-code/PROMPTS.md#prompt-b-force-freeze-learning),
  or with zero AI cost right now: `node scripts/gate.js runs/demo-freeze`
- **Force a BLOCK** — [Prompt C](../../01-claude-code/PROMPTS.md#prompt-c-force-block-learning),
  or with zero AI cost right now: `node scripts/gate.js runs/demo-block`

Run both zero-cost commands now, even before you try the real Claude Code
prompts — they use the exact same `gate.js` your real run will use, so
there's no risk and no cost to seeing FREEZE and BLOCK first.

## What should I experiment with?

Compare all three `warden-receipt.json` files side by side:
[`demo-pass`](../../01-claude-code/runs/demo-pass/warden-receipt.json),
[`demo-block`](../../01-claude-code/runs/demo-block/warden-receipt.json),
[`demo-freeze`](../../01-claude-code/runs/demo-freeze/warden-receipt.json).
Same script, three different `reason` fields — each one traces back to a
specific rule in `gate.js`. Try to match each reason to the line of
`gate.js` that produced it.

## Next

Continue to [`19-design-your-own-graph/`](../19-design-your-own-graph/README.md) —
the capstone. (Or read [`18-openai-agents/`](../18-openai-agents/README.md)
first if you want to see the same graph on the other platform.)
