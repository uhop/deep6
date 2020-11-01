import {Unifier} from '../env.js';

class MatchCondition extends Unifier {
  constructor(f) {
    super();
    this.f = f;
  }

  unify(val, ls, rs, env) {
    return this.f(val, ls, rs, env);
  }
}

const matchCondition = f => new MatchCondition(f);

export default matchCondition;
