# `unify()` performance analysis

Analysis of the hot path in `src/unify.js` (the main loop), focusing on the most common case: deep equality of plain objects with `circular: true` and no variables.

## Implemented

### 1. Registry fast-path for plain objects and arrays (HIGH) — DONE

Before the registry loop, check `Object.getPrototypeOf` for both values. If both are plain objects (`Object.prototype` or `null` prototype) or arrays (`Array.prototype`), skip the registry entirely. This eliminates ~34 `instanceof` checks for the overwhelmingly common case. Filters are still checked regardless.

### 3. Guard `instanceof` with `typeof` (MEDIUM) — DONE

Command, Variable (×2), Unifier (×2) checks now guarded with `typeof l == 'object'`. Primitives (number, string, boolean) skip all `instanceof` checks entirely.

### 4. Lazy `lSeen`/`rSeen` Map allocation (LOW) — DONE

Maps are created only when `circular` is enabled. Saves two Map allocations for non-circular calls.

### 5. Replace `.every()` closures with for-loops (LOW) — DONE

`objectOps.exact.exact.precheck` and `objectOps.exact.*.compare` now use plain for-loops instead of `.every()` with closures.

### 6. Remove redundant `Array.isArray` in `Wrap.unify` (LOW) — DONE

The inner `if (!Array.isArray(value))` check was dead code — the outer check already guarantees array parity. Removed.

### 7. Remove `typeof Map == 'function'` guards (LOW) — DONE

Removed guards for `Map` and `Set` in `Wrap.unify`. The library targets ES6+ where these always exist.

### 8. Replace destructuring swaps with manual swaps (LOW) — DONE

`unifyMaps`, `unifySets`, `unifyObjects` now use temp-variable swaps instead of 8-element array destructuring.

### 9. Pre-compute `unifyUint8Array` for ArrayBuffer (NEGLIGIBLE) — DONE

`unifyTypedArrays(Uint8Array)` is now pre-computed as `unifyUint8Array` instead of recreating the closure on each `unifyArrayBuffer` call.

## Remaining (not yet implemented)

### 2. `Object.assign(env, options)` pollutes hidden class (MEDIUM)

Options are merged directly onto the `Env` instance, defeating V8's hidden class optimizations. Every call with different options produces a different Env shape.

**Possible fix:** Keep options in a separate object. Requires refactoring all `env.circular`, `env.symbols` references and objectOps callbacks that use `this.e.symbols`.
