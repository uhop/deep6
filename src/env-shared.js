// @ts-self-types="./env-shared.d.ts"
// Shared primitives for Env implementations: Unifier, Variable, wildcards.
// Implementation-agnostic — these only use the Env method API.

class Unifier {}

const isUnifier = x => x instanceof Unifier;

// Unifier should define a method:
// unify(val, ls, rs, env):
// val is a value we are unifying with
// ls is a stack of left arguments
// rs is a stack of right arguments corresponding to ls
// env is an environment
// the result should be true/false for success/failure

const _ = Symbol.for('deep6.any'),
  any = _;

class Variable extends Unifier {
  constructor(name) {
    super();
    this.name = name || Symbol();
  }
  isBound(env) {
    return env.isBound(this.name);
  }
  isAlias(name, env) {
    return env.isAlias(name instanceof Variable ? name.name : name, this.name);
  }
  get(env) {
    return env.get(this.name);
  }
  unify(val, ls, rs, env) {
    if (env.isBound(this.name)) {
      ls.push(env.get(this.name));
      rs.push(val);
      return true;
    }
    if (val === _ || val === this) return true;
    if (val instanceof Variable) {
      if (env.isBound(val.name)) {
        env.bindVal(this.name, env.get(val.name));
        return true;
      }
      env.bindVar(this.name, val.name);
      return true;
    }
    env.bindVal(this.name, val);
    return true;
  }
}

const isVariable = x => x instanceof Variable,
  variable = name => new Variable(name);

export {Unifier, isUnifier, Variable, variable, isVariable, _, any};
