# deep6 [![NPM version][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/deep6.svg
[npm-url]: https://npmjs.org/package/deep6

`deep6` is a no-dependency ES6 mini-library:

- Advanced deep equivalency for JavaScript structures.
  - Extensible to accommodate custom objects.
- Traversing objects.
  - Extensible deep cloning.
- Written in ES6:
  - Use it in Node or browsers without transpiling.
  - Natively supports `Map`, `Set`, typed arrays.
  - Natively supports symbols and property descriptors.
  - Presented as ES6 modules.
- Efficient non-recursive algorithms.
  - ~550 tests to ensure correctness.
  - Support for circular dependencies.
  - Support for "loose" comparisons.
- Unification.
  - Identifying and capturing object fragments.

## Intro

```js
import equal, {match, clone, any} from 'deep6';

const x = {a: 1, b: 2, c: ['hi!', 42, null, {}]};

// deep equality
equal(x, {b: 2, a: 1, c: ['hi!', 42, null, {}]}); // true
equal(x, {b: 2, a: 1, c: ['hi!', 42, null, {z: 1}]}); // false

// pattern matching
match(x, {a: 1}); // true
match(x, {z: 1}); // false
match(x, {a: 1, c: any}); // true
match(x, {a: 1, c: []}); // false
match(x, {a: 1, d: any}); // false

// deep cloning
const y = clone(x);
equal(x, y); // true

// circular dependencies are fine
const z = {},
  w = {};
z.z = z;
w.z = w;
const p = clone(w);
equal(z, w); // true
equal(z, p); // true

// more standard types
const m = {a: new Map(), b: Buffer.from([99, 98, 97])};
m.a.set('a', [Symbol(), new Set([1, 2, 3])]);
m.a.set('b', [/^abc/i, new Date()]);
const n = clone(m);
equal(m, n); // true

// advanced: symbols
const s = Symbol(),
  t = {[s]: 42, [Symbol.for('deep6')]: 33},
  u = {[s]: 42, [Symbol.for('deep6')]: 33},
  v = clone(u, {symbols: true});
equal(t, u, {symbols: true}); // true
equal(t, v, {symbols: true}); // true

// advanced: clone non-enumerable properties
const r = {a: 1};
Object.defineProperty(r, 'b', {value: 2, enumerable: false});
const q = clone(r, {allProps: true});
r === q; // false
equal(r, {a: 1}); // true
equal(r, {a: 1, b: 2}); // false
r.a === q.a; // true
r.b === q.b; // true
```

## Docs

All pertinent information is in the [wiki](https://github.com/uhop/deep6/wiki).

## Installation and use

```bash
npm install --save deep6
```

```js
// ES6 modules
import equal, {clone} from 'deep6';
import matchString from 'deep6/unifiers/matchString';
```

```js
// CommonJS module
const {equal, clone} = require('deep6');
const matchString = require('deep6/unifiers/matchString');
```

## License

BSD-3-Clause

## Release History

- 1.2.1 _AI-friendliness: added shippable `use-deep6` skill, `bugs`/`homepage`/`llms`/`llmsFull` fields in `package.json`, ship `AGENTS.md` and `ARCHITECTURE.md` to npm._
- 1.2.0 _added `URL` support, bug fixes (RegExp flag comparison, Map assembly/deref, `env.ensure()`), performance optimizations, improved TypeScript typings, expanded tests (~573)._
- 1.1.4 _updated dev deps._
- 1.1.3 _updated dev deps._
- 1.1.2 _updated dev deps._
- 1.1.1 _reformulated `any` as a well-known symbol._
- 1.1.0 _separated from [yopl](https://npmjs.org/package/yopl), extensive refactoring._
- 1.0.1 _added the exports statement._
- 1.0.0 _the first 1.0 release._
