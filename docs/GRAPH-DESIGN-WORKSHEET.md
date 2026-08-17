# Graph Design Worksheet

Fill this out, in writing, before building a graph — including the one you
build for [curriculum lesson 19's capstone exercise](../curriculum/19-design-your-own-graph/README.md#exercise-4-design-a-graph-for-a-real-world-task).
Every question maps to a specific earlier lesson; if a question is hard to
answer, that lesson is worth rereading before you go further.

Answer honestly — question 20 is allowed to be the answer.

---

**1. What is the goal?**
State the actual outcome you want, in one sentence, not the mechanism.
("A weekly status report gets written," not "an agent writes a report.")

**2. Can one agent solve it?**
Try the simplest possible version first: one prompt, one call. If that's
genuinely good enough, stop here — see the "when NOT to use a graph"
section in [lesson 19](../curriculum/19-design-your-own-graph/README.md#before-you-design-your-own-when-not-to-use-a-graph).

**3. What are the independent pieces?**
List the distinct chunks of work, without yet deciding their order.

**4. Which outputs does each piece actually consume?**
For each piece, name exactly what information it needs to start — not what
information happens to exist by the time someone gets around to it.

**5. Which edges are real dependencies?**
Apply [lesson 04](../curriculum/04-dependency-analysis/README.md) to every
arrow you're tempted to draw: does the next node *read* the previous node's
output, or does it just come after it in your head?

**6. Which nodes can run in parallel?**
Anything that survived question 5 without a real dependency on another node
in the same group. See [lesson 06](../curriculum/06-parallel-graphs/README.md).

**7. Where are the joins?**
Name the specific node(s) that need the *complete* set of results from a
parallel group before they can run — and confirm each one actually does,
per [lesson 07](../curriculum/07-fan-out-fan-in/README.md#an-unnecessary-join).

**8. Where is routing required?**
Identify any point where the next node depends on a result, not just on
completion — see [lesson 08](../curriculum/08-routing/README.md).

**9. What does each node receive?**
Write the exact input shape per node — this is the "explicit input" half of
a [node contract](../curriculum/10-node-contracts/README.md).

**10. What does each node return?**
Write the exact output shape per node — the "structured output" half.

**11. What are the failure states?**
Per node, name the specific ways it can fail to succeed —
[lesson 11](../curriculum/11-failure-as-data/README.md)'s `not_found` /
`invalid` / `timeout` / `partial` / `needs_review`, or your own equivalents.
"It threw an error" is not a complete answer here.

**12. Where are artifacts stored?**
For anything larger than a short summary, name where the full result lives
on disk and what small reference gets passed instead — see
[lesson 12](../curriculum/12-artifacts-and-references/README.md).

**13. What state must survive interruption?**
List what a checkpoint needs to record per node so a crash mid-run doesn't
lose completed work — [lesson 13](../curriculum/13-state-and-recovery/README.md).

**14. Where can execution resume?**
Given question 13's checkpoint, name the exact node a restarted run would
pick up at, for at least one realistic interruption point.

**15. Where is verification performed?**
Identify which node(s) independently check another node's claims, and
confirm the checker never IS the thing being checked — see
[lesson 14](../curriculum/14-verification-and-gates/README.md).

**16. What decisions are deterministic?**
Name the specific rules a plain script enforces (not an LLM) before
anything is considered "done" — same lesson.

**17. What requires human approval?**
State explicitly what a PASS from your graph actually authorizes, and what
still needs a person before anything public happens — see
[`docs/SAFETY.md`](./SAFETY.md).

**18. What is the estimated cost?**
Rough node count × calls per node × your provider's per-call cost — see
[lesson 15](../curriculum/15-cost-and-performance/README.md).

**19. What is the expected latency?**
Rough critical-path time: the longest chain of *real* dependencies (question
5), not the total of every node — same lesson.

**20. Should this actually be a graph?**
Reread your answers to 1–19. If most nodes turned out to be genuinely
sequential, if nothing is parallel, if there's no real branching or need for
independent verification — the honest answer might be "no." That's not a
failed worksheet. It's the worksheet doing its job.
