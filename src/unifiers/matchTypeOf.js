import {Unifier, isVariable} from '../env.js';

class MatchTypeOf extends Unifier {
  constructor(types) {
    super();
    this.types = types instanceof Array ? types : [types];
  }

  unify(val, ls, rs) {
    return !isVariable(val) && this.types.indexOf(typeof val) >= 0;
  }
}

const matchTypeOf = types => new MatchTypeOf(types);

export default matchTypeOf;
