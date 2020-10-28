import unify from '../main.js';

class MatchInstanceOf extends unify.Unifier {
  constructor(types) {
    super();
    this.types = types instanceof Array ? types : [types];
  }

  unify(val, ls, rs) {
    return val && !unify.isVariable(val) && this.types.some(type => val instanceof type);
  }
}

function matchInstanceOf(types) {
  return new MatchInstanceOf(types);
}

export default matchInstanceOf;
