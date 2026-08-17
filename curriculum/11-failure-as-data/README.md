# 11 — Failure as data

## What am I learning?

Treating "didn't succeed" as several distinct, nameable outcomes — not one
generic exception.

## Why does it matter?

A node contract (lesson 10) says every node should return a structured,
predictable shape. Most tutorials stop at `status: "success"` vs. throwing
an opaque error for everything else. That throws away information a router
(lesson 08) could have used. "The record wasn't found" and "the request was
malformed" and "a human needs to look at this" are three completely
different situations that all deserve a different next step — lumping them
into one generic failure forces whatever's downstream to re-investigate
what already happened.

## What does it look like?

A handful of named, specific outcomes instead of `success` / `not-success`:

```text
success
not_found
invalid
timeout
partial
needs_review
```

Each one exists because it leads somewhere different:

```text
NOT_FOUND     → FALLBACK SEARCH
SUCCESS       → SYNTHESIS
NEEDS_REVIEW  → HUMAN
INVALID       → REWORK
```

## How does it work?

Open [`example.js`](./example.js). `lookupRecord()` returns one of six
named statuses depending on what actually happened — never a thrown
exception for the expected cases, because none of these are unexpected; a
missing record and a request needing human review are normal, anticipated
outcomes of doing a lookup, not bugs. `route()` reads `result.status` with a
`switch` and sends each one somewhere genuinely different. Notice the
`default` case: an *unrecognized* status still throws — the point isn't
"never throw," it's "don't throw away information you already have by
lumping known outcomes together."

## How do I run it?

```bash
cd curriculum/11-failure-as-data
node example.js
```

## What should I expect?

Six queries, six different statuses, six different routes — including two
(`invalid` and `partial`) that both land on `REWORK` for different reasons,
and one (`needs_review`) that goes to a human instead of continuing
automatically.

## What happens if it fails?

Add a call to `lookupRecord('this-status-does-not-exist-anywhere')` — wait,
that already falls through to `status: 'success'` in this example, since
anything not explicitly matched is treated as a normal found record. Instead,
directly call `route({ status: 'mystery' })` and re-run. You should see the
script crash with `unrecognized status: mystery` — thrown deliberately. A
router that received a status it doesn't have a case for should fail loudly,
not silently guess a route.

## What should I experiment with?

**Exercise — add explicit failure states.** Add a new status,
`'rate_limited'`, triggered by a query string like `'too-many-requests'`,
and route it somewhere sensible (a delayed retry, distinct from plain
`timeout`). Think about why "rate limited" and "timed out" deserve different
handling even though both feel like "it didn't work this time" from the
outside. *Expected result:* a seventh row in the output with its own status
and its own route, not reusing `timeout`'s.

## Next

Continue to [`12-artifacts-and-references/`](../12-artifacts-and-references/README.md) —
what a node should hand the next node instead of everything it produced.
