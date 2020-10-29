// Env

const keyDepth = Symbol('depth');

export class Env {
  constructor() {
    this.variables = Object.create(null);
    this.values = Object.create(null);
    this.depth = this.variables[keyDepth] = this.values[keyDepth] = 0;
  }
  push() {
    ++this.depth;
  }
  pop() {
    if (this.depth < 1) throw new Error('attempt to pop a frame with empty stack');
    --this.depth;
    if (this.variables[keyDepth] > this.depth) this.variables = Object.getPrototypeOf(this.variables);
    if (this.values[keyDepth] > this.depth) this.values = Object.getPrototypeOf(this.values);
  }
  bindVar(name1, name2) {
    const depth = this.depth;
    let vars = this.variables,
      u1 = vars[name1],
      u2 = vars[name2];
    if (vars[keyDepth] !== depth) {
      this.variables = vars = Object.create(vars);
      vars[keyDepth] = depth;
    }
    if (u1) {
      if (u1[keyDepth] !== depth) {
        u1 = Object.create(u1);
        u1[keyDepth] = depth;
      }
      if (u2) {
        Object.keys(u2).forEach(k => ((vars[k] = u), (u1[k] = 1)));
      } else {
        vars[name2] = u1;
        u1[name2] = 1;
      }
    } else {
      if (u2) {
        if (u2[keyDepth] !== depth) {
          u2 = Object.create(u);
          u2[keyDepth] = depth;
        }
        vars[name1] = u2;
        u2[name1] = 1;
      } else {
        u2 = Object.create(null);
        u2[keyDepth] = depth;
        vars[name1] = vars[name2] = u2;
        u2[name1] = u2[name2] = 1;
      }
    }
  }
  bindVal(name, val) {
    let values = this.values;
    if (values[keyDepth] !== this.depth) {
      this.values = values = Object.create(values);
      values[keyDepth] = this.depth;
    }
    if (name in this.variables) {
      const vars = this.variables;
      Object.keys(vars[name]).forEach(k => ((values[k] = val), (vars[k] = null)));
    } else {
      values[name] = val;
    }
  }
  // helpers
  isBound(name) {
    return name in env.values;
  }
  isAlias(name1, name2) {
    const u = env.variables[name2];
    return u && u[name1] === 1;
  }
  get(name) {
    return env.values[name];
  }
}

// Custom unifier

export class Unifier {}

export const isUnifier = x => x instanceof Unifier;

// Unifier should define a method:
// unify(val, ls, rs, env):
// val is a value we are unifying with
// ls is a stack of left arguments
// rs is a stack of right arguments corresponding to ls
// env is an environment
// the result should be true/false for success/failure

// AnyVar

export const _ = {};
export const any = _;

// Var

export class Var extends Unifier {
  constructor(name) {
    super();
    this.name = name || Symbol();
  }
  isBound(env) {
    return this.name in env.values;
  }
  isAlias(name, env) {
    const u = env.variables[this.name];
    return u && u[name] === 1;
  }
  get(env) {
    return env.values[this.name];
  }

  unify(val, ls, rs, env) {
    if (this.name in env.values) {
      // isBound
      ls.push(env.values[this.name]);
      rs.push(val);
      return true;
    }
    if (val === _ || val === this) return true;
    if (val instanceof Var) {
      if (val.name in env.values) {
        // isBound
        env.bindVal(this.name, env.values[val.name]);
        return true;
      }
      env.bindVar(this.name, val.name);
      return true;
    }
    env.bindVal(this.name, val);
    return true;
  }
}

export const isVariable = x => x instanceof Var;

export const variable = name => new Var(name);
