Debug a unification failure in deep6: $ARGUMENTS

## Steps

1. Identify the failing case — read the test or code that calls `unify()` or `match()`. Note left/right operands and options.

2. Understand the unification flow in `src/unify.js` main loop (lines 309-438):
   1. Direct equality (`===`)
   2. Wildcard match (`any`/`_`)
   3. Variable binding
   4. Circular detection
   5. Custom unifiers (`Unifier` subclass)
   6. Registered types (Date, RegExp, etc.)
   7. Generic object comparison

3. Add temporary debug logging in `src/unify.js` at key decision points.

4. Check variable bindings — if using variables, check `env.getAllValues()` after unification.

5. Test in isolation — create a minimal reproduction in `tests/tests.js`.

6. Common failure modes:
   - **Type mismatch**: `typeof l != typeof r`
   - **Missing property**: Object has different keys
   - **Circular conflict**: Same object unified with different values
   - **Registered type failure**: Date/RegExp/typed array comparison
   - **Function handling**: Functions compared without `ignoreFunctions: true`

7. Fix and verify — apply the fix, run `npm test`, remove debug logging.

## Tips

- Use `match()` with `openObjects: false` to require exact matches.
- Use `open(obj)` or `soft(obj)` to control matching strictness.
- Check `env.depth` to understand variable scoping.
- Unification is bidirectional — either side can have variables.
