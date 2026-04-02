---
name: write-tests
description: Write or update tests for a module or feature. Use when asked to write tests, add test coverage, or verify functionality for deep6.
---

# Write Tests for deep6

Write or update tests for the deep6 library.

## Steps

1. Identify the module or feature to test. Read its source code to understand the public API.
2. Check existing tests in `tests/tests.js` for deep6 conventions and patterns.
3. Add tests to `tests/tests.js`:
   - Import the module under test with relative paths: `import {equal, clone} from '../src/index.js';`
   - Test normal operation, edge cases, and circular references.
   - Use plain assertions or a simple test framework.
4. Run tests to verify: `npm test`
5. Report results and any failures.

## deep6 conventions

- All tests are in `tests/tests.js`.
- Import using ES6 modules: `import {equal, clone, match, any} from '../src/index.js';`
- Test deep equality, pattern matching, and cloning.
- Test circular reference handling.
- Test with various types: objects, arrays, Map, Set, Date, RegExp, typed arrays.
- Tests should cover both success and failure cases.
