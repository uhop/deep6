---
name: write-tests
description: Write or update tests for a module or feature. Use when asked to write tests, add test coverage, or verify functionality for deep6.
---

# Write Tests for deep6

Write or update tests for the deep6 library.

## Steps

1. Identify the module or feature to test. Read its source code to understand the public API.
2. Choose the appropriate test file based on what you're testing:
   - `tests/test-env.js` — Env class, Variable, aliases, push/pop/revert
   - `tests/test-unify.js` — Core unification (primitives, arrays, objects, variables, circular, flags)
   - `tests/test-match.js` — Pattern matching (open, soft, preprocess)
   - `tests/test-registry.js` — Type registries (Date, RegExp, typed arrays, Set, Map, filters)
   - `tests/test-unifiers.js` — matchString, matchTypeOf, matchInstanceOf, matchCondition, ref
   - `tests/test-traverse.js` — walk, clone, assemble, deref
   - `tests/test-index.js` — Main API (equal, match, clone, isShape), replaceVars
3. Add test functions to the exported array in the chosen file.
4. Run tests to verify: `npm test`
5. Report results and any failures.

## Test harness

Tests use a custom harness in `tests/harness.js`. Each test file imports `submit` and `TEST`, exports a default array of test functions:

```js
import unify from '../src/unify.js';
import {submit, TEST} from './harness.js';

export default [
  function test_my_feature() {
    eval(TEST('unify(1, 1)'));
    eval(TEST('!unify(1, 2)'));

    let result = unify({a: 1}, {a: 1});
    eval(TEST('result'));
  }
];
```

## Conventions

- Import source modules with relative paths: `import {equal} from '../src/index.js';`
- Import `{submit, TEST}` from `./harness.js`.
- Use `eval(TEST('expression'))` for assertions — the expression is both the test and the message.
- Name test functions `test_descriptive_name`.
- Test both success and failure cases.
- Test with various types: objects, arrays, Map, Set, Date, RegExp, typed arrays.
- Test circular reference handling where applicable.
