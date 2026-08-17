"""
Deterministic receipt writing for the OpenAI Agents SDK graph.

This module is intentionally *not* clever: it takes the structured output an
LLM agent returned and writes it to disk as plain JSON, stamping the fields
that must not be model-controlled (agent name, timestamp) itself. The LLM
proposes; this code writes the record. That split is the same "boring is the
feature" rule the Claude path uses — see docs/WHY.md.

Every function here is pure I/O with no network calls, so it can be exercised
directly (see the smoke test at the bottom of this file) without an
OPENAI_API_KEY.
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def _timestamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.") + \
        f"{datetime.now(timezone.utc).microsecond // 1000:03d}Z"


def _write_json(path: Path, payload: dict[str, Any]) -> dict[str, Any]:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    return payload


def write_writer_receipt(
    run_dir: Path,
    run_id: str,
    *,
    status: str,
    summary: str,
    files_touched: list[str],
    commands_run: list[dict[str, Any]] | None = None,
    known_limitations: list[str] | None = None,
) -> dict[str, Any]:
    """Write runs/<run_id>/writer-receipt.json. Same shape as the Claude path's
    01-claude-code/agents/writer.md receipt, so one gate.js serves both."""
    payload = {
        "agent": "writer",
        "run_id": run_id,
        "status": status,
        "summary": summary,
        "files_touched": files_touched,
        "commands_run": commands_run or [],
        "known_limitations": known_limitations or [],
        "timestamp": _timestamp(),
    }
    return _write_json(run_dir / "writer-receipt.json", payload)


def write_verifier_receipt(
    run_dir: Path,
    run_id: str,
    *,
    status: str,
    writer_status_seen: str,
    checks: list[dict[str, Any]],
    failures: list[str] | None = None,
) -> dict[str, Any]:
    """Write runs/<run_id>/verifier-receipt.json."""
    payload = {
        "agent": "verifier",
        "run_id": run_id,
        "status": status,
        "writer_status_seen": writer_status_seen,
        "checks": checks,
        "failures": failures or [],
        "timestamp": _timestamp(),
    }
    return _write_json(run_dir / "verifier-receipt.json", payload)


if __name__ == "__main__":
    # Zero-network smoke test: prove the receipt-writing + on-disk shape works
    # without ever calling an LLM. Run with: python receipts.py
    import tempfile

    with tempfile.TemporaryDirectory() as tmp:
        run_dir = Path(tmp) / "runs" / "selftest"
        w = write_writer_receipt(
            run_dir,
            "selftest",
            status="PASS",
            summary="smoke test",
            files_touched=["workspace/hello.js"],
        )
        v = write_verifier_receipt(
            run_dir,
            "selftest",
            status="PASS",
            writer_status_seen="PASS",
            checks=[{"name": "files_exist", "result": "PASS", "detail": "ok"}],
        )
        assert (run_dir / "writer-receipt.json").exists()
        assert (run_dir / "verifier-receipt.json").exists()
        assert w["agent"] == "writer" and v["agent"] == "verifier"
        print("receipts.py self-test OK — wrote and validated both receipt files")
