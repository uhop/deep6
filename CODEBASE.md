# deep6 — Codebase Quick Reference

## One-Liner

No-dependency ES6 library for deep equivalence, unification, and cloning with circular reference handling.

## Entry Points

| Module         | Exports                                                         | Purpose                      |
| -------------- | --------------------------------------------------------------- | ---------------------------- |
| `src/index.js` | `equal`, `clone`, `match`, `isShape`, `any`, `_`                | Main public API              |
| `src/unify.js` | `unify` (default), `Env`, `Variable`, `Unifier`, `open`, `soft` | Core unification algorithm   |
| `src/env.js`   | `Env`, `Variable`, `Unifier`, `variable`, `any`, `_`            | Unification state management |

## Key Algorithms

### Unification (`src/unify.js:309-438`)

Non-recursive stack-based algorithm:

1. Direct equality check (`===`)
2. Wildcard match (`any`/`_`)
3. Variable binding or lookup
4. Circular reference detection
5. Custom unifiers (`Unifier` subclass)
6. Registered type handlers (Date, RegExp, typed arrays)
7. Generic object property comparison

### Walking (`src/traverse/walk.js`)

Explicit stack traversal with registry/filter system:

- Registry: `[[Type, processor], ...]` for type-specific handling
- Filters: predicates for custom processing
- Circular detection via `seen` Map
- Post-processing for object reconstruction

### Cloning (`src/traverse/clone.js`)

Walker-based deep cloning:

- Pre-process: push commands for post-processing
- Post-process: reconstruct objects with descriptors
- Circular handling: `Circular` marker defers resolution

## Module Dependencies

```
index.js → unify.js, clone.js, preprocess.js
unify.js → env.js
env.js → (none, standalone)
walk.js → env.js (_)
clone.js → unify.js, walk.js
preprocess.js → unify.js, env.js
assemble.js → walk.js
deref.js → walk.js
unifiers/* → env.js
utils/* → env.js
```

## File Structure

```
src/
├── index.js              # Main entry
├── env.js                # Env, Variable, Unifier
├── unify.js              # Core algorithm
├── traverse/
│   ├── walk.js           # Generic walker
│   ├── clone.js          # Deep cloning
│   ├── preprocess.js     # Pattern preprocessing
│   ├── assemble.js       # Object assembly
│   └── deref.js          # Dereferencing
├── unifiers/
│   ├── matchString.js
│   ├── matchTypeOf.js
│   ├── matchInstanceOf.js
│   ├── matchCondition.js
│   └── ref.js
└── utils/
    └── replaceVars.js
```

## Testing

- **Files:** `tests/test-*.js` (~550 assertions), dispatched by `tests/tests.js`
- **Run:** `npm test`
- **Debug:** `npm run debug` (Node inspector)
- **Browser:** `npm start` (opens test server)

## Commands

| Command         | Description                       |
| --------------- | --------------------------------- |
| `npm test`      | Run test suite                    |
| `npm run debug` | Debug with Node inspector         |
| `npm start`     | Run test server for browser tests |

## AI Documentation Files

| File                              | Purpose                           |
| --------------------------------- | --------------------------------- |
| `AGENTS.md`                       | Canonical rules for all AI agents |
| `ARCHITECTURE.md`                 | Module map and dependency graph   |
| `llms.txt`                        | Quick API reference               |
| `llms-full.txt`                   | Complete API reference            |
| `README.md`                       | Usage examples                    |
| `.github/COPILOT-INSTRUCTIONS.md` | GitHub Copilot context            |

## Key Patterns

### Wildcards

```js
import {match, any, _} from 'deep6';
match({a: 1, b: 2}, {a: any}); // true
match({a: 1, b: 2}, {a: 1, b: _}); // true
```

### Open/Soft Matching

```js
import {match, open, soft} from 'deep6';
match({a: 1, b: 2}, open({a: 1})); // true (extra keys OK)
match(soft({a: 1}), {a: 1, b: 2}); // true (bidirectional)
```

### Variable Binding

```js
import unify, {variable} from 'deep6/unify.js';
const v = variable();
const env = unify({a: 1, b: v}, {a: 1, b: 2});
v.get(env); // 2
```

### Custom Unifier

```js
import {Unifier} from 'deep6/env.js';
class Range extends Unifier {
  constructor(min, max) {
    super();
    this.min = min;
    this.max = max;
  }
  unify(val) {
    return typeof val === 'number' && val >= this.min && val <= this.max;
  }
}
```

### Registry Extension

```js
import unify from 'deep6/unify.js';
import clone from 'deep6/traverse/clone.js';
unify.registry.push(MyClass, (l, r) => l.value === r.value);
clone.registry.push(MyClass, (val, ctx) => ctx.stackOut.push(new MyClass(val.value)));
```

## Supported Types

Primitives, Objects, Arrays, Map, Set, Date, RegExp, URL, all Typed Arrays, DataView, ArrayBuffer, Symbols (optional), Property Descriptors, Circular References, Functions (configurable).
