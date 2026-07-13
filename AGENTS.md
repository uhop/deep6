# AGENTS.md — deep6

> `deep6` is a no-dependency ES6 mini-library for advanced deep equivalence, unification, and cloning of JavaScript structures. It supports extensible pattern matching, deep cloning with circular reference handling, and traversing complex objects including Map, Set, typed arrays, symbols, and property descriptors.

## AI Documentation

- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md) — Module map, dependency graph, algorithm details
- **Quick API:** [llms.txt](./llms.txt) — Concise API reference for LLMs
- **Full API:** [llms-full.txt](./llms-full.txt) — Complete API reference with examples
- **Codebase Quick Ref:** [CODEBASE.md](./CODEBASE.md) — One-liner, entry points, key patterns
- **Usage:** [README.md](./README.md) — Installation and examples

## Workflows

Available in `.claude/commands/` and `.windsurf/workflows/`:

- **`add-module.md`** — Checklist for adding new unifiers, utilities, or traverse modules

## Skills

Domain-specific knowledge in `.claude/commands/`, `.windsurf/skills/`, and `.cursor/skills/`:

- **`write-tests/`** — How to write tests for deep6 modules
- **`add-unifier/`** — How to create new unifier modules
- **`debug-unification/`** — How to debug unification failures
- **`add-type-support/`** — How to add support for new types to registries

