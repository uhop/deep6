# Contributing to deep6

Thank you for your interest in contributing!

## Getting started

```bash
git clone https://github.com/uhop/deep6.git
cd deep6
npm install
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the module map and dependency graph.

## Development workflow

1. Make your changes in `src/`.
2. Test: `npm test`
3. Type check: `npm run ts-check`
4. Lint: `npm run lint:fix`

## Code style

- ES6 modules (`import`/`export`) in source.
- Formatted with Prettier — see `.prettierrc` for settings.
- Zero runtime dependencies. Do not add packages to `dependencies`.

## License

This project is distributed under the [BSD-3-Clause license](./LICENSE).
External contributions are accepted only under licenses compatible with
BSD-3-Clause; submissions under fundamentally incompatible licenses cannot
be merged.

## AI agents

If you are an AI coding agent, see [AGENTS.md](./AGENTS.md) for detailed project conventions, commands, and architecture.
