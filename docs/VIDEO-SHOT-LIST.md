# Video shot list

A small set of short screen recordings covers this course far better than a
long walkthrough — and stays maintainable. **Five clips, 30–90 seconds each.**
Record only these; a big library of clips rots every time an SDK or UI changes.

Order of value: **Clip 1 alone** is worth more than the rest combined — it's the
"aha" with zero setup. Clips 3 and 4 are the "it's real" proof. Record 1, 2, and
one of 3/4 first; add the rest later.

## Recording setup (do this once)

- **Terminal:** font size **18–20pt**, a light or high-contrast theme, window
  ~100×30. Small fonts are the #1 reason tutorial clips are unwatchable.
- **Tool:** [`asciinema`](https://asciinema.org) for terminal-only clips (crisp,
  tiny, copy-pasteable) or any screen recorder (OBS, QuickTime, Loom) at 1080p.
- **Clean slate:** `cd` into a fresh clone so paths match the README exactly.
- **No secrets on screen:** never show a real `OPENAI_API_KEY`, a real billing
  page, or a plan/usage dashboard with an account id. Blur or crop those.
- **Captions over voice:** burn short on-screen captions (below) so the clip
  works muted and on mobile. Voiceover optional.
- Keep each clip to **one idea**. If you need to explain two things, that's two
  clips.

---

## Clip 1 — "The whole idea in 60 seconds" (no AI, no account)

**Goal:** the viewer sees a deterministic script decide PASS / FREEZE / BLOCK
before they install anything. This is the hook.

**Length:** 45–60s · **Prereq:** Node.js only.

**On screen — run, pausing ~2s on each result:**
```bash
cd 01-claude-code
node scripts/gate.js runs/demo-pass      # → PASS   (exit 0)
node scripts/gate.js runs/demo-freeze    # → FREEZE (exit 2)
node scripts/gate.js runs/demo-block     # → BLOCK  (exit 1)
```

**Captions (in order):**
1. "A script — not an AI — decides if the work ships."
2. "PASS: receipts valid and the claimed files really exist."
3. "FREEZE: it claimed a forbidden file. Hard stop."
4. "BLOCK: the verifier found a real problem. Rework."
5. "That's the whole product. Everything else produces these receipts honestly."

**End frame:** the three JSON outputs stacked, statuses highlighted.

---

## Clip 2 — "It actually checks the disk" (the trust point)

**Goal:** prove the gate doesn't just believe the receipt — the core of the
audit fix. Show a receipt that *claims* a file, then watch FREEZE because the
file isn't there.

**Length:** 45–75s · **Prereq:** Node.js only.

**On screen:**
```bash
# The offline test suite includes exactly this case:
node tests/gate.test.js
# Watch the line: "claimed file missing on disk -> FREEZE"
```
Then, live, the manual version:
```bash
mkdir -p /tmp/fakerun
echo '{"agent":"writer","run_id":"fakerun","status":"PASS","summary":"lie","files_touched":["workspace/ghost.js"],"timestamp":"x"}' > /tmp/fakerun/writer-receipt.json
echo '{"agent":"verifier","run_id":"fakerun","status":"PASS","checks":[{"name":"n","result":"PASS","detail":"d"}],"timestamp":"x"}' > /tmp/fakerun/verifier-receipt.json
node 01-claude-code/scripts/gate.js /tmp/fakerun   # → FREEZE: files do not exist on disk
```

**Captions:**
1. "Both receipts say PASS."
2. "But the file the writer claims doesn't exist."
3. "The gate reads disk, not the summary → FREEZE."
4. "A lying (or hallucinating) agent can't talk its way past the script."

---

## Clip 3 — "A real run on the OpenAI path"

**Goal:** the graph running for real, end to end, one command.

**Length:** 60–90s · **Prereq:** Python venv + `OPENAI_API_KEY` set (off screen).

**On screen:**
```bash
cd 02-openai-agents
python graph.py
```
Let it print `[graph] Writer…`, `[graph] Verifier…`, then the gate JSON. Then:
```bash
cat runs/<run_id>/warden-receipt.json   # the one file no LLM wrote
```

**Captions:**
1. "Writer agent does the task…"
2. "…Verifier independently re-reads the files…"
3. "…and the same gate.js decides. One authority, real run."
4. "warden-receipt.json is the gate's own output — the file to trust."

**Note:** if the verifier returns FAIL (it sometimes does — that's the point),
don't re-shoot. Narrate it: "the verifier wasn't convinced — that's the graph
working," and roll into Clip 5.

---

## Clip 4 — "A real run inside Claude Code"

**Goal:** the same graph on the Claude path, for viewers who'll use that.

**Length:** 60–90s · **Prereq:** Claude Code, agents copied in (`PROMPTS.md`).

**On screen:** open Claude Code in `01-claude-code/`, paste **Prompt A** from
[`PROMPTS.md`](../01-claude-code/PROMPTS.md). Show the subagents narrating, then
the gate's PASS JSON. Finish with `node scripts/observe.js runs/<run_id>`.

**Captions:**
1. "Same graph, Claude Code subagents."
2. "Writer subagent → Verifier subagent → the same gate.js."
3. "observe.js reads the receipts back — one line per node."

---

## Clip 5 — "Force a BLOCK, then rework" (optional, the payoff)

**Goal:** show the controlled cycle — BLOCK is not failure, it's a loop.

**Length:** 45–60s · **Prereq:** none (fixture) or continue from Clip 3/4.

**On screen:**
```bash
node 01-claude-code/scripts/gate.js 01-claude-code/runs/demo-block
cat 01-claude-code/runs/demo-block/verifier-receipt.json   # the specific failure
```

**Captions:**
1. "The verifier caught a test that never asserts anything."
2. "BLOCK = send the writer back to fix that one thing."
3. "Not a dead end — a controlled cycle (lesson 09)."

---

## Where to put the finished clips

- Embed GIF versions inline in the relevant lesson READMEs (Clip 1 → the top of
  `README.md`; Clip 2 → `docs/SAFETY.md`; Clip 5 → `curriculum/09-…`).
- Keep the source MP4/asciinema links in the repo's release notes or a short
  `docs/VIDEOS.md`, not committed as large binaries — link out to keep the repo
  clone small.
- Re-record a clip only when the command or its output actually changes. The
  offline clips (1, 2, 5) are stable; the live-platform clips (3, 4) are the
  ones to revisit when an SDK or the Claude Code UI moves.
