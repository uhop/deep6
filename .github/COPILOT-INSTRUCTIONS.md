# deep6 — GitHub Copilot Instructions

> Canonical source is [AGENTS.md](../AGENTS.md) — this file provides quick context for GitHub Copilot.

## Project Identity

deep6 is a no-dependency ES6 mini-library for advanced deep equivalence, unification, and cloning of JavaScript structures. It supports extensible pattern matching, deep cloning with circular reference handling, and traversing complex objects including Map, Set, typed arrays, symbols, and property descriptors.

## Key Conventions

- **Zero runtime dependencies** — Only devDependencies allowed
- **ES6 modules** — Use `import`/`export` syntax (project is `"type": "module"`)
- **Code style** — 2-space indent, single quotes, semicolons required (Prettier enforced)
- **Non-recursive algorithms** — Stack-based traversal to avoid stack overflow

## Import Patterns

```js
// Main API
import equal, {clone, match, any, _} from 'deep6';

// Core unification
import unify, {Variable, variable, Unifier} from 'deep6/unify.js';

// Environment
import {Env, Variable, Unifier} from 'deep6/env.js';

// Traversal
import walk from 'deep6/traverse/walk.js';
import clone from 'deep6/traverse/clone.js';

// Unifiers
import matchString from 'deep6/unifiers/matchString.js';
import matchTypeOf from 'deep6/unifiers/matchTypeOf.js';
import matchInstanceOf from 'deep6/unifiers/matchInstanceOf.js';
import matchCondition from 'deep6/unifiers/matchCondition.js';
import ref from 'deep6/unifiers/ref.js';
```

## Core Concepts

### Unification

Bidirectional matching with variable binding. The algorithm is non-recursive (stack-based) and handles:

- Direct equality, wildcards (`any`/`_`), variable binding
- Circular references, custom unifiers, registered types
- Generic object property comparison

### Wrap Types

- `open(obj)` — Target can have extra keys not in pattern
- `soft(obj)` — Bidirectional open matching, updates both objects

### Walker

Generic non-recursive object walker with registry/filter system:

- Registry: type-specific handlers `[[Type, processor], ...]`
- Filters: custom processing predicates
- Circular detection via `seen` Map

### Cloning

Uses walker with post-processing for deep cloning:

- Handles all standard JS types
- Preserves property descriptors and symbols
- Circular reference handling via `Circular` marker

## API Quick Reference

### equal(a, b, options)

Deep equivalence. Options: `circular`, `symbols`, `loose`, `ignoreFunctions`, `signedZero`

### clone(object, options)

Deep cloning. Options: `circular`, `symbols`, `allProps`

### match(object, pattern)

Pattern matching with wildcards. Default: `openObjects`, `openMaps`, `openSets`

### unify(a, b, env, options)

Core unification. Returns `Env` on success, `null` on failure.

## Testing

- Tests split by group in `tests/test-*.js`, run via `tests/tests.js` (~550 assertions)
- Run: `npm test`
- Debug: `npm run debug`

## Documentation Files

- **Rules:** [AGENTS.md](../AGENTS.md)
- **Architecture:** [ARCHITECTURE.md](../ARCHITECTURE.md)
- **Quick API:** [llms.txt](../llms.txt)
- **Full API:** [llms-full.txt](../llms-full.txt)
- **Usage:** [README.md](../README.md)
- **Wiki:** https://github.com/uhop/deep6/wiki
