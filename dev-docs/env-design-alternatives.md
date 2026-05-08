# `Env` design — critique and alternatives

`src/env.js` implements a generational name/value map via prototypal
inheritance: each push frame is an `Object.create`-rooted plain object
marked with the `keyDepth` symbol; `ensure()` walks up the chain to the
current depth; `bindVar` shares an alias-set object across names;
`bindVal` collapses the set via `for…in` over own + inherited keys.

This document is an honest critique with two alternative designs and a
tradeoff table. Skipping the "prototype poisoning" angle entirely — it
isn't the actual cost.

## Critique of the current design

The design is correct and tight on `push`. The places where it pays a
non-obvious cost:

1. **`bindVar` copies the alias set, O(\|set\|) per merge.** When two
   big alias sets union, every name in one is rewritten into the other
   (`vars[k] = u1; u1[k] = 1`). DSU would do this in one pointer write.
   For unification of small structures it's negligible; for highly
   aliased patterns (e.g. a variable that appears in N positions and
   gets unified with another N-position variable) it's quadratic-ish in
   the alias-set product. Not a refactor concern unless the workload
   actually shows it.

2. **`bindVal` also copies O(\|set\|).** Setting `values[k] = val` for
   every `k` in `u` is the symmetric cost. Pays back at lookup time
   though — see below.

3. **Two parallel proto chains** (`variables` and `values`) doubled-up
   on `keyDepth`-marked frames. `pop()` walks both. `ensure()` runs
   against both on `bindVal`. One unified chain with tagged entries
   (`{ref:u}` vs `{val:v}`) would halve the frame allocations. The
   two-chain split makes `bindVal` slightly cleaner (clear
   `vars[k] = null` while writing `values[k] = val`) but it's not
   load-bearing — a tagged-entry rewrite would be ~10 fewer lines.

4. **`collectSymbols` allocates a `Set` and an `Array` on every call.**
   Called inside `bindVar`, `bindVal`, and `getAllValues`. In hot
   unification this is paid per binding event. Could be a generator
   (no allocation) or inlined.

5. **Engine deopt risk.** Dynamic property addition + `Object.create(null)`
   chains push the value-objects into V8's "dictionary mode" — slower
   property lookup, no inline-cache hits. The cost is a constant factor
   (typically 2–5×) on `values[name]`. For unification this lookup is
   the inner-loop dominator. **This is the biggest single cost** and
   it's invisible from the source — visible only under
   `--print-opt-code`.

What the current design gains in return is real: O(1) `push`, O(0)
`pop` when the popped frame had no writes, O(1) lookup by native
chain walk, no journal allocations, and trivial `revert` to arbitrary
depth. The cost-benefit only goes upside-down if (a) lookups dominate
so heavily that even a 2× constant matters, (b) alias-set merges
become large, or (c) line count is the goal.

## Alternative A — Rollback DSU + flat Maps + thunked journal

Single source of truth: two `Map`s (one for parent, one for value)
plus a thunk-based undo journal indexed by frame.

