import unify from '../unify.js';

class MatchTypeOf extends unify.Unifier {
  constructor(types) {
    super();
    this.types = types instanceof Array ? types : [types];
  }

  unify(val, ls, rs) {
    return !unify.isVariable(val) && this.types.indexOf(typeof val) >= 0;
  }
}

const matchTypeOf = types => new MatchTypeOf(types);

export default matchTypeOf;
