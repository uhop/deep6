import {_, Env, Variable, variable, isVariable, Unifier, isUnifier} from './env.js';

// Command

class Command {
  constructor(f, l, r) {
    this.f = f;
    this.l = l;
    this.r = r;
  }
}

// type wrapper

class Wrap extends Unifier {
  constructor(type, o) {
    super();
    this.type = type;
    this.object = o;
  }
  unify(val, ls, rs, env) {
    const isWrapped = val instanceof Wrap,
      value = isWrapped ? val.object : val;
    if (!value || typeof value != 'object' || Array.isArray(this.object) !== Array.isArray(value)) return false;
    if (Array.isArray(this.object)) {
      if (!Array.isArray(value)) return false;
      return isWrapped
        ? unifyObjects(this.object, this.type, this, val.object, val.type, val, ls, rs, env)
        : unifyObjects(this.object, this.type, this, val, env.openArrays ? 'open' : 'exact', null, ls, rs, env);
    }
    if (typeof Map == 'function' && this.object instanceof Map) {
      if (!(value instanceof Map)) return false;
      return isWrapped
        ? unifyMaps(this.object, this.type, this, val.object, val.type, val, ls, rs, env)
        : unifyMaps(this.object, this.type, this, val, env.openMaps ? 'open' : 'exact', null, ls, rs, env);
    }
    if (typeof Set == 'function' && this.object instanceof Set) {
      if (!(value instanceof Set)) return false;
      return isWrapped
        ? unifySets(this.object, this.type, this, val.object, val.type, val, ls, rs, env)
        : unifySets(this.object, this.type, this, val, env.openSets ? 'open' : 'exact', null, ls, rs, env);
    }
    return isWrapped
      ? unifyObjects(this.object, this.type, this, val.object, val.type, val, ls, rs, env)
      : unifyObjects(this.object, this.type, this, val, env.openObjects ? 'open' : 'exact', null, ls, rs, env);
  }
}

const isWrapped = o => o instanceof Wrap;

const open = o => new Wrap('open', o);
const isOpen = o => o instanceof Wrap && o.type === 'open';

const soft = o => new Wrap('soft', o);
const isSoft = o => o instanceof Wrap && o.type === 'soft';

// registry of well-known constructors and filters

const registry = [
    Date,
    (l, r) => l instanceof Date && r instanceof Date && l.getTime() == r.getTime(),
    RegExp,
    (l, r) =>
      l instanceof RegExp && r instanceof RegExp && l.source == r.source && l.global == r.global && l.multiline == r.multiline && l.ignoreCase == r.ignoreCase
  ],
  filters = [];

// possible well-known constructors

const unifyTypedArrays = Type => (l, r, ls, rs, env) => {
  if (!(l instanceof Type) || !(r instanceof Type) || l.length != r.length) return false;
  for (let i = 0; i < l.length; ++i) {
    if (l[i] != r[i]) return false;
  }
  return true;
};

const addTypedArray = Type => typeof Type == 'function' && registry.push(Type, unifyTypedArrays(Type));

addTypedArray(Int8Array);
addTypedArray(Uint8Array);
addTypedArray(Uint8ClampedArray);
addTypedArray(Int16Array);
addTypedArray(Uint16Array);
addTypedArray(Int32Array);
addTypedArray(Uint32Array);
addTypedArray(Float32Array);
addTypedArray(Float64Array);
addTypedArray(BigInt64Array);
addTypedArray(BigUint64Array);

const unifyDataView = (l, r, ls, rs, env) => {
  if (!(l instanceof DataView) || !(r instanceof DataView) || l.byteLength != r.byteLength) return false;
  for (let i = 0; i < l.byteLength; ++i) {
    if (l.getUint8(i) != r.getUint8(i)) return false;
  }
  return true;
};
typeof DataView == 'function' && registry.push(DataView, unifyDataView);

const unifyArrayBuffer = (l, r, ls, rs, env) => {
  if (!(l instanceof ArrayBuffer) || !(r instanceof ArrayBuffer) || l.byteLength != r.byteLength) return false;
  return unifyTypedArrays(Uint8Array)(new Uint8Array(l), new Uint8Array(r), ls, rs, env);
};
typeof ArrayBuffer == 'function' && typeof Uint8Array == 'function' && registry.push(ArrayBuffer, unifyArrayBuffer);

const unifySet = (l, r, ls, rs, env) => {
  if (!(l instanceof Set) || !(r instanceof Set) || l.size != r.size) return false;
  for (const item of l) {
    if (!r.has(item)) return false;
  }
  return true;
};
typeof Set == 'function' && registry.push(Set, unifySet);

