Create a new unifier module for deep6: $ARGUMENTS

## Steps

1. Create `src/unifiers/$ARGUMENTS.js`:
   - Import `Unifier` from `../env.js`
   - Create a class extending `Unifier`
   - Implement `unify(val, ls, rs, env)` — return `true` for match, `false` for failure
   - Export a factory function (camelCase) and the class (PascalCase)

2. Example structure:

```js
import {Unifier, isVariable} from '../env.js';

class MyUnifier extends Unifier {
  constructor(options) {
    super();
    this.options = options;
  }

  unify(val, ls, rs, env) {
    if (isVariable(val)) return false;
    // Your matching logic here
    return true;
  }
}

const myUnifier = options => new MyUnifier(options);

export {MyUnifier};
export default myUnifier;
```

3. Add tests in `tests/tests.js` — test success, failure, and interaction with variables/wildcards.
4. Run `npm test`.
5. Create wiki documentation at `wiki/$ARGUMENTS.md`.
6. Update `wiki/Home.md` — add link under Unifiers section.
7. Update `ARCHITECTURE.md` — project layout, dependency graph, unifier list.
8. Update `llms.txt` and `llms-full.txt` with API reference and example.
9. Run `npm test` again.
