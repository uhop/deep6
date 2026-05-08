const keyDepth = Symbol.for('deep6.env.depth');

const collectSymbols = object => {
  const symbols = new Set();
  while (object && typeof object == 'object') {
    for (const symbol of Object.getOwnPropertySymbols(object)) symbols.add(symbol);
    object = Object.getPrototypeOf(object);
  }
  symbols.delete(keyDepth);
  return Array.from(symbols);
};

const ensure = (object, depth) => {
  let d = object[keyDepth];
  while (d > depth) {
    object = Object.getPrototypeOf(object);
    d = object[keyDepth];
  }
  if (d < depth) {
    object = Object.create(object);
    object[keyDepth] = depth;
  }
  return object;
};

class EnvCurrent {
  constructor() {
    this.variables = Object.create(null);
    this.values = Object.create(null);
    this.variables[keyDepth] = this.values[keyDepth] = 0;
    this.depth = this.varsDepth = this.valsDepth = 0;
  }
  push() {
    ++this.depth;
  }
  pop() {
    --this.depth;
    while (this.varsDepth > this.depth) {
      this.variables = Object.getPrototypeOf(this.variables);
      this.varsDepth = this.variables[keyDepth];
    }
    while (this.valsDepth > this.depth) {
      this.values = Object.getPrototypeOf(this.values);
      this.valsDepth = this.values[keyDepth];
    }
  }
  bindVar(name1, name2) {
    const depth = this.depth;
    let vars = this.variables;
    if (this.varsDepth < depth) {
      vars = this.variables = Object.create(vars);
      vars[keyDepth] = depth;
      this.varsDepth = depth;
    }
    let u1 = vars[name1],
      u2 = vars[name2];
    u1 && u1[keyDepth] !== depth && (u1 = vars[name1] = ensure(u1, depth));
    u2 && u2[keyDepth] !== depth && (u2 = vars[name2] = ensure(u2, depth));
    if (u1) {
      if (u2) {
        for (const k in u2) {
          vars[k] = u1;
          u1[k] = 1;
        }
        for (const k of collectSymbols(u2)) {
          vars[k] = u1;
          u1[k] = 1;
        }
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
    const depth = this.depth;
    let values = this.values,
      vars = this.variables;
    if (this.valsDepth < depth) {
      values = this.values = Object.create(values);
      values[keyDepth] = depth;
      this.valsDepth = depth;
    }
    if (this.varsDepth < depth) {
      vars = this.variables = Object.create(vars);
      vars[keyDepth] = depth;
      this.varsDepth = depth;
    }
    let u = vars[name];
    u && u[keyDepth] !== depth && (u = vars[name] = ensure(u, depth));
    if (u) {
      for (const k in u) {
        values[k] = val;
        vars[k] = null;
      }
      for (const k of collectSymbols(u)) {
        values[k] = val;
        vars[k] = null;
      }
    } else {
      values[name] = val;
    }
  }
  get(name) {
    return this.values[name];
  }
}

class EnvMap {
  constructor() {
    this.valuesStack = [new Map()];
    this.variablesStack = [new Map()];
    this.depth = 0;
  }
  push() {
    ++this.depth;
    this.valuesStack.push(null);
    this.variablesStack.push(null);
  }
  pop() {
    --this.depth;
    this.valuesStack.pop();
    this.variablesStack.pop();
  }
  _findAliasSet(name) {
    for (let i = this.depth; i >= 0; --i) {
      const m = this.variablesStack[i];
      if (m && m.has(name)) return m.get(name);
    }
    return null;
  }
  _topVariables() {
    let m = this.variablesStack[this.depth];
    if (!m) m = this.variablesStack[this.depth] = new Map();
    return m;
  }
  _topValues() {
    let m = this.valuesStack[this.depth];
    if (!m) m = this.valuesStack[this.depth] = new Map();
    return m;
  }
  bindVar(name1, name2) {
    const u1 = this._findAliasSet(name1),
      u2 = this._findAliasSet(name2);
    const top = this._topVariables();
    if (u1 && u2) {
      if (u1 === u2) return;
      const merged = new Set(u1);
      for (const n of u2) merged.add(n);
      for (const n of merged) top.set(n, merged);
    } else if (u1) {
      const merged = new Set(u1);
      merged.add(name2);
      for (const n of merged) top.set(n, merged);
    } else if (u2) {
      const merged = new Set(u2);
      merged.add(name1);
      for (const n of merged) top.set(n, merged);
    } else {
      const merged = new Set([name1, name2]);
      top.set(name1, merged);
      top.set(name2, merged);
    }
  }
  bindVal(name, val) {
    const u = this._findAliasSet(name),
      values = this._topValues();
    if (u) {
      for (const member of u) values.set(member, val);
    } else {
      values.set(name, val);
    }
  }
  get(name) {
    for (let i = this.depth; i >= 0; --i) {
      const m = this.valuesStack[i];
      if (m && m.has(name)) return m.get(name);
    }
    return undefined;
  }
}

const driveShallow = (env, n) => {
  let counter = 0;
  for (let i = 0; i < n; ++i) {
    env.push();
    for (let j = 0; j < 4; ++j) env.bindVal(Symbol(counter++), j);
    env.pop();
  }
};

const driveDeep = (env, n) => {
  let counter = 0;
  for (let i = 0; i < n; ++i) {
    env.push();
    env.push();
    env.push();
    env.push();
    for (let j = 0; j < 4; ++j) env.bindVal(Symbol(counter++), j);
    env.pop();
    env.pop();
    env.pop();
    env.pop();
  }
};

const driveBindHeavy = (env, n) => {
  let counter = 0;
  for (let i = 0; i < n; ++i) {
    env.push();
    for (let j = 0; j < 32; ++j) env.bindVal(Symbol(counter++), j);
    env.pop();
  }
};

const driveBindAndGet = (env, n) => {
  let counter = 0;
  const names = [];
  for (let i = 0; i < n; ++i) {
    env.push();
    names.length = 0;
    for (let j = 0; j < 8; ++j) {
      const name = Symbol(counter++);
      names.push(name);
      env.bindVal(name, j);
    }
    let sum = 0;
    for (let j = 0; j < 8; ++j) sum += env.get(names[j]);
    env.pop();
  }
};

const driveAlias = (env, n) => {
  let counter = 0;
  for (let i = 0; i < n; ++i) {
    env.push();
    const a = Symbol(counter++),
      b = Symbol(counter++),
      c = Symbol(counter++);
    env.bindVar(a, b);
    env.bindVar(b, c);
    env.bindVal(a, i);
    env.pop();
  }
};

export default {
  current_shallow: n => {
    const env = new EnvCurrent();
    driveShallow(env, n);
    return env;
  },
  map_shallow: n => {
    const env = new EnvMap();
    driveShallow(env, n);
    return env;
  },
  current_deep: n => {
    const env = new EnvCurrent();
    driveDeep(env, n);
    return env;
  },
  map_deep: n => {
    const env = new EnvMap();
    driveDeep(env, n);
    return env;
  },
  current_bindheavy: n => {
    const env = new EnvCurrent();
    driveBindHeavy(env, n);
    return env;
  },
  map_bindheavy: n => {
    const env = new EnvMap();
    driveBindHeavy(env, n);
    return env;
  },
  current_bindandget: n => {
    const env = new EnvCurrent();
    driveBindAndGet(env, n);
    return env;
  },
  map_bindandget: n => {
    const env = new EnvMap();
    driveBindAndGet(env, n);
    return env;
  },
  current_alias: n => {
    const env = new EnvCurrent();
    driveAlias(env, n);
    return env;
  },
  map_alias: n => {
    const env = new EnvMap();
    driveAlias(env, n);
    return env;
  }
};