const unifyMap = (l, r, ls, rs, env) => {
  if (!(l instanceof Map) || !(r instanceof Map) || l.size != r.size) return false;
  for (const [key, value] of l) {
    if (!r.has(key)) return false;
    ls.push(value);
    rs.push(r.get(key));
  }
  return true;
};
typeof Map == 'function' && registry.push(Map, unifyMap);

// unification of maps

const mapOps = {
  exact: {
    exact: {
      precheck: (l, r) => {
        for (const key of l.keys()) {
          if (!r.has(key)) return false;
        }
        return true;
      }
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
        for (const key of this.l.keys()) {
          !this.r.has(key) && this.r.set(key, this.l.get(key));
        }
        for (const key of this.r.keys()) {
          !this.l.has(key) && this.l.set(key, this.r.get(key));
        }
      }
    }
  }
};
mapOps.exact.exact.compare = mapOps.exact.open.compare = mapOps.exact.soft.compare = (l, r, ls, rs) => {
  for (const key of r.keys()) {
    if (!l.has(key)) return false;
    ls.push(l.get(key));
    rs.push(r.get(key));
  }
  return true;
};
mapOps.open.open.compare = mapOps.open.soft.compare = mapOps.soft.soft.compare = (l, r, ls, rs) => {
  for (const key of r.keys()) {
    if (!l.has(key)) continue;
    ls.push(l.get(key));
    rs.push(r.get(key));
  }
  return true;
};
mapOps.exact.soft.update = mapOps.open.soft.update = function () {
  for (const key of this.l.keys()) {
    !this.r.has(key) && this.r.set(key, this.l.get(key));
  }
};

const unifyMaps = (l, lt, lm, r, rt, rm, ls, rs, env) => {
  if (lt > rt) {
    [l, lt, lm, r, rt, rm] = [r, rt, rm, l, lt, lm];
  }
  const ops = mapOps[lt][rt];
  if (ops.precheck && !ops.precheck(l, r)) return false;
  if (ops.fix && rm) ls.push(new Command(ops.fix, rm));
  if (ops.update) ls.push(new Command(ops.update, l, r));
  return ops.compare(l, r, ls, rs, env);
};

// unification of sets

const setOps = {
  exact: {
    exact: {
      precheck: (l, r) => {
        for (const key of l) {
          if (!r.has(key)) return false;
        }
        return true;
      }
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
        for (const key of this.l) {
          this.r.add(key);
        }
        for (const key of this.r) {
          this.l.add(key);
        }
      }
    }
  }
};
setOps.exact.exact.compare = setOps.exact.open.compare = setOps.exact.soft.compare = setOps.open.open.compare = setOps.open.soft.compare = setOps.soft.soft.compare = () =>
  true;
setOps.exact.soft.update = setOps.open.soft.update = function () {
  for (const key of this.l) {
    this.r.add(key);
  }
};

const unifySets = (l, lt, lm, r, rt, rm, ls, rs, env) => {
  if (lt > rt) {
    [l, lt, lm, r, rt, rm] = [r, rt, rm, l, lt, lm];
  }
  const ops = setOps[lt][rt];
  if (ops.precheck && !ops.precheck(l, r)) return false;
  if (ops.fix && rm) ls.push(new Command(ops.fix, rm));
  if (ops.update) ls.push(new Command(ops.update, l, r));
  return ops.compare(l, r, ls, rs, env);
};

// unification of objects

const hasOwnProperty = Object.prototype.hasOwnProperty;

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
    [l, lt, lm, r, rt, rm] = [r, rt, rm, l, lt, lm];
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
    env.openMaps = options.openMaps;
    env.openSets = options.openSets;
    env.loose = options.loose;
  }
  const ls = [l],
    rs = [r];
  main: while (ls.length) {
    // perform a command, or extract a pair
    l = ls.pop();
    if (l instanceof Command) {
      l.f();
      continue;
    }
    r = rs.pop();
    // direct equality or anyvar
    if (l === r || l === _ || r === _) continue;
    // process variables (variables have priority)
    if (l instanceof Variable) {
      if (l.unify(r, ls, rs, env)) continue;
      return null;
    }
    if (r instanceof Variable) {
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
    // reject unequal functions
    if (typeof l == 'function' || typeof r == 'function') return null;
    // process loose equality for non-objects and nulls
    if (env.loose && !(l && r && typeof l == 'object' && typeof r == 'object') && l == r) continue main;
    // check rough types
    if (typeof l != typeof r) return null;
    // special case: NaN
    if (typeof l == 'number' && isNaN(l) && isNaN(r)) continue;
    // cut off impossible combinations
    if (typeof l != 'object' || !l || !r) return null;
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

unify.registry = registry;
unify.filters = filters;

export {_, Env, Unifier, isUnifier, Variable, variable, isVariable, _ as any, open, soft, isOpen, isSoft, isWrapped};
export default unify;
