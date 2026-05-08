# `Env` usage statistics — yopl vs. deep6 self-tests

Captured 2026-05-08 by instrumenting `src/env.js` with counters on
`bindVal`, `bindVar`, and `collectSymbols`, then running both test
suites with `node tests/tests.js` (single process, totals aggregated
on `process.on('exit')`). yopl was pointed at the local instrumented
deep6 via `npm link`; reverted afterwards. Original `env.js` and yopl's
`node_modules/deep6` restored cleanly.

The motivating question was narrow — "how often are bindings keyed by
Symbol vs. string?" — but the run also surfaces the relative
frequency of the alias-replication path that `collectSymbols` lives
on, which matters more for the original generator-rewrite sketch in
`env-design-alternatives.md`.

**Framing.** `Env` is a general-purpose generational name/value map.
Theoretically it can be used as a true generational scope (lexical
shadowing, nested let-bindings, interpreter environments) where the
same name is `bindVal`'d at multiple non-collapsing depths and
shadowing is intentional. The current implementation is
mathematically correct and handles that. The numbers below describe
how **unify() and yopl specifically** use `Env` — not what `Env` is
required to support. Conclusions about "this code path is unused" or
"this `Set` catches nothing" apply to the **observed clients**, not
to `Env`'s contract.

The natural follow-up question is **whether to ship a specialized
`Env` variant tuned for the unify-shaped pattern**, leaving the
general `Env` intact for hypothetical generational-map clients. See
§ "Scope and the case for a specialized Env" below.

## Numbers

| Metric                                  | yopl (152 tests)   | deep6 (615 tests) |
| --------------------------------------- | ------------------ | ----------------- |
| `bindVal` total                         | **1029**           | 38                |
| `bindVal` string-named                  | 33 (3.2%)          | 30 (79%)          |
| `bindVal` **symbol-named**              | **996 (96.8%)**    | 8 (21%)           |
| `bindVar` total                         | 151                | 3                 |
| `bindVar` string × string               | 0                  | 1                 |
| `bindVar` string × symbol               | 75                 | 0                 |
| `bindVar` symbol × symbol               | 76                 | 2                 |
| `bindVal` no-alias path (`u == null`)   | 942 / 1029 = 91.5% | 37 / 38 = 97%     |
| `bindVal` with-alias path (`u != null`) | 87 / 1029 = 8.5%   | 1 / 38            |
| `collectSymbols` calls                  | 87                 | 2                 |
| `collectSymbols` empty result           | 0                  | 1                 |
| `collectSymbols` avg symbols / call     | **1.6** (139 / 87) | 1.0               |
| `u` had string keys (when `u != null`)  | 72 / 87 = 83%      | 0                 |
| `u` had symbol keys (when `u != null`)  | 87 / 87 = 100%     | 1                 |

deep6's own test suite barely exercises `Env`. tape-six's
`equal()`-only usage hits zero of this path (no Variables, no
bindings). **All Env-relevant production signal comes from
yopl-shaped workloads** — solver-internal `variable(Symbol(counter))`
proliferation in `src/solvers/{solve,gen,async,asyncGen}.js`. User-
side query goals (`v('X')`) are tiny in count compared to per-rule-
expansion solver Variables.

## Findings

1. **Symbol names dominate.** 96.8% of `bindVal` and 100% of `bindVar`
   pairs include at least one symbol-named Variable. The `for…in`
   loops in `bindVal` / `bindVar` (which walk string keys via the
   native chain walk) are mostly walking empty alias-sets in practice;
   `collectSymbols` does the actual key enumeration when the
   alias-replication path fires.

2. **The hot path is `bindVal` with no alias-set** — 91.5% of all
   bindings collapse to a single `values[name] = val`. This path
   doesn't touch `collectSymbols`. It's where the V8 hidden-class
   pollution from `Object.assign(env, options)` (queue item) costs
   real time — it's the inner-loop dominator on the `get`/`set`
   side. The `collectSymbols` rewrite question is **separate** from
   that.

3. **The alias-replication path is rare and small.** 8.5% of `bindVal`
   calls hit the `u != null` branch in yopl; when they do, `u` is
   typically _mixed_ (83% string + symbol, 17% symbol-only) and
   _tiny_ — average 1.6 symbols per `collectSymbols` call. The
   empty-result case never fires in yopl: when `collectSymbols` runs,
   it always has work to do.

4. **deep6 self-tests are not a useful workload for this question.**
   38 bindings across 615 tests; one alias-path event total; 2
   `collectSymbols` calls. Any benchmark needs to be yopl-shaped or
   synthetic-from-empirical, not driven by the deep6 test suite.

## Bench design (for nano-bench)

