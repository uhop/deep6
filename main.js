// AnyVar

const _ = {};

// Env

class Env {
  constructor() {
    this.variables = {};
    this.values = {};
  }
  bindVar(name1, name2) {
    const vars = this.variables;
    if (vars.hasOwnProperty(name1)) {
      const u = vars[name1];
      if (vars.hasOwnProperty(name2)) {
        Object.keys(vars[name2]).forEach(k => ((vars[k] = u), (u[k] = 1)));
      } else {
        vars[name2] = u;
        u[name2] = 1;
      }
    } else {
      if (vars.hasOwnProperty(name2)) {
        const u = (vars[name1] = vars[name2]);
        u[name1] = 1;
      } else {
        const u = (vars[name1] = vars[name2] = {});
        u[name1] = u[name2] = 1;
      }
    }
  }
  bindVal(name, val) {
    if (this.variables.hasOwnProperty(name)) {
      Object.keys(this.variables[name]).forEach(k => (this.values[k] = val));
    } else {
      this.values[name] = val;
    }
  }
}

// Command

class Command {
  constructor(f, l, r) {
    this.f = f;
    this.l = l;
    this.r = r;
  }
}

// Custom unifier

class Unifier {}

const isUnifier = x => x && x instanceof Unifier;

// Unifier should define a method:
// unify(val, ls, rs, env):
// val is a value we are unifying with
// ls is a stack of left arguments
// rs is a stack of right arguments corresponding to ls
// env is an environment
// the result should be true/false for success/failure

// Var

let unique = 0;

class Var extends Unifier {
  constructor(name) {
    super();
    this.name = name || 'var' + unique++;
  }
  bound(env) {
    return env.values.hasOwnProperty(this.name);
  }
  alias(name, env) {
    const t = env.variables[this.name];
    return t && t[name];
  }
  get(env) {
    return env.values[this.name];
  }

  unify(val, ls, rs, env) {
    if (this.bound(env)) {
      ls.push(this.get(env));
      rs.push(val);
      return true;
    }
    // the next case is taken care of in unify() directly
    // the case of unbound variable
    //if (val === _ || val === this) return true;
    if (val instanceof Var) {
      if (val.bound(env)) {
        env.bindVal(this.name, val.get(env));
      } else {
        env.bindVar(this.name, val.name);
      }
      return true;
    }
    env.bindVal(this.name, val);
    return true;
  }
}

const isVariable = x => x && x instanceof Var;

const variable = name => new Var(name);

// type wrapper

class Wrap extends Unifier {
  constructor(type, o) {
    super();
    this.type = type;
    this.object = o;
  }
  unify(val, ls, rs, env) {
    if (this.object instanceof Array) {
      // unify arrays
      if (!val) return false;
      if (val instanceof Array) {
        // with a naked array
        return unifyObjects(this.object, this.type, this, val, env.openArrays ? 'open' : 'exact', null, ls, rs, env);
      }
      if (val instanceof Wrap) {
        // with a wrapped array
        return val.object instanceof Array && unifyObjects(this.object, this.type, this, val.object, val.type, val, ls, rs, env);
      }
      return false;
    }
    // unify objects
    if (!val || val instanceof Array) return false;
    if (val instanceof Wrap) {
      // with a wrapped object
      return !(val.object instanceof Array) && unifyObjects(this.object, this.type, this, val.object, val.type, val, ls, rs, env);
    }
    // with a naked object
    return typeof val == 'object' && unifyObjects(this.object, this.type, this, val, env.openObjects ? 'open' : 'exact', null, ls, rs, env);
  }
}

const isWrapped = o => o && o instanceof Wrap;

const open = o => new Wrap('open', o);
const isOpen = o => o && o instanceof Wrap && o.type === 'open';

const soft = o => new Wrap('soft', o);
const isSoft = o => o && o instanceof Wrap && o.type === 'soft';

const unifyDate = (l, r, ls, rs, env) => r && r instanceof Date && l.getTime() == r.getTime();
const unifyRegExp = (l, r, ls, rs, env) =>
  r && r instanceof RegExp && l.source == r.source && l.global == r.global && l.multiline == r.multiline && l.ignoreCase == r.ignoreCase;

// registry of well-known constructors
const registry = [Date, unifyDate, RegExp, unifyRegExp];
const filters = [];

const hasOwnProperty = Object.prototype.hasOwnProperty;

// unification of objects

