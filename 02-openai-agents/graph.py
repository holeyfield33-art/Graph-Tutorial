#!/usr/bin/env python
"""
graph.py — the real OpenAI Agents SDK twin of the Claude Code 3-node graph.

Same shape as 01-claude-code/:

    Writer (Agent)  ->  Verifier (Agent)  ->  Gate (gate.js, a script, not an LLM)

Run it:

    python graph.py

What it actually does (no hand-waving):

  1. Creates runs/<run_id>/.
  2. Runs the writer Agent. It has ONE tool — write_workspace_file — and can
     only write under workspace/. Its structured final answer (a WriterOutput)
     is turned into runs/<run_id>/writer-receipt.json by receipts.py, not by
     the model.
  3. Runs the verifier Agent. It has read-only tools and is told nothing
     except "here is the run_id" — it re-reads the writer's receipt and the
     actual files from disk itself, the same "don't trust the summary" rule
     as 01-claude-code/agents/verifier.md. Its structured answer becomes
     runs/<run_id>/verifier-receipt.json.
  4. Subprocess-calls the SAME gate.js the Claude path uses:
         node ../01-claude-code/scripts/gate.js runs/<run_id>
     One Gate authority for both platforms.

Needs OPENAI_API_KEY set to actually talk to a model (steps 2-3). Steps 1 and
4 need nothing — you can sanity-check the gate right now with the fixtures in
runs/demo-pass, runs/demo-freeze, runs/demo-block (see README.md).
"""

from __future__ import annotations

import argparse
import asyncio
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal

from pydantic import BaseModel

try:
    from agents import Agent, Runner, function_tool
except ImportError:
    raise SystemExit(
        "openai-agents is not installed.\n"
        "Run: pip install -r requirements.txt"
    )

import receipts

HERE = Path(__file__).resolve().parent
GATE_SCRIPT = HERE.parent / "01-claude-code" / "scripts" / "gate.js"

# The active run's workspace. Each run gets its OWN workspace under
# runs/<run_id>/workspace/, so a run is self-contained and the gate can verify
# every claimed file relative to the run directory (see scripts/gate.js). This
# is set once per run by run_graph(); the tools below resolve against it.
_ACTIVE_WORKSPACE: Path | None = None


def _workspace() -> Path:
    if _ACTIVE_WORKSPACE is None:
        raise RuntimeError("no active workspace — run_graph() must set one first")
    return _ACTIVE_WORKSPACE


# ---------------------------------------------------------------------------
# Structured outputs. The LLM must return exactly these shapes — this is what
# makes the graph's "state" (see curriculum/03-nodes-and-edges/) predictable
# instead of free-text the code has to guess-parse.
# ---------------------------------------------------------------------------

class WriterOutput(BaseModel):
    status: Literal["PASS", "FAIL"]
    summary: str
    files_touched: list[str]
    known_limitations: list[str] = []


class CheckResult(BaseModel):
    name: str
    result: Literal["PASS", "FAIL"]
    detail: str


class VerifierOutput(BaseModel):
    status: Literal["PASS", "FAIL"]
    checks: list[CheckResult]
    failures: list[str] = []


# ---------------------------------------------------------------------------
# Tools. Deliberately narrow — the writer can only write inside workspace/,
# the verifier can only read inside workspace/ and runs/. This mirrors the
# "Allowed / Forbidden" sections in 01-claude-code/agents/*.md, enforced here
# as code instead of as an instruction the model could ignore.
# ---------------------------------------------------------------------------

def _safe_workspace_path(relative_path: str) -> Path:
    workspace = _workspace()
    target = (workspace / relative_path).resolve()
    if workspace.resolve() not in target.parents and target != workspace.resolve():
        raise ValueError(f"refusing to write outside workspace/: {relative_path}")
    return target


