// Env

const keyDepth = Symbol('depth');

export class Env {
  constructor() {
    this.variables = Object.create(null);
    this.values = Object.create(null);
    this.depth = 0;
  }
  push() {
    this.variables = Object.create(this.variables);
    this.values = Object.create(this.values);
    ++this.depth;
  }
  pop() {
    if (this.depth < 1) throw new Error('attempt to pop a frame with empty stack');
    this.variables = Object.getPrototypeOf(this.variables);
    this.values = Object.getPrototypeOf(this.values);
  }
  bindVar(name1, name2) {
    const vars = this.variables,
      depth = this.depth;
    let u = vars[name1];
    if (u) {
      if (u[keyDepth] !== depth) {
        u = Object.create(u);
        u[keyDepth] = depth;
      }
      if (name2 in vars) {
        Object.keys(vars[name2]).forEach(k => ((vars[k] = u), (u[k] = 1)));
      } else {
        vars[name2] = u;
        u[name2] = 1;
      }
    } else {
      u = vars[name2];
      if (u) {
        if (u[keyDepth] !== depth) {
          u = Object.create(u);
          u[keyDepth] = depth;
        }
        vars[name1] = u;
        u[name1] = 1;
      } else {
        u = Object.create(null);
        u[keyDepth] = depth;
        vars[name1] = vars[name2] = u;
        u[name1] = u[name2] = 1;
      }
    }
  }
  bindVal(name, val) {
    if (name in this.variables) {
      const vars = this.variables,
        values = this.values;
      Object.keys(vars[name]).forEach(k => ((values[k] = val), (vars[k] = null)));
    } else {
      this.values[name] = val;
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
    this.name = name || 'var_' + Var.counter++;
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
Var.counter = 0;

export const isVariable = x => x instanceof Var;

export const variable = name => new Var(name);
