Update all AI-facing documentation files after changes to the public API, modules, or project structure.

## Steps

1. Read `src/index.js` and key source files to identify the current public API.
2. Read `AGENTS.md` and `ARCHITECTURE.md` for current state.
3. Identify what changed (new unifiers, new options, renamed exports, new utilities, etc.).
4. Update `llms.txt` — ensure API section matches current source. Keep concise.
5. Update `llms-full.txt` — full API reference with all components, options, and examples.
6. Update `wiki/Home.md` if overview or structure changed.
7. Update `ARCHITECTURE.md` if project structure or module dependencies changed.
8. Update `AGENTS.md` if critical rules, commands, or architecture quick reference changed.
9. Sync `.windsurfrules`, `.cursorrules`, `.clinerules` if `AGENTS.md` changed — these should be identical copies (with optional header comment).
10. Update `CLAUDE.md` and `.github/COPILOT-INSTRUCTIONS.md` if relevant sections changed.
11. Provide a summary of what was updated.
