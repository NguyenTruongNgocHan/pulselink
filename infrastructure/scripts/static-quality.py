#!/usr/bin/env python3
"""Reject common generated-code shortcuts before packaging PulseLink."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WEB = ROOT / "apps/web/src"
API = ROOT / "apps/api/src/main/java"
errors: list[str] = []


def fail(message: str) -> None:
    errors.append(message)


for path in ROOT.rglob("*"):
    if path.is_dir() and not any(path.iterdir()):
        fail(f"empty directory: {path.relative_to(ROOT)}")

for name in (".git", ".env", "node_modules", "dist", "target", ".idea"):
    for path in ROOT.rglob(name):
        fail(f"forbidden release artifact: {path.relative_to(ROOT)}")

for path in WEB.rglob("*"):
    if path.suffix not in {".ts", ".tsx"}:
        continue
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    relative = path.relative_to(ROOT)

    if len(lines) <= 3 and len(text) > 300:
        fail(f"compressed source file: {relative}")

    if "/pages/" in path.as_posix() and len(lines) > 200:
        fail(f"page exceeds 200 lines and should be decomposed: {relative}")

    for number, line in enumerate(lines, start=1):
        if len(line) > 220 and path.name != "Icon.tsx":
            fail(f"line longer than 220 chars: {relative}:{number}")

    if "/pages/" in path.as_posix() and re.search(r"\bapiClient\b", text):
        fail(f"page calls apiClient directly instead of feature API/hook: {relative}")

    if re.search(r"\b(?:mock|dummy|fake)(?:Data|Items|Users|Messages)\b", text, re.I):
        fail(f"production mock symbol detected: {relative}")

    if "export const people =" in text or "export const conversations =" in text:
        fail(f"known production mock array detected: {relative}")



def resolve_local_import(source: Path, specifier: str) -> bool:
    if specifier.startswith("@/"):
        base = WEB / specifier[2:]
    elif specifier.startswith("."):
        base = source.parent / specifier
    else:
        return True

    candidates = [
        base,
        Path(str(base) + ".ts"),
        Path(str(base) + ".tsx"),
        Path(str(base) + ".css"),
        base / "index.ts",
        base / "index.tsx",
    ]
    return any(candidate.is_file() for candidate in candidates)


IMPORT_PATTERN = re.compile(
    r"(?:from\s+|import\s*\(\s*|import\s+)[\"']([^\"']+)[\"']"
)
for path in WEB.rglob("*"):
    if path.suffix not in {".ts", ".tsx"}:
        continue
    text = path.read_text(encoding="utf-8")
    for specifier in IMPORT_PATTERN.findall(text):
        if not resolve_local_import(path, specifier):
            fail(
                f"unresolved local import in {path.relative_to(ROOT)}: {specifier}"
            )

for path in API.rglob("package-info.java"):
    fail(f"package-info-only skeleton is not allowed: {path.relative_to(ROOT)}")

for path in API.rglob("*.java"):
    text = path.read_text(encoding="utf-8")
    relative = path.relative_to(ROOT)
    lines = text.splitlines()
    for number, line in enumerate(lines, start=1):
        if len(line) > 220:
            fail(f"line longer than 220 chars: {relative}:{number}")
    if re.search(r"\bTODO\b|\bFIXME\b", text):
        fail(f"unfinished marker detected: {relative}")

required = (
    ROOT / "ACCEPTANCE-REPORT.md",
    ROOT / "README-RUN.md",
    ROOT / "infrastructure/scripts/smoke-test.sh",
    ROOT / "infrastructure/scripts/api-smoke.py",
    ROOT / "infrastructure/scripts/realtime-smoke.mjs",
    ROOT / "apps/api/src/main/java/com/pulselink/shared/config/OpenApiConfig.java",
)
for path in required:
    if not path.is_file():
        fail(f"required release file is missing: {path.relative_to(ROOT)}")

if errors:
    print("Static quality gate failed:")
    for error in errors:
        print(f" - {error}")
    sys.exit(1)

print("PASS static architecture and source-quality gate")
