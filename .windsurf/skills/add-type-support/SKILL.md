---
name: add-type-support
description: Add support for a new type to unify and clone registries. Use when asked to support a new JavaScript type or custom class in deep6.
---

# Add Type Support to deep6

Add support for a new type to the unification and cloning registries.

## Steps

1. **Identify the type** — Determine what type needs support (built-in or custom class).

2. **Read existing patterns** — Check `src/unify.js` and `src/traverse/clone.js` for how similar types are handled.

3. **Add unifier to `src/unify.js`**:
   - Create a comparison function: `(l, r, ls, rs, env) => boolean`
   - Return `true` for match, `false` for failure
   - Push child values to `ls`/`rs` for recursive comparison
   - Add to registry: `registry.push(Type, compareFunction)`

4. **Add cloner to `src/traverse/clone.js`**:
   - Create a processor function: `(val, context) => void`
   - Push cloned value to `context.stackOut`
   - Add to registry: `registry.push(Type, processorFunction)`

5. **Add tests in `tests/tests.js`**:
   - Test equality with `equal()`
   - Test cloning with `clone()`
   - Test edge cases

6. **Run tests**: `npm test`

7. **Update documentation**:
   - Add to `llms.txt` and `llms-full.txt`
   - Update `ARCHITECTURE.md` if needed

## Example: Adding Date Support

**Unifier** (`src/unify.js`):

```js
registry.push(Date, (l, r) => l instanceof Date && r instanceof Date && l.getTime() == r.getTime());
```

**Cloner** (`src/traverse/clone.js`):

```js
registry.push(Date, (val, context) => context.stackOut.push(new Date(val.getTime())));
```

## Example: Adding Set Support

**Unifier** (`src/unify.js`):

```js
const unifySet = (l, r, ls, rs, env) => {
  if (!(l instanceof Set) || !(r instanceof Set) || l.size != r.size) return false;
  for (const item of l) {
    if (!r.has(item)) return false;
  }
  return true;
};
registry.push(Set, unifySet);
```

**Cloner** (`src/traverse/clone.js`):

```js
registry.push(Set, (val, context) => context.stackOut.push(new Set(val)));
```

## Typed Arrays Pattern

For typed arrays, use a factory function:

```js
const unifyTypedArrays = Type => (l, r, ls, rs, env) => {
  if (!(l instanceof Type) || !(r instanceof Type) || l.length != r.length) return false;
  for (let i = 0; i < l.length; ++i) {
    if (l[i] != r[i]) return false;
  }
  return true;
};

typeof Int8Array == 'function' && addType(Int8Array);
```

## Custom Class Pattern

For custom classes, extend `Unifier`:

```js
import {Unifier} from 'deep6/env.js';

class MyClassMatcher extends Unifier {
  unify(val, ls, rs, env) {
    if (!(val instanceof MyClass)) return false;
    // Compare properties
    ls.push(this.value);
    rs.push(val.value);
    return true;
  }
}
```

## Conventions

- Keep comparison functions concise
- Handle edge cases (null, undefined, wrong type)
- Use `instanceof` for type checking
- Push child values to stacks for deep comparison
- Follow existing code style (2-space indent, semicolons required)
