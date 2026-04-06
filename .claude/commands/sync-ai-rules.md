Sync all AI agent rules files to match the canonical AGENTS.md.

## Steps

1. Read `AGENTS.md` — this is the canonical source for all AI agent rules.
2. Update `.windsurfrules` — copy content from AGENTS.md, add header: `<!-- Canonical source: AGENTS.md — keep this file in sync -->`
3. Update `.cursorrules` — same as above.
4. Update `.clinerules` — same as above.
5. Update `.github/COPILOT-INSTRUCTIONS.md` — update relevant sections to match AGENTS.md changes while keeping Copilot-specific format.
6. Update `CLAUDE.md` — update relevant sections to match AGENTS.md changes while keeping Claude Code-specific format.
7. Verify all synced files are consistent.
8. Run `npm test` to ensure nothing was affected.
