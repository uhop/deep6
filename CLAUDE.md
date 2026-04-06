# deep6 — Claude Code Project Guide

> Canonical source is [AGENTS.md](./AGENTS.md) — this file provides quick navigation to all AI documentation.

## Start Here

1. **Project Rules** → [AGENTS.md](./AGENTS.md) — Critical rules, code style, architecture quick reference
2. **Architecture** → [ARCHITECTURE.md](./ARCHITECTURE.md) — Module map, dependency graph, algorithm details
3. **Quick API** → [llms.txt](./llms.txt) — Concise API reference for LLMs
4. **Full API** → [llms-full.txt](./llms-full.txt) — Complete API reference with examples
5. **Usage** → [README.md](./README.md) — Installation and examples
6. **Codebase Quick Ref** → [CODEBASE.md](./CODEBASE.md) — One-liner, entry points, key patterns

## Workflows

Available in `.windsurf/workflows/` and `.claude/commands/`:

- **`add-module.md`** — Checklist for adding new unifiers, utilities, or traverse modules
- **`ai-docs-update.md`** — Update all AI-facing docs after API changes
- **`release-check.md`** — Pre-release verification checklist
- **`sync-ai-rules.md`** — Sync all AI agent rules files to match AGENTS.md

## Skills

Domain-specific knowledge in `.windsurf/skills/`, `.cursor/skills/`, and `.claude/commands/`:

- **`write-tests`** — How to write tests for deep6 modules
- **`add-unifier`** — How to create new unifier modules
- **`debug-unification`** — How to debug unification failures
- **`add-type-support`** — How to add support for new types to registries

## Commands

| Command         | Description                       |
| --------------- | --------------------------------- |
| `npm test`      | Run test suite (~550 tests)       |
| `npm run debug` | Debug with Node inspector         |
| `npm start`     | Run test server for browser tests |

## Project Identity

deep6 is a no-dependency ES6 mini-library for advanced deep equivalence, unification, and cloning of JavaScript structures. It supports:

- Extensible pattern matching with wildcards
- Deep cloning with circular reference handling
- Traversing complex objects (Map, Set, typed arrays, symbols, property descriptors)
- Non-recursive stack-based algorithms

## Key Conventions

- **Zero runtime dependencies** — Only devDependencies allowed
- **ES6 modules** — Use `import`/`export` syntax
- **Code style** — 2-space indent, single quotes, semicolons required (Prettier)
- **No comments** — Don't add/remove comments unless asked
- **Keep tests intact** — Don't modify test expectations without understanding

## Import Patterns

```js
// Main API
import equal, {clone, match, any, _} from 'deep6';

// Core unification
import unify, {Variable, variable, Unifier, open, soft} from 'deep6/unify.js';

// Traversal
import walk from 'deep6/traverse/walk.js';
import clone from 'deep6/traverse/clone.js';
import preprocess from 'deep6/traverse/preprocess.js';

// Unifiers
import matchString from 'deep6/unifiers/matchString.js';
import matchTypeOf from 'deep6/unifiers/matchTypeOf.js';
import matchInstanceOf from 'deep6/unifiers/matchInstanceOf.js';
import matchCondition from 'deep6/unifiers/matchCondition.js';
import ref from 'deep6/unifiers/ref.js';
```

## Claude Code Slash Commands

Available via `/project:command-name` in Claude Code:

| Command             | Description                                      |
| ------------------- | ------------------------------------------------ |
| `add-module`        | Checklist for adding new modules                 |
| `add-unifier`       | Create a new unifier module                      |
| `add-type-support`  | Add support for new types to registries          |
| `write-tests`       | Write or update tests for a module               |
| `debug-unification` | Debug unification failures                       |
| `ai-docs-update`    | Update all AI-facing docs after API changes      |
| `release-check`     | Pre-release verification checklist               |
| `sync-ai-rules`     | Sync all AI agent rules files to match AGENTS.md |

## For AI Assistants

When working on deep6:

1. Read [AGENTS.md](./AGENTS.md) first for rules and constraints
2. Consult [ARCHITECTURE.md](./ARCHITECTURE.md) for module relationships
3. Use [llms.txt](./llms.txt) for quick API lookup
4. Reference [CODEBASE.md](./CODEBASE.md) for algorithm details
5. Follow workflows in `.windsurf/workflows/` or `.claude/commands/` for common tasks
6. Run `npm test` after any code changes
