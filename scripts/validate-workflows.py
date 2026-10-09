#!/usr/bin/env python3
"""Validate config/workflows.json: the workflow catalog.

Checks:
- valid JSON with a "workflows" list
- every entry has id, name, status, description, owner, last_verified
- ids match WF-NN, are unique, and sequential from WF-01
- status is one of: proposed, in-progress, active, paused, retired
"""
import json
import re
import sys
from pathlib import Path

CATALOG = Path(__file__).resolve().parent.parent / "config" / "workflows.json"
STATUSES = {"proposed", "in-progress", "active", "paused", "retired"}
errors = []

try:
    data = json.loads(CATALOG.read_text())
except Exception as e:
    print(f"FAIL: cannot parse {CATALOG}: {e}")
    sys.exit(1)

workflows = data.get("workflows")
if not isinstance(workflows, list) or not workflows:
    print("FAIL: 'workflows' must be a non-empty list")
    sys.exit(1)

seen = set()
for i, wf in enumerate(workflows, start=1):
    tag = wf.get("id", f"<missing id #{i}>")
    for field in ("id", "name", "status", "description", "owner", "last_verified"):
        if not wf.get(field):
            errors.append(f"{tag}: missing '{field}'")
    if not re.fullmatch(r"WF-\d{2}", tag or ""):
        errors.append(f"{tag}: id must match WF-NN")
    if tag in seen:
        errors.append(f"{tag}: duplicate id")
    seen.add(tag)
    expected = f"WF-{i:02d}"
    if tag != expected:
        errors.append(f"{tag}: ids must be sequential from WF-01 (expected {expected} at position {i})")
    if wf.get("status") not in STATUSES:
        errors.append(f"{tag}: status must be one of {sorted(STATUSES)}")

if errors:
    print("FAIL:")
    for e in errors:
        print(f"  - {e}")
    sys.exit(1)
print(f"OK: {len(workflows)} workflows, catalog valid.")
