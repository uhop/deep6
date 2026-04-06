# Architecture

`deep6` is a no-dependency ES6 mini-library for advanced deep equivalence, unification, and cloning of JavaScript structures. It supports extensible pattern matching with wildcards, deep cloning with circular reference handling, and traversing complex objects including Map, Set, typed arrays, symbols, and property descriptors.

## Project layout

```
package.json              # Package config
src/                      # ES6 source code
├── index.js              # Main entry: exports equal, clone, match, any, _
├── env.js                # Env, Variable, Unifier classes for unification
├── unify.js              # Core unification algorithm (non-recursive stack-based)
├── traverse/             # Object traversal and cloning
│   ├── walk.js           # Generic non-recursive object walker
│   ├── clone.js          # Deep cloning with circular ref handling
│   ├── preprocess.js     # Pattern preprocessing for matching
│   ├── assemble.js       # Object assembly utilities
│   └── deref.js          # Dereferencing utilities
├── unifiers/             # Pattern matching components
│   ├── matchString.js    # Regex-based string matching
│   ├── matchTypeOf.js    # Type-based matching
│   ├── matchInstanceOf.js # instanceof matching
│   ├── matchCondition.js  # Conditional matching
│   └── ref.js            # Reference variables
└── utils/
    └── replaceVars.js    # Variable replacement utility
tests/                    # Test files (tests.js, server.js, tests.html)
.github/                  # CI workflows, funding, dependabot
```

## Core concepts

### Unification

Unification is the heart of deep6. It's the process of determining if two values can be made equal by binding variables. The algorithm is:

- **Non-recursive** — uses an explicit stack to avoid stack overflow
- **Bidirectional** — either side can have variables
- **Extensible** — registry system for custom types

The main unification loop (`src/unify.js:346-438`) processes pairs of values from two stacks:

1. **Direct equality** — same reference
2. **Wildcard match** — `any`/`_` matches anything
3. **Variable binding** — bind or check existing binding
4. **Circular detection** — track seen objects
5. **Custom unifiers** — `Unifier` subclasses
6. **Registered types** — Date, RegExp, typed arrays, etc.
7. **Generic objects** — compare properties recursively

### Wrap types

`open` and `soft` wrappers control how objects match:

- **`open`** — target can have extra keys not in pattern
- **`soft`** — bidirectional open matching, updates both objects

```js
import {match, open} from 'deep6';
match({a: 1, b: 2}, open({a: 1})); // true (b is ignored)
```

### Pattern matching

`match(object, pattern)` uses unification with `openObjects: true`:

```js
import {match, any} from 'deep6';
match({a: 1, b: 2}, {a: any}); // true
match({a: 1, b: 2}, {a: 1, c: 1}); // false (c missing)
```

Preprocessing (`src/traverse/preprocess.js`) transforms plain objects into `Wrap` instances based on options.

### Walker

`src/traverse/walk.js` provides the foundation for all traversal:

- **Non-recursive** — explicit stack prevents overflow
- **Registry-based** — type-specific handlers
- **Filter system** — custom processing predicates
- **Circular detection** — optional `seen` Map tracking

```js
walk(object, {
  processObject: (obj, ctx) => {
    /* handle object */
  },
  processOther: (val, ctx) => {
    /* handle primitive */
  },
  registry: [[Date, (d, ctx) => ctx.stackOut.push(d)]],
  circular: true
});
```

### Cloning

`src/traverse/clone.js` uses the walker with custom handlers:

1. **Registry entries** for each supported type
2. **Object handler** — preserve property descriptors
3. **Circular handling** — `Circular` marker + deferred resolution
4. **Symbol support** — optional cloning of symbol properties

Options:

- `circular: true` — handle circular references
- `symbols: true` — clone symbol properties
- `allProps: true` — clone non-enumerable properties

## Module dependency graph

```
src/index.js ── src/unify.js, src/traverse/clone.js, src/traverse/preprocess.js
                    │
src/unify.js ── src/env.js (Env, Variable, Unifier, any, _)
                    │
src/env.js ── (standalone, no imports)

src/traverse/walk.js ── src/env.js (_ only)

src/traverse/clone.js ── src/unify.js (Env, Unifier, Variable), src/traverse/walk.js

src/traverse/preprocess.js ── src/unify.js (Wrap, isOpen, isSoft), src/env.js (_)

src/traverse/assemble.js ── src/traverse/walk.js (Command, registry)

src/traverse/deref.js ── (standalone)

src/unifiers/matchString.js ── src/env.js (Unifier, isVariable)

src/unifiers/matchTypeOf.js ── src/env.js (Unifier, isVariable)

src/unifiers/matchInstanceOf.js ── src/env.js (Unifier, isVariable)

src/unifiers/matchCondition.js ── src/env.js (Unifier, isVariable)

src/unifiers/ref.js ── src/env.js (Unifier, isVariable)

src/utils/replaceVars.js ── src/env.js (isVariable)
```

## Import paths

```js
// Main API
import equal, {clone, match, any} from 'deep6';

// Core unification
import unify, {Variable, variable, Unifier, any, _} from 'deep6/unify.js';

// Environment
import {Env, Variable, Unifier, any, _} from 'deep6/env.js';

// Cloning
import clone from 'deep6/traverse/clone.js';

// Walker
import walk from 'deep6/traverse/walk.js';

// Preprocessing
import preprocess from 'deep6/traverse/preprocess.js';

// Unifiers
import matchString from 'deep6/unifiers/matchString.js';
import matchTypeOf from 'deep6/unifiers/matchTypeOf.js';
import matchInstanceOf from 'deep6/unifiers/matchInstanceOf.js';
import matchCondition from 'deep6/unifiers/matchCondition.js';
import ref from 'deep6/unifiers/ref.js';
```

## Testing

- **Framework:** tape6
- **Run all:** `npm test`
- **Run browser tests:** `npm start` (opens tests/server.js)
- **Run single file:** `node tests/tests.js`
- **Debug:** `npm run debug` (Node inspector)
