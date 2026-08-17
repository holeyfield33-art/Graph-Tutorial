# 10 — Node contracts

## What am I learning?

Giving every meaningful node a strict shape: one job, an explicit input, a
structured output, and explicit failure states.

## Why does it matter?

You've now seen chain, fan, router, and controlled-cycle edges. All of them
depend on the next node being able to reliably read what the last node
produced. A router (lesson 08) can't route on a paragraph of prose — or
rather, it *can*, badly, by trying to guess what the paragraph meant. A node
contract is what makes an edge actually reliable instead of a best-effort
guess.

```text
ONE JOB
EXPLICIT INPUT
STRUCTURED OUTPUT
EXPLICIT FAILURE STATES
```

## What does it look like?

Bad:

```text
"I found three useful sources and here is what I think..."
```

Better:

```json
{
  "status": "success",
  "sources": ["source-001", "source-002"],
  "count": 2
}
```

The bad version might be perfectly correct information — the problem isn't
truthfulness, it's that nothing downstream can act on it without re-reading
and interpreting English. The good version can be checked, routed on, and
logged by plain code with zero ambiguity.

## How does it work?

Open [`example.js`](./example.js). `searchBad()` returns a sentence that
happens to contain the right information, phrased differently every time you
might ask for it again. `searchGood()` always returns the same shape:
`status`, `sources`, `count` — whether it found something or not. `routeOnResult()`
shows the payoff: it can make a routing decision by checking one field,
`result.status`, instead of parsing a sentence for hints.

## How do I run it?

```bash
cd curriculum/10-node-contracts
node example.js
```

## What should I expect?

Three sections: the bad free-text output, the good structured PASS-like
case (`status: "success"`), and the good structured empty case
(`status: "not_found"`). The router function prints a confident,
one-line decision for both good cases — it never has to guess.

## What happens if it fails?

Try writing `routeOnResult` for the *bad* version's output — you'd need
something like checking whether the string contains the word "sorry" or
"nothing." Do that (even just in your head, or scratch it out): notice how
fragile it is — a slightly different phrasing ("I couldn't find anything,
unfortunately") breaks the check silently. That fragility is exactly what a
node contract eliminates.

## What should I experiment with?

**Exercise — create structured node output.** Add a third case to `SOURCES`
where the user ID exists but has exactly one source, and add a `status`
value your contract doesn't have yet — `'partial'` — for "found something,
but probably not enough." Update `routeOnResult` to route it somewhere
distinct from both `success` and `not_found`. *Expected result:* three
distinct route outcomes for three distinct, honestly-different situations —
not two situations awkwardly squeezed into one status value.

## Next

Continue to [`11-failure-as-data/`](../11-failure-as-data/README.md) — the
same idea, applied specifically to things going wrong.
