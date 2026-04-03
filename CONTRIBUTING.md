# Contributing to deep6

Thank you for your interest in contributing!

## Getting started

```bash
git clone git@github.com:uhop/deep6.git
cd deep6
npm install
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the module map and dependency graph.

## Development workflow

1. Make your changes in `src/`.
2. Test: `npm test`
3. Lint: `npm run lint:fix`

## Code style

- ES6 modules (`import`/`export`) in source.
- Formatted with Prettier — see `.prettierrc` for settings.
- Zero runtime dependencies. Do not add packages to `dependencies`.

## AI agents

If you are an AI coding agent, see [AGENTS.md](./AGENTS.md) for detailed project conventions, commands, and architecture.
