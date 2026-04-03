---
name: debug-unification
description: Debug unification failures in deep6. Use when unification returns null or produces unexpected results.
---

# Debug Unification Failures

Debug why unification failed or produced unexpected variable bindings.

## Steps

1. **Identify the failing case**
   - Read the test or code that calls `unify()` or `match()`
   - Note the left and right operands
   - Note any options passed (openObjects, circular, etc.)

2. **Understand the unification flow**
   - Read `src/unify.js` main loop (lines 309-438)
   - Key stages:
     1. Direct equality (`===`)
     2. Wildcard match (`any`/`_`)
     3. Variable binding
     4. Circular detection
     5. Custom unifiers (`Unifier` subclass)
     6. Registered types (Date, RegExp, etc.)
     7. Generic object comparison

3. **Add debug logging**
   - Temporarily add console.log in `src/unify.js` at key decision points:
     - After direct equality check
     - When variables are bound
     - When circular refs are detected
     - Before/after registry checks
   - Example: `console.log('unify pair:', {l, r, typeL: typeof l, typeR: typeof r})`

4. **Check variable bindings**
   - If using variables, check `env.getAllValues()` after unification
   - Verify variables are bound as expected
   - Check for alias conflicts

5. **Test in isolation**
   - Create a minimal reproduction in `tests/tests.js`
   - Test just the failing pair
   - Gradually add complexity

6. **Common failure modes**
   - **Type mismatch**: `typeof l != typeof r` (line 389)
   - **Missing property**: Object has different keys
   - **Circular conflict**: Same object unified with different values
   - **Registered type failure**: Date/RegExp/typed array comparison failed
   - **Function handling**: Functions compared without `ignoreFunctions: true`

7. **Fix and verify**
   - Apply the fix (code change, option adjustment, or pattern correction)
   - Run `npm test` to verify all tests pass
   - Remove debug logging

## Unification Debugging Tips

- Use `match()` with `openObjects: false` to require exact matches
- Use `open(obj)` or `soft(obj)` to control matching strictness
- Check `env.depth` to understand variable scoping
- Remember: unification is bidirectional — either side can have variables

## Tools

- `npm test` — Run full test suite
- `npm run debug` — Debug with Node inspector
- `env.getAllValues()` — Inspect variable bindings