Add support for a new type to deep6's unify and clone registries: $ARGUMENTS

## Steps

1. Identify the type — built-in or custom class.

2. Read existing patterns in `src/unify.js` and `src/traverse/clone.js`.

3. Add unifier to `src/unify.js`:
   - Create comparison function: `(l, r, ls, rs, env) => boolean`
   - Return `true` for match, `false` for failure
   - Push child values to `ls`/`rs` for recursive comparison
   - Add to registry: `registry.push(Type, compareFunction)`

4. Add cloner to `src/traverse/clone.js`:
   - Create processor function: `(val, context) => void`
   - Push cloned value to `context.stackOut`
   - Add to registry: `registry.push(Type, processorFunction)`

5. Add tests in `tests/tests.js` — test `equal()`, `clone()`, and edge cases.

6. Run `npm test`.

7. Update `llms.txt` and `llms-full.txt`. Update `ARCHITECTURE.md` if needed.

## Example patterns

**Date unifier:**
```js
registry.push(Date, (l, r) => l instanceof Date && r instanceof Date && l.getTime() == r.getTime());
```

**Date cloner:**
```js
registry.push(Date, (val, context) => context.stackOut.push(new Date(val.getTime())));
```

**Custom class (extend Unifier):**
```js
import {Unifier} from 'deep6/env.js';
class MyClassMatcher extends Unifier {
  unify(val, ls, rs, env) {
    if (!(val instanceof MyClass)) return false;
    ls.push(this.value);
    rs.push(val.value);
    return true;
  }
}
```
