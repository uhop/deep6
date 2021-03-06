import {Unifier, isVariable} from '../env.js';

class MatchInstanceOf extends Unifier {
  constructor(types) {
    super();
    this.types = types instanceof Array ? types : [types];
  }

  unify(val, ls, rs) {
    return val && !isVariable(val) && this.types.some(type => val instanceof type);
  }
}

const matchInstanceOf = types => new MatchInstanceOf(types);

export default matchInstanceOf;
