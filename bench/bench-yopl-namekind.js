const keyDepth = Symbol.for('deep6.env.depth');

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
    if (u) {
      if (u[keyDepth] !== depth) u = vars[name] = ensure(u, depth);
      for (const k in u) {
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
    this.depth = 0;
  }
  push() {
    ++this.depth;
    this.valuesStack.push(null);
  }
  pop() {
    --this.depth;
    this.valuesStack.pop();
  }
  bindVal(name, val) {
    let m = this.valuesStack[this.depth];
    if (!m) m = this.valuesStack[this.depth] = new Map();
    m.set(name, val);
  }
  get(name) {
    for (let i = this.depth; i >= 0; --i) {
      const m = this.valuesStack[i];
      if (m && m.has(name)) return m.get(name);
    }
    return undefined;
  }
}

const driveShallowSym = (env, n) => {
  let counter = 0;
  for (let i = 0; i < n; ++i) {
    env.push();
    for (let j = 0; j < 4; ++j) env.bindVal(Symbol(counter++), j);
    env.pop();
  }
};

const driveShallowStr = (env, n) => {
  let counter = 0;
  for (let i = 0; i < n; ++i) {
    env.push();
    for (let j = 0; j < 4; ++j) env.bindVal('_v' + counter++, j);
    env.pop();
  }
};

const driveBindHeavySym = (env, n) => {
  let counter = 0;
  for (let i = 0; i < n; ++i) {
    env.push();
    for (let j = 0; j < 32; ++j) env.bindVal(Symbol(counter++), j);
    env.pop();
  }
};

const driveBindHeavyStr = (env, n) => {
  let counter = 0;
  for (let i = 0; i < n; ++i) {
    env.push();
    for (let j = 0; j < 32; ++j) env.bindVal('_v' + counter++, j);
    env.pop();
  }
};

const driveBindAndGetSym = (env, n) => {
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

const driveBindAndGetStr = (env, n) => {
  let counter = 0;
  const names = [];
  for (let i = 0; i < n; ++i) {
    env.push();
    names.length = 0;
    for (let j = 0; j < 8; ++j) {
      const name = '_v' + counter++;
      names.push(name);
      env.bindVal(name, j);
    }
    let sum = 0;
    for (let j = 0; j < 8; ++j) sum += env.get(names[j]);
    env.pop();
  }
};

export default {
  current_sym_shallow: n => {
    const env = new EnvCurrent();
    driveShallowSym(env, n);
    return env;
  },
  current_str_shallow: n => {
    const env = new EnvCurrent();
    driveShallowStr(env, n);
    return env;
  },
  map_sym_shallow: n => {
    const env = new EnvMap();
    driveShallowSym(env, n);
    return env;
  },
  map_str_shallow: n => {
    const env = new EnvMap();
    driveShallowStr(env, n);
    return env;
  },
  current_sym_bindheavy: n => {
    const env = new EnvCurrent();
    driveBindHeavySym(env, n);
    return env;
  },
  current_str_bindheavy: n => {
    const env = new EnvCurrent();
    driveBindHeavyStr(env, n);
    return env;
  },
  map_sym_bindheavy: n => {
    const env = new EnvMap();
    driveBindHeavySym(env, n);
    return env;
  },
  map_str_bindheavy: n => {
    const env = new EnvMap();
    driveBindHeavyStr(env, n);
    return env;
  },
  current_sym_bindandget: n => {
    const env = new EnvCurrent();
    driveBindAndGetSym(env, n);
    return env;
  },
  current_str_bindandget: n => {
    const env = new EnvCurrent();
    driveBindAndGetStr(env, n);
    return env;
  },
  map_sym_bindandget: n => {
    const env = new EnvMap();
    driveBindAndGetSym(env, n);
    return env;
  },
  map_str_bindandget: n => {
    const env = new EnvMap();
    driveBindAndGetStr(env, n);
    return env;
  }
};
