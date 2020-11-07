# deep6 [![NPM version][npm-image]][npm-url]

[npm-image]:      https://img.shields.io/npm/v/deep6.svg
[npm-url]:        https://npmjs.org/package/deep6

`deep6` is a no-dependency ES6 mini-library:

* Advanced deep equivalency for JavaScript structures.
  * Extensible to accommodate custom objects.
* Traversing objects.
  * Extensible deep cloning.
* Written in ES6:
  * Use it in Node or browsers without transpiling.
  * Natively supports `Map`, `Set`, typed arrays.
  * Natively supports symbols and property descriptors.
  * Provides CommonJS modules for convenience.
* Unification.
  * Identifying and capturing object fragments.
* Efficient non-recursive algorithms.
  * ~500 tests to ensure correctness.

## Intro

TBD

## Docs

All pertinent information is in the wiki.

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
// CommonJS modules
const {equal, clone} = require('deep6/cjs');
const matchString = require('deep6/cjs/unifiers/matchString').default;
```

## Release History

- 1.1.0 *separated from [yopl](https://npmjs.org/package/yopl), extensive refactoring.*
- 1.0.1 *added the exports statement.*
- 1.0.0 *the first 1.0 release.*
