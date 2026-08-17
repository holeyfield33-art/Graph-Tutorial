# tests/ — offline smoke tests

These run with **no API key, no network, and no `npm install`**. They exist so
that a change to the gate, the receipt shape, or the demo fixtures fails loudly
here instead of silently confusing a learner later.

```bash
node tests/gate.test.js      # the gate returns the exit code we promise
node tests/schema.test.js    # committed receipts keep their required shape
python3 02-openai-agents/receipts.py   # receipt writer round-trips to disk
```

CI runs all three on every push — see [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

## What `gate.test.js` covers

| Situation | Expected edge |
|---|---|
| `demo-pass` (real files on disk, verifier PASS) | **PASS** (exit 0) |
| `demo-block` (weak test, verifier FAIL) | **BLOCK** (exit 1) |
| `demo-freeze` (claims a forbidden path) | **FREEZE** (exit 2) |
| Writer claims a file that isn't on disk | **FREEZE** |
| Writer claims an empty file | **FREEZE** |
| `files_touched` contains `..` or an absolute path | **FREEZE** |
| Receipt `run_id` doesn't match the run folder | **FREEZE** |
| Verifier PASS with zero checks | **BLOCK** (no evidence) |
| Missing / invalid-JSON receipt | **FREEZE** |

The point of the middle rows: the gate does not trust the receipt's
self-reported status. It re-checks the claims against the actual filesystem.