Two-tier so each tier answers a separate question:

### Bench A — aggregate yopl-shaped workload

Reproduce the empirical mix:

- ~1000 `bindVal` events.
- 97% symbol-named (`Symbol(counter)`), 3% string-named.
- 91.5% no-alias path, 8.5% with-alias-set.
- When alias-set present: avg 1.6 symbols + ~2 string keys, mixed.
- `push` / `pop` / `bindVar` interleaved at empirically similar
  ratios (151 `bindVar` per 1029 `bindVal` ≈ 1:7).

Measures whether the `collectSymbols` rewrite is **visible
end-to-end** on the realistic mix. Expectation: barely, because
`collectSymbols` runs on < 9% of bindings.

Variants worth running:

- Current proto-chain Env, current `collectSymbols` (Set + Array).
- Current Env, generator `collectSymbols` (per the
  `env-design-alternatives.md` § Recommendation sketch).

### Bench C — yopl symbol-named vs. string-named Variables

The 96.8% symbol-name dominance is a **yopl choice**, not a deep6
constraint. yopl's solvers all do
`vars[i] = variable(Symbol(counter++))` in `generateVariables`
(`src/solve.js`, `src/solvers/{gen,async,asyncGen}.js`). Trivially
swappable for `variable('_v' + counter++)` — one line per file, four
files.

Hypothesis: string names may be **faster end-to-end** than symbol
names, because:

- `for (const k in u)` walks string keys via the native chain walk
  (C-side, IC-friendly). Today this loop is largely walking empty
  alias-sets in yopl because the keys are symbol-only.
- `collectSymbols` would barely fire — possibly zero-call in
  practice, since alias-set keys would now be strings and walked by
  `for…in` directly.
- V8's IC for string-keyed property access on `Object.create(null)`
  chains is typically more optimized than the symbol-keyed path.

Possible counter-pressure:

- String names need to be unique across the entire run. `'_v' +
counter++` works; counter eventually generates 7-digit strings
  with measurable allocation cost vs. `Symbol()` which is a single
  GC'd primitive.
- Symbol-keyed property writes may go through a different hidden-
  class path that V8 keeps in monomorphic state longer than string-
  keyed writes when the same object accumulates many distinct keys.
  Worth verifying with `--print-opt-code` if the bench result is
  surprising.

Bench design:

- Pick a representative yopl program — recommend a small synthetic
  proof (list `append`, `member`, naive `reverse`) that exercises
  rule expansion + backtracking + alias unification.
- Two yopl branches: `master` (current symbol-named) vs. a local
  string-named variant (one-line `generateVariables` change × 4
  files).
- Same deep6 1.2.2 underneath both. Same node version. Same workload
  size, swept to surface scaling.
- Measure solve-time end-to-end with nano-bench.

Decision tree from the result:

- **String-named wins by > 5%:** the collectSymbols rewrite is
  moot for yopl. The fix is upstream — flip yopl's
  `generateVariables` to strings, file the deep6 generator change as
  a smaller secondary cleanup (or skip entirely).
- **String-named ties (± 5%):** the symbol-keyed IC is fine; the
  collectSymbols rewrite is the right downstream lever, run Benches
  A and B as planned.
- **Symbol-named wins:** keep yopl as-is; the symbol-keyed path is
  faster despite the alias-replication overhead. Run B to see if
  the collectSymbols generator change still helps the 8.5% slice.

Run C **before** A and B. It can change the entire question.

### Bench B — collectSymbols microbench

Tight loop driving only the `bindVal` with-alias path:

- Pre-build `u` of fixed shape (N symbols + M string keys, both 0–8).
- Invoke `bindVal` repeatedly into a fresh `Env` so the path is
  isolated.
- Sweep N ∈ {1, 2, 4, 8}, M ∈ {0, 2}.
- Two implementations side by side.

Measures the **per-call delta in isolation**. Tells you whether the
generator's per-yield iterator-result allocation wins or loses
against the current Set + Array allocation at the realistic
N = 1.6 size.

Run order: **C → B → A**. C may make B and A moot (if string names
win in yopl, the collectSymbols rewrite stops mattering for the
load-bearing client). B then gates A — if the generator loses or
ties at N ∈ {1, 2}, A is moot since the average yopl call has
N = 1.6 and A's signal will be swamped by the 91.5% of no-alias
bindings that are unchanged.

## Does the `Set` in `collectSymbols` earn its keep?

Second instrumentation run (2026-05-08), counting raw symbols seen
per call vs. unique symbols after dedup. The `Set` exists to dedup
the same symbol owned at multiple proto-chain frames (shadowing).