@function_tool
def write_workspace_file(relative_path: str, content: str) -> str:
    """Write a file under workspace/. relative_path must not escape workspace/
    (no .. segments, no absolute paths)."""
    path = _safe_workspace_path(relative_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return f"wrote {len(content)} bytes to workspace/{relative_path}"


@function_tool
def read_workspace_file(relative_path: str) -> str:
    """Read a file under workspace/. Returns its exact contents, or an error
    string if it does not exist — used by the verifier to check the writer's
    claims against the real file, not just the writer's own summary."""
    path = _safe_workspace_path(relative_path)
    if not path.exists():
        return f"ERROR: workspace/{relative_path} does not exist"
    return path.read_text(encoding="utf-8")


@function_tool
def list_workspace_files() -> list[str]:
    """List every file that currently exists under workspace/."""
    workspace = _workspace()
    if not workspace.exists():
        return []
    return sorted(
        str(p.relative_to(workspace)).replace("\\", "/")
        for p in workspace.rglob("*")
        if p.is_file()
    )


WRITER_INSTRUCTIONS = """\
You are Agent 1 — Writer in a 3-node agent graph (writer -> verifier -> gate).

Complete the task you are given, using the write_workspace_file tool. Keep
the change as small as possible. You may only write files under workspace/ —
the tool enforces this.

Do not claim the release gate passed; that is not your decision. A separate
Verifier will independently check your work, and a deterministic script (not
an LLM, not you) decides PASS/BLOCK/FREEZE.

When you are done, return a WriterOutput: status PASS if you completed the
task, FAIL if you could not; a one-sentence summary; the exact list of
workspace-relative paths you touched; and any known_limitations.
"""

VERIFIER_INSTRUCTIONS = """\
You are Agent 2 — Verifier in a 3-node agent graph. You do NOT trust the
Writer's summary. Use read_workspace_file and list_workspace_files to check
the actual files yourself before writing any check as PASS.

For each file the writer claims to have touched: confirm it exists, confirm
its content actually satisfies the task (not just that it's non-empty), and
look for contradictions between the writer's summary and the real file.

Banned phrases as your only justification for a PASS: "looks good", "writer
said so", "probably fine" — every check needs a concrete detail from a file
you actually read.

Return a VerifierOutput: overall status PASS only if every check you ran is
PASS and no material claim is unsupported; otherwise FAIL, with the specific
failure(s) explained in `failures`.
"""


def build_agents() -> tuple[Agent, Agent]:
    writer = Agent(
        name="writer",
        instructions=WRITER_INSTRUCTIONS,
        tools=[write_workspace_file],
        output_type=WriterOutput,
    )
    verifier = Agent(
        name="verifier",
        instructions=VERIFIER_INSTRUCTIONS,
        tools=[read_workspace_file, list_workspace_files],
        output_type=VerifierOutput,
    )
    return writer, verifier


DEFAULT_TASK = (
    "Create workspace/hello.js that exports a function hello(name) returning "
    "the string `Hello, ${name}!`. Create workspace/hello.test.js that calls "
    "hello('World') and asserts the result includes 'World' (throw if not)."
)


async def run_graph(task: str, run_id: str) -> int:
    global _ACTIVE_WORKSPACE
    run_dir = HERE / "runs" / run_id
    # Each run owns its workspace, so the gate can verify files relative to the
    # run directory and two runs never collide over one shared folder.
    _ACTIVE_WORKSPACE = run_dir / "workspace"
    _ACTIVE_WORKSPACE.mkdir(parents=True, exist_ok=True)
    writer, verifier = build_agents()

    print(f"[graph] run_id={run_id}")
    print("[graph] Writer: starting...")
    writer_result = await Runner.run(writer, task)
    writer_out: WriterOutput = writer_result.final_output
    receipts.write_writer_receipt(
        run_dir,
        run_id,
        status=writer_out.status,
        summary=writer_out.summary,
        files_touched=[f"workspace/{p}" for p in writer_out.files_touched],
        known_limitations=writer_out.known_limitations,
    )
    print(f"[graph] Writer: {writer_out.status} — {writer_out.summary}")

    print("[graph] Verifier: starting...")
    verifier_prompt = (
        f"The writer just finished run_id={run_id}. It claims status "
        f"{writer_out.status} touching {writer_out.files_touched}. "
        "Independently verify this using your tools before answering."
    )
    verifier_result = await Runner.run(verifier, verifier_prompt)
    verifier_out: VerifierOutput = verifier_result.final_output
    receipts.write_verifier_receipt(
        run_dir,
        run_id,
        status=verifier_out.status,
        writer_status_seen=writer_out.status,
        checks=[c.model_dump() for c in verifier_out.checks],
        failures=verifier_out.failures,
    )
    print(f"[graph] Verifier: {verifier_out.status}")

    print(f"[graph] Gate: node {GATE_SCRIPT.relative_to(HERE.parent)} runs/{run_id}")
    gate = subprocess.run(
        ["node", str(GATE_SCRIPT), str(run_dir)],
        capture_output=True,
        text=True,
    )
    print(gate.stdout)
    if gate.returncode != 0:
        print(gate.stderr, file=sys.stderr)
    return gate.returncode


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--task", default=DEFAULT_TASK, help="task text for the writer agent")
    parser.add_argument(
        "--run-id",
        default=None,
        help="run id (default: demo-<timestamp>)",
    )
    args = parser.parse_args()
    run_id = args.run_id or f"demo-{datetime.now(timezone.utc):%Y%m%d-%H%M%S}"

    exit_code = asyncio.run(run_graph(args.task, run_id))
    # Gate exit codes ARE the graph's edges: 0 PASS, 1 BLOCK, 2 FREEZE.
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
