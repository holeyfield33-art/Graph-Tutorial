#!/usr/bin/env python
"""
graph_parallel.py — a real, runnable fan-out/join example on the OpenAI
Agents SDK, distinct from graph.py's writer/verifier/gate release graph.

    Request
       ├→ Worker("pricing")
       ├→ Worker("security")
       └→ Worker("performance")
             ↓
           Join (synthesis)

ONE agent definition (`worker_agent`), instantiated three times with
different input via asyncio.gather — not three different roles. This is
the same "100 agents != 100 roles" idea from curriculum/06-parallel-graphs,
made concrete and runnable.

Run it:

    python graph_parallel.py

Needs OPENAI_API_KEY set to actually talk to a model. With no key, you can
still confirm the wiring is correct — see the "offline check" note in
18-openai-agents/README.md.
"""

from __future__ import annotations

import asyncio
from typing import Literal

from pydantic import BaseModel

try:
    from agents import Agent, Runner
except ImportError:
    raise SystemExit(
        "openai-agents is not installed.\n"
        "Run: pip install -r requirements.txt"
    )


class WorkerOutput(BaseModel):
    topic: str
    finding: str
    confidence: Literal["low", "medium", "high"]


WORKER_INSTRUCTIONS = """\
You are a Worker node in a fan-out research graph. You will be given ONE
topic. Produce a single concrete finding about it — one sentence, specific,
not generic filler — plus a confidence level. You do not see what the other
Workers are doing, and you should not try to summarize the whole task,
only your one topic.
"""


def build_worker() -> Agent:
    # ONE node definition. graph_parallel.py instantiates it 3 times below —
    # it does not define three different agents for three different topics.
    return Agent(
        name="worker",
        instructions=WORKER_INSTRUCTIONS,
        output_type=WorkerOutput,
    )


def join(findings: list[WorkerOutput]) -> dict:
    # The join: plain code, not another model call. It only runs once every
    # branch has reported back — a synchronization barrier, same as
    # curriculum/07-fan-out-fan-in's `synthesize()`.
    return {
        "topics_covered": [f.topic for f in findings],
        "high_confidence_findings": [f.finding for f in findings if f.confidence == "high"],
        "all_findings": [f.model_dump() for f in findings],
    }


async def run_parallel(topics: list[str]) -> dict:
    worker = build_worker()
    print(f"[graph_parallel] fan-out: {len(topics)} workers, one definition, running concurrently...")

    # Fan-out: all workers start together via asyncio.gather, not one after
    # another. Each gets a DIFFERENT prompt (its topic) — same node
    # definition, different input, exactly like curriculum/04's dependency
    # analysis lesson applied to agents instead of plain functions.
    results = await asyncio.gather(
        *[Runner.run(worker, f"Research topic: {topic}") for topic in topics]
    )
    findings = [r.final_output for r in results]

    for f in findings:
        print(f"[worker:{f.topic}] {f.confidence} confidence — {f.finding}")

    print("[graph_parallel] join: waiting for all workers, then combining...")
    return join(findings)


def main() -> None:
    topics = ["pricing", "security", "performance"]
    result = asyncio.run(run_parallel(topics))
    print("\n[graph_parallel] joined result:")
    import json
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