| Metric                                     | yopl   | deep6  |
| ------------------------------------------ | ------ | ------ |
| `collectSymbols` calls                     | 87     | 2      |
| Frames walked total                        | 185    | 4      |
| Raw symbols seen (all frames, all calls)   | 324    | 6      |
| `keyDepth` occurrences (filtered)          | 185    | 4      |
| Real symbols seen pre-dedup                | 139    | 2      |
| Unique symbols after dedup                 | 139    | 2      |
| **Calls where dedup caught any duplicate** | **0**  | **0**  |
| **Duplicates caught**                      | **0**  | **0**  |
| **% repeated work if `Set` removed**       | **0%** | **0%** |

**The `Set` catches zero duplicates across both workloads.** Every
real symbol is owned at exactly one proto-chain frame; nothing is
shadowed. The only thing that appears at every frame is `keyDepth`,
which is filtered out by an explicit `symbols.delete(keyDepth)` at
the end — a per-call delete, not Set dedup.

This makes structural sense: alias-set objects `u` are extended via
`ensure(u, depth)` which `Object.create`s a new frame when depth
grows. Subsequent `u[k] = 1` writes always land on the _topmost_
frame. The same key is never written at two different depths in the
same chain — `ensure`-then-write produces a layered chain where
each level holds a disjoint key set.

Frame distribution per call (yopl):

| Frames per call | Count | Real symbols / call | Unique / call |
| --------------: | ----: | ------------------: | ------------: |
|               1 |    14 |                   1 |             1 |
|               2 |    53 |                 1–2 |           1–2 |
|               3 |    15 |                 2–3 |           2–3 |
|               4 |     5 |                 3–4 |           3–4 |

54% of calls walk 2 frames; only 23% walk 3+. Per-call symbol counts
match unique counts row-for-row.

### Implications for the rewrite — scoped to unify/yopl

Within the unify-shaped usage pattern:

- The `Set` allocation + the `Array.from(symbols)` allocation are
  **both pure overhead** in the observed workloads. Dropping the
  dedup loses nothing for these clients.
- A generator that yields directly while filtering `keyDepth`
  inline produces an identical output stream **for unify-pattern
  inputs**. The duplicate-correctness question in
  `env-design-alternatives.md` § Recommendation becomes a question
  about Env's contract, not about runtime behavior on these
  workloads.
- This raises Bench A's expected upside: every `collectSymbols`
  call drops two allocations plus N dict inserts. Bench B still
  gates whether per-yield iterator-result allocation washes the win.

But importantly: **none of this means the dedup is wrong in
`Env`.** A future client that shadows the same name across
non-collapsing frames (a lexical-scope interpreter, a true
generational symbol table) needs the dedup to enumerate visible
keys correctly. `bindVal(X, v1)` at depth 3, then push to depth 5,
then `bindVal(X, v2)` at depth 5 leaves X owned at both frames; a
no-dedup `collectSymbols(values)` would enumerate X twice — once
per frame — with the same `values[X]` resolution (topmost), but
duplicate entries from `getAllValues` and a duplicated overwrite
sequence in `bindVal`'s inner replication loop (idempotent, so
correct, but wasted work that scales with shadow depth).

unify() avoids that situation structurally: `Variable.unify`
short-circuits via `if (this.name in env.values)` before calling
`bindVal` a second time on an already-bound variable. So a real-
shadowing case can't arise from unification. A different client
makes no such guarantee.

The right framing of the rewrite is not "drop the `Set` from `Env`"
but **"specialize `Env` for the no-shadowing pattern that
unify/yopl exhibit, and leave the general `Env` for clients that
need shadowing."** See next section.

## Scope and the case for a specialized `Env`

`Env` today is one implementation serving two very different theoretical
audiences:

1. **Unification clients** (unify(), yopl, tape-six via equal()): each
   variable is bound at most once per frame; rebinding is short-
   circuited at the call site; pop reverts. No shadowing in practice.
2. **Generational scope clients** (hypothetical): nested scopes
   intentionally shadow the same name; `get(name)` returns the most-
   derived binding; the proto-chain walk is doing real work.

The current `Env` correctness model serves both. Its overheads
(dedup `Set`, replication of values across alias-set members in
`bindVal`, two parallel proto chains for `variables` + `values`)
are paid by both even when only audience 2 needs them.

**Proposal sketch (not a commitment):** keep the current `Env` as
the general implementation; add a specialized `EnvUnify` (or
`UnifyEnv`) tuned for audience 1. Differences could include:

- **Drop the dedup.** `collectSymbols` becomes the keyDepth-filtering
  generator from `env-design-alternatives.md` § Recommendation. Or
  remove `collectSymbols` entirely if the data model changes.
