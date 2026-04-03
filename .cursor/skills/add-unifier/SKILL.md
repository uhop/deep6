---
name: add-unifier
description: Add a new unifier module to deep6. Use when asked to create custom pattern matching logic or extend unification behavior.
---

# Add a New Unifier

Create a new unifier that extends deep6's pattern matching capabilities.

## Steps

1. **Create the unifier file** at `src/unifiers/foo.js`:
   - Import `Unifier` from `../env.js`
   - Create a class extending `Unifier`
   - Implement the `unify(val, ls, rs, env)` method
   - Export a factory function and the class

2. **Example structure**:
   ```js
   import {Unifier, isVariable} from '../env.js';

   class MyUnifier extends Unifier {
     constructor(options) {
       super();
       this.options = options;
     }

     unify(val, ls, rs, env) {
       // Return true for match, false for failure
       // Push to ls/rs to continue unification with sub-values
       if (isVariable(val)) return false;
       // Your matching logic here
       return true;
     }
   }

   const myUnifier = options => new MyUnifier(options);

   export {MyUnifier};
   export default myUnifier;
   ```

3. **Add tests** in `tests/tests.js`:
   - Import the unifier: `import myUnifier from '../src/unifiers/myUnifier.js';`
   - Test matching success cases
   - Test matching failure cases
   - Test with variables and wildcards

4. **Run tests**: `npm test`

5. **Create wiki documentation** at `wiki/myUnifier.md`:
   - Description and use cases
   - API reference
   - Usage examples

6. **Update `wiki/Home.md`** — Add link under Unifiers section

7. **Update `ARCHITECTURE.md`**:
   - Add to project layout tree
   - Add to dependency graph
   - Add to unifier list

8. **Update `llms.txt` and `llms-full.txt`**:
   - Add unifier to API reference
   - Include example usage

9. **Verify**: `npm test`

## Unifier Conventions

- Class name: PascalCase (e.g., `MatchString`, `MyUnifier`)
- Factory function: camelCase (e.g., `matchString`, `myUnifier`)
- File name: camelCase (e.g., `matchString.js`, `myUnifier.js`)
- Extend `Unifier` class from `env.js`
- Implement `unify(val, ls, rs, env)` method
- Return `true` for success, `false` for failure
- Use `ls.push()` and `rs.push()` to queue sub-value comparisons
- Check for `isVariable(val)` if variables should not match directly

## Key Patterns

### Simple predicate
```js
unify(val, ls, rs, env) {
  return typeof val === 'number' && val > 0;
}
```

### Capture values
```js
unify(val, ls, rs, env) {
  ls.push(this.capture);
  rs.push(val);
  return true;
}
```

### Delegate to unification
```js
unify(val, ls, rs, env) {
  ls.push(this.pattern);
  rs.push(val);
  return true; // Continue unification with pushed values
}
```

## See Also

- Existing unifiers: `src/unifiers/`
- `Unifier` base class: `src/env.js`
- Unification algorithm: `src/unify.js`