```js
const _ = Symbol.for('deep6.any'),
  any = _;

class Env {
  constructor() {
    this.parent = new Map(); // name → parent (absent ⇒ root, value-of-self)
    this.values = new Map(); // root → value
    this.journal = []; // stack of undo thunks
    this.frames = []; // journal-length at each frame boundary
    this.depth = 0;
  }
  push() {
    this.frames.push(this.journal.length);
    ++this.depth;
  }
  pop() {
    if (!this.frames.length) throw new Error('empty stack');
    const target = this.frames.pop();
    while (this.journal.length > target) this.journal.pop()();
    --this.depth;
  }
  revert(d) {
    while (this.depth > d) this.pop();
  }
  find(name) {
    let r = name;
    while (this.parent.has(r)) r = this.parent.get(r);
    return r;
  }
  isBound(name) {
    return this.values.has(this.find(name));
  }
  isAlias(a, b) {
    return this.find(a) === this.find(b);
  }
  get(name) {
    return this.values.get(this.find(name));
  }
  bindVal(name, val) {
    const r = this.find(name);
    const had = this.values.has(r),
      old = this.values.get(r);
    this.values.set(r, val);
    this.journal.push(() => (had ? this.values.set(r, old) : this.values.delete(r)));
  }
  bindVar(a, b) {
    const ra = this.find(a),
      rb = this.find(b);
    if (ra === rb) return;
    const aHad = this.values.has(ra),
      aVal = this.values.get(ra);
    const bHad = this.values.has(rb),
      bVal = this.values.get(rb);
    this.parent.set(ra, rb);
    if (aHad && !bHad) this.values.set(rb, aVal);
    if (aHad) this.values.delete(ra);
    this.journal.push(() => {
      this.parent.delete(ra);
      if (aHad) this.values.set(ra, aVal);
      else this.values.delete(ra);
      if (bHad) this.values.set(rb, bVal);
      else this.values.delete(rb);
    });
  }
  *entries() {
    // freshest visible name → value
    for (const name of this.parent.keys()) if (this.values.has(this.find(name))) yield [name, this.get(name)];
    for (const root of this.values.keys()) if (!this.parent.has(root)) yield [root, this.values.get(root)];
  }
}
```

About **60 lines** vs the current ~140.

### Pros

- Smaller. ~40% line reduction.
- Engine-friendly: `Map` is well optimized, no proto-chain shape
  morphing, no dictionary-mode deopt on `values`.
- DSU `bindVar` is O(α(n)) per call, not O(\|set\|). For pathological
  alias-heavy patterns this is asymptotically better.
- No replication of value across all alias names at bind time — the
  value lives at the root only.

### Cons

- **Lookup is now O(tree-height)** vs current O(1) (well,
  O(proto-chain-walk-in-C), which is "effectively O(1)" until V8
  deopts). For shallow alias trees (1–2 levels, the common case) this
  is fine. For deep ones it loses.
- **Journal allocations on every write.** A closure thunk per
  `bindVal` and per `bindVar`. GC pressure scales with unification
  work, not with frame depth. Mitigation: replace thunks with
  `[opCode, ...args]` arrays — uglier code, less allocation. ~20
  extra lines.
- **Pop is O(mutations-in-frame)**, not O(0). The current design pays
  nothing for a no-write push/pop pair; this design still pays the
  `frames.push`/`pop` overhead but that's a number, so still cheap.
  Mutated frames trigger N undo calls.
- **Iteration is more work.** Current `for…in env.values` walks the
  chain in C. The DSU design iterates `parent.keys()` and resolves
  each — same O(n) but with JS-side `find()` calls.
- **No path compression** because compression mutates the parent
  links and would need its own journal entries. Adding rank-based
  union (to bound `find` at O(log n)) is one extra Map plus one
  extra journal entry per union — small but not free.

## Alternative B — Linked-list frames with per-frame `Map`

```js
class Frame {
  constructor(parent) {
    this.parent = parent;
    this.values = null; // Map<name, val>, lazy
    this.aliases = null; // Map<name, root>, lazy — for bindVar
    this.depth = parent ? parent.depth + 1 : 0;
  }
}

class Env {
  constructor() {
    this.top = new Frame(null);
  }
  push() {
    this.top = new Frame(this.top);
  }
  pop() {
    if (!this.top.parent) throw new Error('empty stack');
    this.top = this.top.parent;
  }
  get(name) {
    for (let f = this.top; f; f = f.parent) if (f.values && f.values.has(name)) return f.values.get(name);
    return undefined;
  }
  bindVal(name, val) {
    (this.top.values ??= new Map()).set(name, val);
  }
  // bindVar: similar walk; aliases per frame; merge on resolution
}
```

### Pros

- Conceptually the cleanest — frames are objects, push/pop is pointer
  manipulation.
- No journaling: pop = drop pointer.
- Per-frame `Map`s are V8-friendly.
- Smallest code if aliasing is dropped or made eager-substitution.

### Cons

