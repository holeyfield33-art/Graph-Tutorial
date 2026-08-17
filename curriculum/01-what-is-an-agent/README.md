# 01 — What is an agent?

## What am I learning?

What the word "agent" means in this project, and how it's different from a
chat window.

## Why does it matter?

Every later lesson uses the word "agent" constantly. If the definition stays
fuzzy, everything built on top of it stays fuzzy too.

## What does it look like?

Think of an agent as **a worker with a job description**. You (or a program)
give it:

1. A **role** — "you are the person who writes the code" or "you are the
   person who checks the code"
2. **Instructions** — what it's allowed to do, and what it's explicitly not
   allowed to do
3. **Tools** — the actual actions it can take (read a file, write a file, run
   a command)
4. **A task** — the specific thing to do right now

It does the job, then stops and reports back. It does not decide what
happens next in the bigger picture — that's the graph's job, not the agent's
(more on this in [lesson 02](../02-what-is-a-graph/README.md)).

## Three words you'll see constantly: model, prompt, tool

- **Model** — the actual AI (Claude, GPT, etc.) that reads text and predicts
  a response. It has no memory of your project and no opinions of its own
  until you give it some — it's the engine, not the agent.
- **Prompt** — the text you send the model: instructions plus whatever
  context it needs (the task, relevant files, prior results). An agent's
  "role and instructions" from above are just a prompt, written once and
  reused every time that agent runs.
- **Tool** — a specific action the model is allowed to trigger (read a file,
  write a file, run a command) instead of just producing text. Without
  tools, a model can only talk about doing something; with tools, it can
  actually do it — within whatever boundary you gave it.

An agent, then, is really just: **a model, given a prompt that defines its
role, and a specific set of tools** — run once on a specific task. Nothing
more mysterious than that.

## How does it work?

A chat window is one continuous conversation with no fixed role — you can
ask it anything, and it'll try to help with anything. An agent, in this
project's sense, is narrower on purpose: it's given a specific role and a
specific, limited set of tools, and it's expected to stay inside that lane.

Concretely, in this repo, an agent is defined as a small file describing its
role, its allowed tools, and its instructions. Take a look at the real one
this repo uses for the "does the work" role:
[`01-claude-code/agents/writer.md`](../../01-claude-code/agents/writer.md).
Notice it's mostly plain English — a job description, not a program.

You don't need to understand any code to read that file. Open it now and see
if you can answer: what is this agent allowed to touch? What is it forbidden
from doing? What must it produce when it's done?

## How do I run it?

Nothing to run yet — this lesson is about reading, not executing. You'll run
your first real agent in [lesson 05](../05-sequential-graphs/README.md).

## What should I expect?

You should come away able to describe an agent as "a role + instructions +
tools + a task," and be able to point to a real instance of one
(`writer.md`) and identify each of those four parts in it.

## What happens if it fails?

Not applicable yet — no code runs in this lesson.

## What should I experiment with?

Open [`01-claude-code/agents/verifier.md`](../../01-claude-code/agents/verifier.md)
too. Compare it to `writer.md`: same four parts (role, instructions, tools,
task), but a very different job. Notice the Verifier's tools list is
missing `Edit` and `Write` — it can look, but it can't change anything. Why
do you think that restriction exists? (Lesson 14 answers this directly.)

## Next

Continue to [`02-what-is-a-graph/`](../02-what-is-a-graph/README.md).
