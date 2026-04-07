---
name: use-deep6
description: Use the deep6 library for deep equality, deep cloning, unification, and pattern matching with logical variables in a JavaScript/TypeScript project. Use when adding structural comparison, structured clone with circular references, extensible pattern matching with extraction, or unification-based logic to a project that depends on `deep6`.
---

# Use deep6

`deep6` is a zero-dependency ES-modules mini-library for advanced deep
equivalence, deep cloning, unification, and pattern matching with logical
variables and wildcards. It handles circular references, `Map`, `Set`, `URL`,
typed arrays, `Date`, `RegExp`, symbols, and property descriptors. It runs in
Node.js, Deno, Bun, and browsers.

When in doubt, the canonical references are `node_modules/deep6/llms.txt`
(concise) and `node_modules/deep6/llms-full.txt` (complete with examples).
Read them before guessing.

## When to reach for deep6

Pick deep6 when the problem involves _structural_ comparison or transformation
of arbitrary JavaScript values:

- **Deep equality** beyond what `===` or `JSON.stringify` can express —
  including `Map`, `Set`, `Date`, `RegExp`, typed arrays, symbol keys, and
  cycles.
- **Deep cloning** of values that `structuredClone` can't or won't handle the
  way you want (custom types, non-enumerable props, symbol keys, selectable
  options).
- **Pattern matching with extraction** — match a shape and pull bound values
  out via logical variables, rather than hand-rolling `if`/destructuring.
- **Unification** — bidirectional matching where either side may contain
  variables (the building block for rule engines, type inference, constraint
  search; this is what `yopl` is built on).
- **Custom type support** — register your own comparators / cloners via the
  extensible registry instead of forking a library.

Do **not** reach for deep6 for shallow comparisons, primitive equality, or
cases where `structuredClone` is sufficient.

## Installation

```bash
npm install deep6
```

`deep6` requires Node 18+ (or modern Deno / Bun) and `"type": "module"` (or
`.mjs` files). It has zero runtime dependencies.

## Imports

```js
// Main API — default export is `equal`
import equal, {clone, match, any, _} from 'deep6';

// Core unification
import unify, {Variable, variable, Unifier, open, soft} from 'deep6/unify.js';

// Traversal helpers
import walk from 'deep6/traverse/walk.js';
import deepClone from 'deep6/traverse/clone.js';
import preprocess from 'deep6/traverse/preprocess.js';
import assemble from 'deep6/traverse/assemble.js';
import deref from 'deep6/traverse/deref.js';

// Built-in unifiers (pattern building blocks)
import matchString from 'deep6/unifiers/matchString.js';
import matchTypeOf from 'deep6/unifiers/matchTypeOf.js';
import matchInstanceOf from 'deep6/unifiers/matchInstanceOf.js';
import matchCondition from 'deep6/unifiers/matchCondition.js';
import ref from 'deep6/unifiers/ref.js';

// Utilities
import replaceVars from 'deep6/utils/replaceVars.js';
```

## Deep equality

```js
import equal from 'deep6';

equal({a: 1, b: [2, 3]}, {b: [2, 3], a: 1}); // true
equal(new Date('2020-01-01'), new Date('2020-01-01')); // true
equal(/abc/gi, /abc/gi); // true
equal(new Map([['a', 1]]), new Map([['a', 1]])); // true

// Circular references are handled by default
const a = {};
a.self = a;
const b = {};
b.self = b;
equal(a, b); // true
```

Useful options:

- `circular: true` — handle cycles (default `true`).
- `symbols: true` — also compare symbol-keyed properties.
- `loose: true` — use `==` for primitives.
- `ignoreFunctions: true` — ignore function-valued properties.
- `signedZero: true` — distinguish `+0` from `-0`.

## Deep cloning

```js
import {clone} from 'deep6';

const x = {a: 1, b: [2, {c: 3}], d: new Map([['k', 'v']])};
const y = clone(x);
// y is a structural copy; nested Maps/Sets/typed arrays are cloned too.

// Symbols and non-enumerable properties (opt-in)
const r = {a: 1};
Object.defineProperty(r, 'b', {value: 2, enumerable: false});
const q = clone(r, {allProps: true, symbols: true});
```

Prefer `deep6`'s `clone` over `structuredClone` when you need symbol keys,
non-enumerable properties, custom registered types, or fine-grained options.

## Pattern matching

`match(object, pattern)` does **open** matching by default — extra keys in
the object are fine, missing keys in the pattern are fine.

```js
import {match, any, _} from 'deep6';
import matchString from 'deep6/unifiers/matchString.js';
import matchTypeOf from 'deep6/unifiers/matchTypeOf.js';

match({a: 1, b: 2, c: 3}, {a: 1}); // true
match({a: 1, b: {c: 2}}, {a: 1, b: any}); // true
match({a: 'hello'}, {a: matchString(/^h/i)}); // true
match({n: 42}, {n: matchTypeOf('number')}); // true
```

