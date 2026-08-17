# 05 — Sequential graphs (chain)

## What am I learning?

The first of the four core topologies: **chain**. **A → B → C**, one node
after another, each depending on the one before it.

## Why does it matter?

Chain is the default shape people reach for, and it's exactly what the real
Writer → Verifier → Gate graph in this repo uses. It's also the *only*
topology that's ever correct to reach for on written order alone — because
in a chain, "wrote it in this order" and "each step really needs the last
one's output" are supposed to be the same thing. Lesson 04 taught you how to
check that they actually are before you commit to this shape.

```text
A ──→ B ──→ C
```

## What does it look like?

Three steps that must happen in order because each one needs what the last
one produced — you can't edit a draft before it exists, and you can't check a
final version before it's edited.

**Advantages:** simple to reason about, easy to debug (the failure is always
"the step right before this one"), state flows in one obvious direction.

**Disadvantages:** slow when steps don't actually need each other — if B and
C are independent, forcing them to run one after another wastes time for no
reason. That's what lesson 06 fixes.

## How does it work?

Open [`example.js`](./example.js) in this folder. Three plain JavaScript
functions, `nodeA`, `nodeB`, `nodeC`. Notice each one is called with the
*previous* function's return value — that return value passed into the next
call **is the edge**. There's no framework here; a graph edge, at its
simplest, is just "pass this value into that function next."

## How do I run it?

You don't need to know JavaScript to run this — just to have Node.js
installed (see [`docs/TROUBLESHOOTING.md`](../../docs/TROUBLESHOOTING.md) if
`node -v` doesn't work).

```bash
cd curriculum/05-sequential-graphs
node example.js
```

## What should I expect?

```text
--- sequential graph: A -> B -> C ---
[A] researching topic...
[B] writing draft about "agent graphs"...
[C] editing draft...
--- done ---
final state: {
  topic: 'agent graphs',
  draft: 'A short piece about agent graphs.',
  final: 'A SHORT PIECE ABOUT AGENT GRAPHS.'
}
```

Each `[X]` line prints in order, top to bottom, never out of sequence — that
ordering guarantee is the entire point of "sequential."

## What happens if it fails?

Open `example.js` and make `nodeB` throw an error (add `throw new
Error('boom')` as its first line), then run it again. Notice `nodeC` never
runs, and you never see `final state` printed. In a sequential graph, one
broken link stops everything downstream of it — there's no way around a
failed step, only through it. Undo your edit before moving on.

## What should I experiment with?

Add a fourth node, `nodeD`, that takes `nodeC`'s output and does something
with it (print its length, reverse it, anything). Wire it in after `nodeC`.
That's the entire skill of extending a sequential graph: one more function,
one more call, one more edge.

## Next

Continue to [`06-parallel-graphs/`](../06-parallel-graphs/README.md) — what
changes when steps don't depend on each other.
