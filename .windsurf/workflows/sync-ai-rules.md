---
description: Sync all AI agent rules files to match AGENTS.md
---

# Sync AI Rules Files

Ensure all AI agent rules files are identical copies of the canonical AGENTS.md.

## Steps

1. **Read AGENTS.md** — This is the canonical source for all AI agent rules.

2. **Update `.windsurfrules`**:
   - Copy content from AGENTS.md
   - Add header comment: `<!-- Canonical source: AGENTS.md — keep this file in sync -->`

3. **Update `.cursorrules`**:
   - Copy content from AGENTS.md
   - Add header comment: `<!-- Canonical source: AGENTS.md — keep this file in sync -->`

4. **Update `.clinerules`**:
   - Copy content from AGENTS.md
   - Add header comment: `<!-- Canonical source: AGENTS.md — keep this file in sync -->`

5. **Verify all files are identical** (except for the header comment if needed).

6. **Run tests**: `npm test` to ensure no functionality was affected.

## When to Run

- After updating AGENTS.md with new rules or conventions
- Before releasing a new version (see `release-check.md`)
- When adding new AI agent support

## Files to Sync

- `.windsurfrules` — Windsurf AI rules
- `.cursorrules` — Cursor AI rules
- `.clinerules` — Cline AI rules

All three should be identical to AGENTS.md (with optional header comment).
