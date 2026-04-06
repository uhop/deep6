Run through the pre-release verification checklist for deep6.

## Steps

1. Check that `ARCHITECTURE.md` reflects any structural changes.
2. Check that `AGENTS.md` is up to date with any rule or workflow changes.
3. Check that `.windsurfrules`, `.clinerules`, `.cursorrules` are in sync with `AGENTS.md`.
4. Check that `CLAUDE.md` and `.github/COPILOT-INSTRUCTIONS.md` are up to date.
5. Check that `llms.txt` and `llms-full.txt` are up to date with any API changes.
6. Verify `package.json`:
   - `files` array includes all necessary entries (`src`, `llms.txt`, `llms-full.txt`).
   - `exports` map is correct.
   - `description` and `keywords` are current.
7. Check that the copyright year in `LICENSE` includes the current year.
8. Bump `version` in `package.json`.
9. Update release history in `README.md`.
10. Run `npm install` to regenerate `package-lock.json`.
11. Run the full test suite: `npm test`.
12. Dry-run publish to verify package contents: `npm pack --dry-run`.
