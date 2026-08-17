# Why agent graphs (not one big prompt)

## The problem with a single agent

One agent that “does everything”:

- Forgets early constraints when context grows
- Grades its own homework (“looks good”)
- Mixes *doing* work with *releasing* work
- Cannot cheaply parallelize independent checks

That is fine for a 5-minute task. It fails when the cost of a wrong “ship it” is high.

## What a graph is (vibecoder version)

Think of a **flowchart made of workers**:

1. **Nodes** — someone or something that does one job  
   - LLM agent (Writer, Verifier)  
   - Script (Gate)  
   - Later: human approval, MCP memory read/write

2. **Edges** — rules for what happens next  
   - “When Writer finishes, run Verifier”  
   - “If Gate exits 2, FREEZE — do not rework”

3. **Shared state** — what every node can see  
   - In this starter: a folder `runs/<id>/` with receipts and files  
   - Later: MCP memory bank (persistent across sessions)

**Graph engineering** = designing those nodes, edges, and state on purpose instead of hoping one chat does the right thing.

## Why a Gate that is *not* an LLM

Models are persuasive. They can claim success after a partial job.

A small script that only checks:

- required receipt fields exist  
- verifier status is PASS  
- forbidden paths were not touched  

…is boring and reliable. **Boring is the feature.**

```text
Writer / Verifier  →  narrative + evidence
Gate.js            →  authority (PASS / BLOCK / FREEZE)
Human              →  still required before anything public
```

## Same shape as the hype

Claude Code dynamic workflows and OpenAI handoffs are how you *run* many agents.

The hype word **graph** is the *design*: specialized roles, parallel or sequential edges, verify before release.

This repo teaches the smallest useful graph. Scaling to 5+ agents does not change the rule: **scripts and humans own release; models propose.**