For project structure, module dependencies, and the architecture overview see [ARCHITECTURE.md](./ARCHITECTURE.md).
For detailed usage docs and API references see the [wiki](https://github.com/uhop/deep6/wiki).

## Setup

```bash
git clone https://github.com/uhop/deep6.git
cd deep6
npm install
```

## Commands

- **Install:** `npm install`
- **Test:** `npm test`
- **Debug:** `npm run debug` — run tests with Node inspector
- **Type check:** `npm run ts-check` — TypeScript type checking
- **Lint:** `npm run lint` — Prettier check
- **Lint fix:** `npm run lint:fix` — Prettier write

## Project structure

```
deep6/
├── package.json          # Package config
├── src/                  # ES6 source code
│   ├── index.js          # Main entry: exports equal, clone, match, any, _
│   ├── env-shared.js     # Implementation-agnostic primitives: Unifier, Variable, any, _
│   ├── env.js            # Env class (proto-chain implementation) + re-exports
│   ├── env-map.js        # EnvMap class (Map-stack sibling) + re-exports
│   ├── unify.js          # Core unification algorithm (non-recursive stack-based)
│   ├── traverse/         # Object traversal and cloning
│   │   ├── walk.js       # Generic non-recursive object walker
│   │   ├── clone.js      # Deep cloning with circular ref handling
│   │   ├── preprocess.js # Pattern preprocessing for matching
│   │   ├── assemble.js   # Object assembly utilities
│   │   └── deref.js      # Dereferencing utilities
│   ├── unifiers/         # Pattern matching components
│   │   ├── matchString.js    # Regex-based string matching
│   │   ├── matchTypeOf.js    # Type-based matching
│   │   ├── matchInstanceOf.js # instanceof matching
│   │   ├── matchCondition.js  # Conditional matching
│   │   └── ref.js            # Reference variables
│   └── utils/
│       └── replaceVars.js   # Variable replacement utility
├── tests/                # Test files
│   ├── tests.js          # Test dispatcher (~706 tests)
│   ├── harness.js        # Shared test harness
│   ├── test-*.js         # Test groups (env, env-map, unify, match, registry, unifiers, traverse, index, edge-cases)
│   └── server.js         # Browser test server
├── .github/              # CI workflows, funding, dependabot
```

## Code style

- **ES6 modules** (`"type": "module"` in package.json).
- **Zero runtime dependencies.** Only `devDependencies` are allowed.
- **Prettier** for formatting (see `.prettierrc`): 2-space indent, single quotes, semicolons required, no trailing commas.
- The package is `deep6`. No external dependencies.

## Critical rules

- **ES6 modules.** Use `import`/`export` syntax in source.
- **Zero runtime dependencies.** Do not add packages to `dependencies`.
- **Do not modify or delete test expectations** without understanding why they changed.
- **Comments are _why_-markers only** — a non-trivial decision/constraint or an algorithm reference; never narration of _what_ the code does. Type docs live in the `.d.ts`, not as JSDoc in `.js`. Strip narrating comments opportunistically in files you're already editing.
- **Keep `src/` in sync.** Run `npm test` and `npm run lint:fix` after changes.

## Architecture

- **Unification core** (`src/unify.js`) is the heart of the library. It implements a non-recursive stack-based unification algorithm that can:
  - Compare objects for deep equivalence
  - Match patterns with wildcards (`any`/`_`)
  - Capture values into logical variables
  - Handle circular references
  - Support open/soft object matching

- **Environment** — two interchangeable implementations of the `EnvLike` method contract:
  - `Env` (`src/env.js`) — proto-chain implementation; the default created by `unify()` when no env is passed.
  - `EnvMap` (`src/env-map.js`) — `Map`-stack sibling; ~4–8× faster on accumulating-symbol/alias workloads (solver-style use). Opt in by passing `new EnvMap()` to `unify()`.
  - Behavioural flags (`openObjects`, `circular`, `symbols`, …) live on `env.options` — never on the env instance directly.
  - `EnvLike` (`src/env-shared.d.ts`, TS-only) — the method contract both classes implement.
- **Shared primitives** (`src/env-shared.js`) — implementation-agnostic, work with any `EnvLike`:
  - `Variable` — named logical variable that can be bound during unification.
  - `Unifier` — base class for custom unification behavior.
  - `any`/`_` — well-known symbol wildcard that matches anything.
  - Both `env.js` and `env-map.js` re-export this whole set, so legacy imports from `'deep6/env.js'` keep working.

- **Walker** (`src/traverse/walk.js`) is the foundation for all traversal:
  - Non-recursive stack-based walking
  - Registry system for type-specific handlers
  - Filter system for custom processing
  - Circular reference detection

- **Cloning** (`src/traverse/clone.js`) uses the walker to create deep copies:
  - Handles all standard JS types
  - Preserves property descriptors
  - Supports symbol properties
  - Handles circular references correctly

- **Preprocessing** (`src/traverse/preprocess.js`) prepares patterns for matching:
  - Transforms plain objects into unification-aware structures
  - Handles open/closed matching modes

- **Unifiers** (`src/unifiers/`) provide extensible pattern matching:
  - `matchString` — regex-based string matching with capture
  - `matchTypeOf` — match by `typeof` value
  - `matchInstanceOf` — match by `instanceof` check
  - `matchCondition` — match by custom predicate
  - `ref` — reference variable for cross-pattern matching

## Writing tests

```js
import {equal, clone, match, any} from '../src/index.js';

const x = {a: 1, b: 2, c: ['hi!', 42, null, {}]};

// deep equality
equal(x, {b: 2, a: 1, c: ['hi!', 42, null, {}]}); // true

// pattern matching
match(x, {a: 1}); // true
match(x, {a: 1, c: any}); // true

// deep cloning
const y = clone(x);
equal(x, y); // true
```

- Tests are split by group in `tests/test-*.js`, run via `tests/tests.js`.
- Tests run with `npm test`.
- Browser tests: open `tests/tests.html` or run `npm start`.

## Key concepts

### Unification

Unification is the process of determining if two values can be made equal by binding variables. It's bidirectional — either side can have variables.

```js
import {unify, Variable, variable} from 'deep6/unify.js';

const v = variable();
const env = unify({a: 1, b: v}, {a: 1, b: 2});
// env.get(v.name) === 2
```

### Wildcards

`any` (or `_`) matches any value:

```js
import {match, any, _} from 'deep6';

match({a: 1, b: 2}, {a: any}); // true
match({a: 1, b: 2}, {a: 1, b: _}); // true
```

### Pattern matching

`match(object, pattern)` checks if object matches pattern:

```js
import {match, any} from 'deep6';

match({a: 1, b: {c: 2}}, {a: 1}); // true (open match)
match({a: 1, b: {c: 2}}, {a: 1, b: any}); // true
```

### Deep cloning

`clone(object, options)` creates a deep copy:

```js
import {clone} from 'deep6';

const x = {a: new Map(), b: Buffer.from([1, 2, 3])};
const y = clone(x);
// y is a deep copy of x
```

Options:

- `circular: true` — handle circular references (default: true)
- `symbols: true` — clone symbol properties
- `allProps: true` — clone non-enumerable properties

## Registry and filters

Both `unify` and `clone` support extensible registries:

```js
import unify from 'deep6/unify.js';
import clone from 'deep6/traverse/clone.js';

// Add custom type unifier
unify.registry.push(MyClass, (l, r) => /* compare */);

// Add custom type cloner
clone.registry.push(MyClass, (val, context) => /* clone */);
```

## Key conventions

- **Zero dependencies.** Do not add runtime dependencies.
- All public API is in `src/`.
- Tests verify correctness against ~706 assertions.
- The project supports modern environments: Node.js, browsers, Deno, Bun.

## When reading the codebase

- Start with this file ([AGENTS.md](./AGENTS.md)) for rules and constraints
- Consult [ARCHITECTURE.md](./ARCHITECTURE.md) for module relationships
- Use [llms.txt](./llms.txt) for quick API lookup
- Reference [CODEBASE.md](./CODEBASE.md) for algorithm details
- Follow workflows in `.claude/commands/` or `.windsurf/workflows/` for common tasks
- Run `npm test` and `npm run lint:fix` after any changes

### Core files to understand

- `src/unify.js` — Core unification algorithm (non-recursive stack-based)
- `src/env-shared.js` — Implementation-agnostic primitives: Unifier, Variable, any/\_
- `src/env.js` — Default proto-chain `Env` implementation
- `src/env-map.js` — Map-stack `EnvMap` sibling (perf opt-in for solver workloads)
- `src/traverse/walk.js` — Foundation for all traversal operations
- `src/index.js` — Main entry point and public API