- **Lookup is O(frames)** — walks every frame asking "do you have
  this name". For unification with deep recursion (≈ structure depth),
  this dominates. Memoizing top-of-stack hot names is possible but
  adds code.
- Eager `Frame` allocation per push (~80 bytes) even if frame ends up
  empty. For push-heavy / write-light workloads this is worse than
  current.
- Aliasing across frames is genuinely awkward: when `bindVar(a, b)`
  happens in frame 5, then `bindVal(a, …)` in frame 7, the binding has
  to be visible from `b`'s lookup too. Either replicate (current
  design's choice, frame-local), or do DSU (Alternative A's choice),
  or walk frames and collect alias unions (slow). No clean
  "linked-list of frames with native aliasing".

## Tradeoff table

| Op                  | Current (proto-chain)                      | Alt A (DSU + journal)                         | Alt B (frame list + Map)               |
| ------------------- | ------------------------------------------ | --------------------------------------------- | -------------------------------------- |
| push                | `++depth` (O(1), no alloc)                 | array push of int (O(1), 1 slot)              | `new Frame()` (O(1), small alloc)      |
| pop empty frame     | O(0) — chain not extended                  | O(1) — `frames.pop()`                         | O(1) — pointer set                     |
| pop with N writes   | O(chain-len since target) ≈ O(1) typical   | O(N) thunk calls                              | O(0) — pointer set, writes lost via GC |
| bindVal             | O(\|alias-set\|) replication into `values` | O(α) find + O(1) set + journal alloc          | O(1) `Map.set` on top                  |
| bindVar             | O(\|smaller-set\|) member copy             | O(α) find + O(1) `parent.set` + journal alloc | depends on alias strategy chosen       |
| get                 | O(1) native lookup; deopts to dict-mode    | O(α) find + O(1) `Map.get`                    | **O(frames)** worst case               |
| isAlias             | O(1)                                       | O(α) two finds                                | O(frames)                              |
| iterate freshest    | `for…in` + `collectSymbols` (allocates)    | `parent.keys()` + `values.keys()`             | walk frames, dedupe (allocates Set)    |
| revert(d)           | O(chain-len) on both chains                | O(N-mutations) thunks                         | O(d-difference) pointer hops           |
| code size           | ~140 lines                                 | ~60 lines                                     | ~50 lines without aliasing; ~100 with  |
| engine optimization | dict-mode after enough mutations           | hidden-class stable                           | hidden-class stable                    |
| GC pressure         | bounded by frames alive                    | scales with mutation count                    | bounded by frames + per-frame Maps     |

## Recommendation

**Don't refactor unless there's a measured problem.** The current
design is genuinely tight on push and gets free correctness for
revert. The two specific changes worth doing without a full rewrite:

1. **Replace `collectSymbols`'s `Set` allocation with a generator** —
   `function* (object)` that yields symbols on the fly. No `Set`, no
   `Array.from`. Drop-in at every call site (consumers do
   `forEach` / `for…of`). Saves an alloc per binding event. ~5 lines
   changed.

2. **Inline the alias-set membership marker as a `Set`-by-reference
   rather than a `{[name]: 1}` plain-object-with-`keyDepth`**. The
   plain-object form is what forces `ensure(u, depth)` and the second
   proto chain inside `u`. A frozen `Set` per alias group with
   copy-on-merge would simplify `bindVar` and remove the `u`-level
   proto chain — at the cost of journaling the Set replacement.
   Trade-off, not a win without measurement.

If a full rewrite ever happens, **Alternative A is the strongest
contender for the "smaller + faster general-case" goal** — the win
is line count and avoiding V8's dict-mode deopt on the value lookup.
The cost is journal allocations and giving up O(1) `get`. For
unification workloads, Alternative A should win on `get`-dominated
patterns and lose on `bindVal`-dominated ones; without a benchmark,
that's a coin flip.

Alternative B is interesting only if `bindVar` / aliasing is dropped
entirely (some unification implementations do that — they substitute
eagerly instead). That's a different language for the library.
