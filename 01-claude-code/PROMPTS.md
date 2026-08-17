# Copy-paste prompts (Claude Code)

New to this? Read [`curriculum/17-claude-code/`](../curriculum/17-claude-code/README.md)
first — it explains what these prompts do and why, before you paste anything.

Open Claude Code with cwd = `01-claude-code/` (this folder).

Ensure agents are available:

```bash
mkdir -p .claude/agents
cp agents/writer.md .claude/agents/
cp agents/verifier.md .claude/agents/
```

**How do I know this worked?** Run `ls .claude/agents/` — you should see `writer.md` and
`verifier.md` listed. If the `.claude` folder doesn't exist yet, `mkdir -p` just created it.

---

## Prompt A — full starter graph (recommended)

```text
Run the starter agent graph for a new run.

1) Create run_id = demo-<YYYYMMDD-HHMMSS> and folder runs/<run_id>/

2) Spawn the **writer** subagent with this task:
   - Create workspace/hello.js that exports a function hello(name) returning `Hello, ${name}!`
   - Create workspace/hello.test.js that checks hello("World") includes "World"
   - Write runs/<run_id>/writer-receipt.json per the writer agent instructions
   - Only touch files under workspace/ and runs/<run_id>/

3) After writer returns, spawn the **verifier** subagent:
   - Independently check the writer receipt and files
   - Write runs/<run_id>/verifier-receipt.json

4) Run this exact command (do not skip):
   node scripts/gate.js runs/<run_id>

5) Report the gate JSON and exit meaning:
   - exit 0 = PASS
   - exit 1 = BLOCK (would rework writer)
   - exit 2 = FREEZE (hard stop)

Do not push, publish, or edit scripts/ or agents/.
```

### What you should see (Prompt A)

Claude Code will narrate each subagent as it runs, then print the gate's JSON output. The
last few lines should look like this (your `run_id` and `timestamp` will differ):

```json
{
  "agent": "gate",
  "status": "PASS",
  "reason": "receipts valid and verifier PASS",
  "writer_summary": "Added workspace/hello.js and a minimal test file.",
  "files_touched": ["workspace/hello.js", "workspace/hello.test.js"]
}
```

**What this means:** the Writer built the file, the Verifier independently checked it and
found no problems, and the Gate — a plain script, not an LLM — agreed the receipts were
valid. `PASS` here means "the graph's own checks passed," not "this is production code."
See [`docs/SAFETY.md`](../docs/SAFETY.md).

If you see `BLOCK` instead, the Verifier found a real problem — read
`runs/<run_id>/verifier-receipt.json` for the specific failure, then ask Claude Code to
have the Writer fix it and re-run from step 4. That rework loop is intentional; see
[`curriculum/09-controlled-cycles/`](../curriculum/09-controlled-cycles/README.md).

---

## Prompt B — force FREEZE (learning)

```text
Create runs/learn-freeze/ and write a fake writer-receipt.json that lists
files_touched including "scripts/gate.js". Write a verifier-receipt.json
with status PASS and agent verifier. Then run:

node scripts/gate.js runs/learn-freeze

Explain why the gate FREEZE'd. Do not change gate.js.
```

### What you should see (Prompt B)

```json
{
  "agent": "gate",
  "status": "FREEZE",
  "reason": "forbidden path in writer files_touched",
  "path": "scripts/gate.js"
}
```

**What this means:** the Gate hard-stopped before even looking at the Verifier's opinion,
because the Writer's own receipt admits touching a file it was never allowed to touch.
FREEZE exists for exactly this: a Verifier saying PASS cannot override it. See
[`docs/SAFETY.md`](../docs/SAFETY.md) and
[`curriculum/14-verification-and-gates/`](../curriculum/14-verification-and-gates/README.md).

You can see this without pasting anything, right now, with no AI involved — the same
receipts already ship in this repo:

```bash
node scripts/gate.js runs/demo-freeze
```

---

## Prompt C — force BLOCK (learning)

```text
Create runs/learn-block/ and write a writer-receipt.json with status PASS
touching only workspace/ files. Write a verifier-receipt.json with status
FAIL and one concrete failure in the "failures" array (invent a real-sounding
problem, e.g. a test that never asserts anything). Then run:

node scripts/gate.js runs/learn-block

Explain why the gate BLOCK'd instead of FREEZE'd, and what "rework" would mean here.
```

### What you should see (Prompt C)

```json
{
  "agent": "gate",
  "status": "BLOCK",
  "reason": "writer or verifier reported FAIL",
  "writer_status": "PASS",
  "verifier_status": "FAIL"
}
```

**What this means:** nothing forbidden happened (that would be FREEZE), but the Verifier
found the work wasn't good enough. BLOCK is a soft stop — the intended next step is
sending the Writer back to fix the specific problem, not a hard halt. Compare this to
FREEZE: BLOCK says "try again," FREEZE says "something is wrong with the process itself,
stop and investigate."

You can also see this without pasting anything, with the fixture already in this repo:

```bash
node scripts/gate.js runs/demo-block
cat runs/demo-block/verifier-receipt.json
```

---

## Prompt D — workflow wording (optional)

If you use dynamic workflows / ultracode:

```text
Use a workflow to run the starter graph: writer → verifier → node scripts/gate.js
on a new runs/<run_id>. Task for writer: workspace/hello.js + hello.test.js as in our PROMPTS.
Keep total agents small (under 5). Stop after gate prints PASS, BLOCK, or FREEZE.
```

---

## After the run

```bash
ls runs/
cat runs/<run_id>/warden-receipt.json
```

`warden-receipt.json` is the one file in the run folder that no LLM wrote — it's the
Gate's own output. That's the file to trust.
