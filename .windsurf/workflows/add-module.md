---
description: Checklist for adding a new unifier or utility to deep6
---

# Add a New Module

Follow these steps when adding a new unifier or utility.

## Utility (e.g., `src/utils/foo.js`)

1. Create `src/utils/foo.js` with the implementation.
   - ES6 modules (`import`/`export`).
   - Zero runtime dependencies.
   - Follow existing code style (2-space indent, single quotes, no semicolons).
2. Create `tests/tests.js` additions with automated tests.
   - Import the module under test with relative paths.
   - Test normal operation, edge cases.
   // turbo
3. Run tests: `npm test`
4. Update `ARCHITECTURE.md` — add the utility to the project layout tree and dependency graph.
5. Update `llms.txt` and `llms-full.txt` with a description and example.
6. Update `AGENTS.md` if the architecture quick reference needs updating.
   // turbo
7. Run build: `npm run build` to regenerate cjs/
   // turbo
8. Verify: `npm test`

## Unifier (e.g., `src/unifiers/foo.js`)

1. Create `src/unifiers/foo.js` extending `Unifier` from `../env.js`.
   - ES6 modules (`import`/`export`).
   - Export the class and a factory function.
   - Implement `unify(val, ls, rs, env)` method.
2. Add tests in `tests/tests.js`.
   // turbo
3. Run tests: `npm test`
4. Update `ARCHITECTURE.md` — add to project layout, unifier list, and dependency graph.
5. Update `llms.txt` and `llms-full.txt`.
6. Update `AGENTS.md` if needed.
   // turbo
7. Run build: `npm run build`
   // turbo
8. Verify: `npm test`

## Traverse module (e.g., `src/traverse/foo.js`)

1. Create `src/traverse/foo.js` using the walker system from `walk.js`.
   - ES6 modules.
   - Follow existing patterns for registry/filters.
2. Add tests in `tests/tests.js`.
   // turbo
3. Run tests: `npm test`
4. Update `ARCHITECTURE.md` — add to project layout and dependency graph.
5. Update `llms.txt` and `llms-full.txt`.
6. Update `AGENTS.md` if needed.
   // turbo
7. Run build: `npm run build`
   // turbo
8. Verify: `npm test`
