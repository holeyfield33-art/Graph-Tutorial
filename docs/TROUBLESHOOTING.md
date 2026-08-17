# Troubleshooting

Plain-English fixes for the problems beginners actually hit. If you're stuck
on something not listed here, check [`docs/GLOSSARY.md`](./GLOSSARY.md) for
any unfamiliar term first, then re-read the "Before You Code" section of the
lesson you're on — most confusion comes from a skipped assumption, not a bug.

## "command not found: node" / "'node' is not recognized"

Node.js isn't installed, or your terminal was opened before you installed it.
Install from [nodejs.org](https://nodejs.org) (the LTS version), then **close
and reopen your terminal** — a terminal window doesn't see software installed
after it was opened. Confirm with `node -v`; you should see `v18` or higher.

## "command not found: python" / "'python' is not recognized"

Same idea, for the OpenAI path. Install from [python.org](https://python.org)
(3.10+), reopen your terminal, confirm with `python --version` (on some
systems it's `python3 --version`).

## "No module named 'agents'" / `ImportError` in `graph.py`

You either haven't run `pip install -r requirements.txt` yet, or you ran it
outside the virtual environment you activated. From `02-openai-agents/`:

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Every time you open a new terminal, you must re-activate the venv (the
`source .venv/bin/activate` line) before running `python graph.py` again.

## "OPENAI_API_KEY not set" / authentication error from `graph.py`

You need a real API key from [platform.openai.com](https://platform.openai.com)
(this is separate from a ChatGPT subscription, and billed separately — see
[`02-openai-agents/README.md`](../02-openai-agents/README.md#cost)). Set it in
the **same terminal session** you run `python graph.py` from:

```bash
export OPENAI_API_KEY=sk-...       # macOS/Linux
$env:OPENAI_API_KEY = "sk-..."     # Windows PowerShell
```

Setting it in one terminal window doesn't carry over to a different one.

## "Error: Cannot find module '.../scripts/gate.js'"

You're running the command from the wrong directory. Every command in this
repo's instructions assumes a specific working directory — check the heading
right above the command block. Run `pwd` (or `cd` with no arguments on
Windows) to see where you actually are, and `ls` to see what's there.

## Permission denied / EACCES when running a script

On macOS/Linux, you generally don't need to `chmod +x` anything here — every
command is run as `node scripts/gate.js ...` or `python graph.py`, not as a
standalone executable. If you see a permission error, double check you're not
accidentally trying to run the file directly (`./gate.js`) instead of via
`node`.

## `pip install` fails partway through

Usually a network issue or an outdated `pip`. Try:

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If a specific package fails to build, copy the exact error into a search
engine — it's almost always a missing system-level compiler or header that's
well documented for your OS, not something wrong with this repo.

## "model unavailable" / model-not-found error

The model name baked into an SDK default may have changed, or your account
may not have access to it yet. Check your platform's current model list
(platform.openai.com for the OpenAI path) and see if the SDK needs an update
(`pip install -U openai-agents`).

## The graph seems to hang / never finishes

For the Claude path: check Claude Code isn't waiting on a permission prompt
you haven't answered — look at the terminal/UI for a yes/no question. For the
OpenAI path: a `Runner.run()` call is a real network request; a very slow or
stuck run is usually a network or provider outage, not your code — check the
provider's status page.

## Verifier says FAIL — is that a bug?

No — that's the graph working. See
[`curriculum/14-verification-and-gates/`](../curriculum/14-verification-and-gates/README.md)
and try `node scripts/gate.js runs/demo-block` (Claude path) or the OpenAI
equivalent to see a real FAIL→BLOCK outcome with zero cost. Read the specific
`failures` array in `verifier-receipt.json` — it names the exact problem.

## Gate says FREEZE — how do I unfreeze it?

You don't "unfreeze" a run — you fix the underlying cause (usually a
forbidden path touched, or a malformed/missing receipt) and start a **new**
run. See [`docs/SAFETY.md`](./SAFETY.md#freeze). Do not ask an agent to edit
`gate.js` to make a FREEZE go away — that defeats the entire point of having
a script-owned authority instead of an LLM-owned one.

## Everything above looks fine but something still doesn't match the docs

Open an issue or compare your output line-by-line against the "What you
should see" block in the relevant lesson/README — differences usually point
to exactly where the mismatch is (a different file path, a different status,
a different exit code).
