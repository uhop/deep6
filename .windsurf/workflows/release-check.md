---
description: Pre-release verification checklist for deep6
---

# Release Check

Run through this checklist before publishing a new version.

## Steps

1. Check that `ARCHITECTURE.md` reflects any structural changes.
2. Check that `AGENTS.md` is up to date with any rule or workflow changes.
3. Check that `.windsurfrules`, `.clinerules`, `.cursorrules` are in sync with `AGENTS.md`.
4. Check that `llms.txt` and `llms-full.txt` are up to date with any API changes.
5. Verify `package.json`:
   - `files` array includes all necessary entries (`src`, `llms.txt`, `llms-full.txt`).
   - `exports` map is correct.
   - `description` and `keywords` are current.
6. Check that the copyright year in `LICENSE` includes the current year.
7. Bump `version` in `package.json`.
8. Update release history in `README.md`.
9. Run `npm install` to regenerate `package-lock.json`.
   // turbo
10. Run the full test suite: `npm test`
   // turbo
11. Dry-run publish to verify package contents: `npm pack --dry-run`
