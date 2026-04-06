Add a new module to deep6. Follow this checklist based on the module type.

## Utility (`src/utils/$ARGUMENTS.js`)

1. Create `src/utils/$ARGUMENTS.js` — ES6 modules, zero runtime deps, follow existing code style.
2. Add tests in `tests/tests.js` with relative imports.
3. Run `npm test`.
4. Create wiki page at `wiki/$ARGUMENTS.md`.
5. Add link in `wiki/Home.md`.
6. Update `ARCHITECTURE.md` — project layout tree and dependency graph.
7. Update `llms.txt` and `llms-full.txt` with description and example.
8. Update `AGENTS.md` if architecture quick reference needs updating.
9. Run `npm test` again to verify.

## Unifier (`src/unifiers/$ARGUMENTS.js`)

1. Create `src/unifiers/$ARGUMENTS.js` extending `Unifier` from `../env.js`. Export the class and a factory function. Implement `unify(val, ls, rs, env)`.
2. Add tests in `tests/tests.js`.
3. Run `npm test`.
4. Create wiki page at `wiki/$ARGUMENTS.md`.
5. Add link in `wiki/Home.md` under Unifiers section.
6. Update `ARCHITECTURE.md` — project layout, unifier list, dependency graph.
7. Update `llms.txt` and `llms-full.txt`.
8. Update `AGENTS.md` if needed.
9. Run `npm test` again.

## Traverse module (`src/traverse/$ARGUMENTS.js`)

1. Create `src/traverse/$ARGUMENTS.js` using the walker system from `walk.js`. ES6 modules, follow existing registry/filter patterns.
2. Add tests in `tests/tests.js`.
3. Run `npm test`.
4. Create wiki page at `wiki/$ARGUMENTS.md`.
5. Add link in `wiki/Home.md` under Traverse section.
6. Update `ARCHITECTURE.md` — project layout and dependency graph.
7. Update `llms.txt` and `llms-full.txt`.
8. Update `AGENTS.md` if needed.
9. Run `npm test` again.