- **Standardize on the faster name kind.** Bench C decides whether
  yopl's `generateVariables` should produce strings or symbols; once
  decided, `EnvUnify` can specialize storage for that kind (e.g.,
  symbol-keyed `Map` instead of plain-object dictionaries) and drop
  the cross-kind `for…in` + `collectSymbols` split entirely.
- **Simpler `bindVar` aliasing.** Could move to DSU (Alternative A
  in `env-design-alternatives.md`), trading O(α) `find` per lookup
  for O(0) `bindVar` and no value replication.
- **Single proto chain.** The `variables`/`values` split exists for
  bookkeeping clarity; tagged entries in one chain (or one `Map`
  per frame) halve the frame allocations and simplify `pop`.
- **Smaller `getAllValues`.** No-shadowing means a flat enumerate
  without dedup machinery.

What it would NOT change:

- `unify()`'s public surface — `EnvUnify` would be the default Env
  constructed inside `unify()`; user-supplied `Env` instances
  continue working with the general implementation.
- `Variable.unify` — the binding API is the same.
- The general `Env` exported from `env.js` — still available, still
  the correct shadowing-capable implementation, still the
  documented type.

Cost of carrying two implementations:

- Duplicate code surface, duplicate test surface, duplicate
  documentation. Mitigated if `EnvUnify` extends `Env` or shares a
  base.
- Risk of subtle behavior divergence. Mitigated by a shared test
  suite that runs the unify-pattern subset against both.
- Decision tree at construction: who picks which? Default is
  `EnvUnify` for `unify()`-internal use; user-constructed `Env` is
  the general one. Single rule, no per-call branching.

**Sequence to validate the case:**

1. Run Bench C → settle the symbol-vs-string question for yopl.
2. Run Bench A and B on the current `Env` → measure how much
   `collectSymbols` rewrite alone buys.
3. Prototype `EnvUnify` with the chosen specializations → measure
   against the same workloads.
4. Decide whether the gap between (2) and (3) is large enough to
   justify two implementations.

If (3) is only marginally better than (2), ship the in-place
`Env` rewrite (generator `collectSymbols` + name-kind alignment in
yopl) and skip the second class. If (3) is materially better
(say > 15% on the realistic yopl-shape workload), the second
class earns its keep.

This whole question is downstream of measurement. Don't ship two
implementations on theory.

## Adjacent observations worth keeping

- **Symbol-property IC is the dominant lookup story.** 96.8% of
  `values[name]` reads (counted indirectly via the `bindVal` shape
  histogram — `values[name] = val` is the symmetric write) hit the
  symbol-keyed property IC, not the string-keyed one. Any future
  Env redesign should benchmark with symbol-keyed names dominating,
  not strings.

- **`for…in` on `u` is mostly empty.** 17% of with-`u` cases had no
  string keys at all (`u` was symbol-only). The `for (const k in u)`
  loop is doing zero useful work in those, but it's also paying near-
  nothing — the `for…in` machinery walks the chain in C and finds
  nothing. Not worth optimizing.

- **`collectSymbols(u2)` in `bindVar`** ran 0 times in yopl (the
  87 calls all came from `bindVal`). yopl's `bindVar` always hit the
  fresh-pair branch (`u1 == null && u2 == null` → 93/151) or the
  one-side-fresh branch (`u2 == null && u1 != null` or vice versa,
  58/151). The both-have-alias-set merge never fired. May change
  with different rule shapes; flag for future runs.

- **`bindValAliasU.uStrKeys` < `bindValAliasU.withU`** (72 < 87): 15
  of the 87 with-`u` events had `u` containing only symbols, no
  strings. Consistent with the symbol-dominant Variable pool — when
  a user-side `v('X')` doesn't get into the alias-set, the set is
  pure-symbol.

## Methodology notes (for repro)

- Instrumentation patched `collectSymbols` (entry / yield / empty
  counters), `bindVal` (name-type bucket; `u` shape on with-`u`
  branch), and `bindVar` (name-type pair bucket; `u1`/`u2` presence
  bucket).
- `process.on('exit', …)` printed the JSON stats block to stderr.
- Both test suites run as a single Node process per `package.json`
  scripts → no aggregation across processes needed.
- `npm link` from deep6 → `npm link deep6` from yopl → run yopl
  tests → the link path means yopl's solvers import the instrumented
  source directly. Cleanup: `npm rm -g deep6` (the link that
  replaces the global registration), `npm install deep6@1.2.2` from
  yopl (npm install alone won't restore once the link is gone), then
  revert any package.json reordering.
- Backup `env.js` to `/tmp/` before patching; `md5sum` against the
  backup after restoring to confirm byte-identical recovery.
