import unify from '../main.js';

class Match extends unify.Unifier {
  constructor(f) {
    super();
    this.f = f;
  }

  unify(val, ls, rs, env) {
    return this.f(val, ls, rs, env);
  }
}

const match = f => new Match(f);

export default match;