`any` (alias `_`) is the wildcard. Use the `unifiers/*` modules for
regex-based, type-based, instance-based, or predicate-based matching.

## Unification with logical variables

When you need to **extract** values from a match, drop down to `unify`.

```js
import unify, {variable} from 'deep6/unify.js';
import assemble from 'deep6/traverse/assemble.js';

const X = variable('X');
const Y = variable('Y');

const env = unify({user: {name: X, age: Y}}, {user: {name: 'Ada', age: 36}});

if (env) {
  assemble(X, env); // 'Ada'
  assemble(Y, env); // 36
}
```

`unify` returns an `Env` (a binding environment) on success and `null` on
failure. Use `assemble(variable, env)` to walk the bindings and produce a
plain JavaScript value (deeply, including nested terms).

Variables can appear on **either** side and can be unified against each
other:

```js
const X = variable('X'),
  Y = variable('Y');
const env = unify({a: X, b: 2}, {a: 1, b: Y});
assemble(X, env); // 1
assemble(Y, env); // 2
```

## Open / soft matching

By default `unify` does strict structural matching. For pattern-style
matching where extra keys are allowed:

```js
import unify, {open, soft} from 'deep6/unify.js';

unify(open({a: 1}), {a: 1, b: 2}); // success — extra `b` ignored
unify(soft({a: 1}), {a: 1, b: 2}); // soft = bidirectional open
```

`match(obj, pattern)` is essentially `unify(open(pattern), obj)` followed by
a success check.

## Extending the registries

Both `unify` and `clone` use extensible registries keyed by constructor.

```js
import unify from 'deep6/unify.js';
import clone from 'deep6/traverse/clone.js';

class Money {
  constructor(amount, currency) {
    this.amount = amount;
    this.currency = currency;
  }
}

unify.registry.push(Money, (l, r, env) => (l.currency === r.currency && l.amount === r.amount ? env : null));

clone.registry.push(Money, (val, ctx) => new Money(val.amount, val.currency));
```

Register once at startup. Both registries fall through in insertion order, so
more specific types should be registered last (or before a less-specific
catch-all).

## Common patterns

- **Equality with custom options** — toggle `symbols`, `loose`,
  `ignoreFunctions`, `signedZero` on `equal` rather than writing wrappers.
- **Snapshot comparison in tests** — `equal(actual, expected)` is a drop-in
  replacement for assertion libraries' `deepEqual` with broader type support.
- **Pattern + extract** — combine `unify` + `variable` + `assemble` instead
  of nested destructuring with optional chaining.
- **Custom guards** — `matchCondition(v => typeof v === 'number' && v > 0)`
  for ad-hoc predicates inside a pattern.
- **Cross-field constraints** — use `ref()` to require two positions in a
  pattern to be equal.

## Pitfalls

- **`match` is open by default.** Missing pattern keys are not failures.
  Use full `unify` (without `open`) when you need strict shape matching.
- **Circular references are on by default.** That's almost always what you
  want, but it costs a `WeakMap`. Disable with `{circular: false}` for hot
  paths over known-acyclic data.
- **Symbols are off by default** in both `equal` and `clone`. Pass
  `{symbols: true}` if symbol keys are part of identity.
- **Variables are not values.** A bare `Variable` instance is a placeholder;
  always go through `assemble(v, env)` (or `v.get(env)` for a shallow read)
  after a successful `unify`.
- **Registry order matters.** Entries are tried in insertion order; register
  specific types after generic ones.
- **`clone` follows the registry.** A type with no registered cloner falls
  back to generic structural cloning, which may not preserve class identity.
  Register a cloner if you need `instanceof` to keep working.

## Picking an entry point

| Need                                          | Use                                           |
| --------------------------------------------- | --------------------------------------------- |
| "Are these two values structurally equal?"    | `equal` (default export of `deep6`)           |
| "Give me a deep copy"                         | `clone` from `deep6`                          |
| "Does this value match this shape?"           | `match` + `any` / `unifiers/*`                |
| "Match _and_ extract bound values"            | `unify` + `variable` + `assemble`             |
| "Walk a structure with my own visitor"        | `deep6/traverse/walk.js`                      |
| "Pre-process a pattern (intern shared subs)"  | `deep6/traverse/preprocess.js`                |
| "Replace variables in a structure with binds" | `deep6/utils/replaceVars.js`                  |
| "Add support for my own class"                | `unify.registry.push` / `clone.registry.push` |

## Where to look next

- `node_modules/deep6/llms.txt` — concise API reference.
- `node_modules/deep6/llms-full.txt` — full API reference with examples.
- `node_modules/deep6/AGENTS.md` — rules, conventions, architecture quick ref.
- `node_modules/deep6/ARCHITECTURE.md` — module map and algorithm details.
- [Wiki](https://github.com/uhop/deep6/wiki) — per-module documentation.