const objectOps = {
  exact: {
    exact: {
      precheck: (l, r) => Object.keys(l).every(k => hasOwnProperty.call(r, k))
    },
    open: {},
    soft: {
      fix: function () {
        this.l.type = 'exact';
      }
    }
  },
  open: {
    open: {},
    soft: {}
  },
  soft: {
    soft: {
      update: function () {
        Object.keys(this.l).forEach(k => !hasOwnProperty.call(this.r, k) && (this.r[k] = this.l[k]));
        Object.keys(this.r).forEach(k => !hasOwnProperty.call(this.l, k) && (this.l[k] = this.r[k]));
      }
    }
  }
};
objectOps.exact.exact.compare = objectOps.exact.open.compare = objectOps.exact.soft.compare = (l, r, ls, rs) =>
  Object.keys(r).every(k => {
    if (hasOwnProperty.call(l, k)) {
      ls.push(l[k]);
      rs.push(r[k]);
      return true;
    }
    return false;
  });
objectOps.open.open.compare = objectOps.open.soft.compare = objectOps.soft.soft.compare = (l, r, ls, rs) => {
  Object.keys(r).forEach(k => {
    if (hasOwnProperty.call(l, k)) {
      ls.push(l[k]);
      rs.push(r[k]);
    }
  });
  return true;
};
objectOps.exact.soft.update = objectOps.open.soft.update = function () {
  Object.keys(this.l).forEach(k => !hasOwnProperty.call(this.r, k) && (this.r[k] = this.l[k]));
};

const unifyObjects = (l, lt, lm, r, rt, rm, ls, rs, env) => {
  if (lt > rt) {
    ([l, r] = [r, l]), ([lm, rm] = [rm, lm]), ([lt, rt] = [rt, lt]);
  }
  const ops = objectOps[lt][rt];
  if (ops.precheck && !ops.precheck(l, r)) return false;
  if (ops.fix && rm) ls.push(new Command(ops.fix, rm));
  if (ops.update) ls.push(new Command(ops.update, l, r));
  return ops.compare(l, r, ls, rs, env);
};

// unification

const unify = (l, r, env, options) => {
  env = env || new Env();
  if (options) {
    env.openObjects = options.openObjects;
    env.openArrays = options.openArrays;
  }
  const ls = [l],
    rs = [r];
  main: while (ls.length) {
    // perform a command, or extract a pair
    l = ls.pop();
    if (l && l instanceof Command) {
      l.f();
      continue;
    }
    r = rs.pop();
    // direct unity or anyvar
    if (l === r || l === _ || r === _) continue;
    // process variables (variables have priority)
    if (l instanceof Var) {
      if (l.unify(r, ls, rs, env)) continue;
      return null;
    }
    if (r instanceof Var) {
      if (r.unify(l, ls, rs, env)) continue;
      return null;
    }
    // invoke custom unifiers
    if (l instanceof Unifier) {
      if (l.unify(r, ls, rs, env)) continue;
      return null;
    }
    if (r instanceof Unifier) {
      if (r.unify(l, ls, rs, env)) continue;
      return null;
    }
    // check rough types
    if (typeof l != typeof r) return null;
    // special case: NaN
    if (typeof l == 'number' && isNaN(l) && isNaN(r)) continue;
    // cut off impossible combinations
    if ((typeof l != 'object' && typeof l != 'function') || !l || !r) return null;
    // process registered constructors
    const registry = unify.registry;
    for (let i = 0; i < registry.length; i += 2) {
      if (l instanceof registry[i] || r instanceof registry[i]) {
        if (registry[i + 1](l, r, ls, rs, env)) continue main;
        return null;
      }
    }
    // process registered filters
    const filters = unify.filters;
    for (let i = 0; i < filters.length; i += 2) {
      if (filters[i](l, r)) {
        if (filters[i + 1](l, r, ls, rs, env)) continue main;
        return null;
      }
    }
    // process naked objects and arrays
    const objectType = env.openObjects ? 'open' : 'exact';
    if (!unifyObjects(l, objectType, null, r, objectType, null, ls, rs, env)) return null;
  }
  return env;
};

// exports

unify._ = unify.any = _;
unify.registry = registry;
unify.filters = filters;
unify.Env = Env;
unify.Unifier = Unifier;
unify.Variable = Var;
unify.variable = variable;
unify.open = open;
unify.soft = soft;
unify.isUnifier = isUnifier;
unify.isVariable = isVariable;
unify.isWrapped = isWrapped;
unify.isOpen = isOpen;
unify.isSoft = isSoft;

export default unify;
