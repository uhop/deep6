# Benchmarks

Micro-benchmarks for deep6, run with [nano-benchmark](https://www.npmjs.com/package/nano-benchmark).

## Running

```bash
npm run bench -- bench/bench-collect-symbols.js
npx nano-watch bench/bench-collect-symbols.js genSet
```

`nano-bench` runs all variants in a file and prints a comparison table with bootstrap confidence intervals. `nano-watch` streams live stats for a single variant.

Common options: `--ms` (measurement time per variant), `--samples`, `--bootstrap`, `--alpha`. See `npx nano-bench --help`.

## Conventions

- File name: `bench-<topic>.js`.
- ESM, `export default { variantA: n => {...}, variantB: n => {...} }`.
- Each variant runs `for (let i = 0; i < n; ++i) { ... }`.
- Setup outside the loop. Prevent dead-code elimination by returning the sink.
- Match deep6 prettier style (single quotes, no bracket spacing, no trailing commas, arrow parens avoided).
- `.claude/skills/{write-bench,write-watch}` are symlinks into `node_modules/nano-benchmark/skills/` — invoke them via Skill when authoring or watching benches.

## Current targets

Workload profile and findings: see [`dev-docs/env-usage-stats.md`](../dev-docs/env-usage-stats.md).

| File                       | Compares                                                     | Notes                                                                                                    |
| -------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| `bench-collect-symbols.js` | original `Array.from`, generator + `Set`, generator no-`Set` | Microbench on the alias-replication path. N=2 symbols + keyDepth, no shadowing — empirical mode in yopl. |

Pending:

- **Aggregate yopl-shape `Env` workload** — end-to-end `bindVal` / `bindVar` / `push` / `pop` mix at the empirical 97% symbol / 91.5% no-alias / 8.5% with-`u` ratios.
- **`unify()` end-to-end** — drive realistic patterns through the public surface so the deep-equality hot path (tape-six's load-bearing usage) is covered.
- **Symbol vs. string-named Variables** — would require yopl-side variants; tracked in the dev-doc as Bench C.
