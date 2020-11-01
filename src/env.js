// Env

const keyDepth = Symbol('depth');

const collectSymbols = object => {
  const symbols = new Set();
  while (object && typeof object == 'object') {
    Object.getOwnPropertySymbols(object).forEach(symbol => symbols.add(symbol));
    object = Object.getPrototypeOf(object);
  }
  symbols.delete(keyDepth);
  return Array.from(symbols);
};

const ensure = (object, depth, readOnly) => {
  while (object[keyDepth] > depth) object = object.getPrototypeOf(object);
  if (!readOnly && object[keyDepth] < depth) {
    object = Object.create(object);
    object[keyDepth] = depth;
  }
  return object;
};

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
    if (this.depth < 1) throw new Error('attempt to pop a frame with an empty stack');
    --this.depth;
    while (this.variables[keyDepth] > this.depth) this.variables = Object.getPrototypeOf(this.variables);
    while (this.values[keyDepth] > this.depth) this.values = Object.getPrototypeOf(this.values);
  }
  revert(depth) {
    if (this.depth < depth) throw new Error('attempt to revert a stack to a higher depth');
    while (this.variables[keyDepth] > depth) this.variables = Object.getPrototypeOf(this.variables);
    while (this.values[keyDepth] > depth) this.values = Object.getPrototypeOf(this.values);
    this.depth = depth;
  }
  bindVar(name1, name2) {
    const depth = this.depth,
      vars = (this.variables = ensure(this.variables, depth));
    let u1 = vars[name1],
      u2 = vars[name2];
    u1 && (u1 = vars[name1] = ensure(u1, depth));
    u2 && (u2 = vars[name2] = ensure(u2, depth));
    if (u1) {
      if (u2) {
        for (const k in u2) {
          vars[k] = u1;
          u1[k] = 1;
        }
        collectSymbols(u2).forEach(k => ((vars[k] = u1), (u1[k] = 1)));
      } else {
        vars[name2] = u1;
        u1[name2] = 1;
      }
    } else {
      if (u2) {
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
    const depth = this.depth,
      values = (this.values = ensure(this.values, depth)),
      vars = (this.variables = ensure(this.variables, depth));
    let u = vars[name];
    u && (u = vars[name] = ensure(u, depth));
    if (u) {
      for (const k in u) {
        values[k] = val;
        vars[k] = null;
      }
      collectSymbols(u).forEach(k => ((values[k] = val), (vars[k] = null)));
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
  // debugging
  getAllValues() {
    const values = this.values,
      result = collectSymbols(values).map(k => ({name: k, value: values[k]}));
    for (const k in values) {
      result.push({name: k, value: values[k]});
    }
    return result;
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
