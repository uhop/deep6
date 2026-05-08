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

class EnvInlined {
  constructor() {
    this.variables = Object.create(null);
    this.values = Object.create(null);
    this.depth = this.variables[keyDepth] = this.values[keyDepth] = 0;
  }
  push() {
    ++this.depth;
  }
  pop() {
    --this.depth;
    while (this.variables[keyDepth] > this.depth) this.variables = Object.getPrototypeOf(this.variables);
    while (this.values[keyDepth] > this.depth) this.values = Object.getPrototypeOf(this.values);
  }
  bindVal(name, val) {
    const depth = this.depth;
    let values = this.values,
      vars = this.variables;
    values[keyDepth] === depth || (values = this.values = ensure(values, depth));
    vars[keyDepth] === depth || (vars = this.variables = ensure(vars, depth));
    values[name] = val;
  }
}

class EnvMirrored {
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
    values[name] = val;
  }
}

const NAMES = Array.from({length: 8}, (_, i) => 'v' + i);

const driveShallow = (env, n) => {
  for (let i = 0; i < n; ++i) {
    env.push();
    for (let j = 0; j < 8; ++j) env.bindVal(NAMES[j], j);
    env.pop();
  }
};

const driveDeep = (env, n) => {
  for (let i = 0; i < n; ++i) {
    env.push();
    env.push();
    env.push();
    env.push();
    for (let j = 0; j < 8; ++j) env.bindVal(NAMES[j], j);
    env.pop();
    env.pop();
    env.pop();
    env.pop();
  }
};

const driveBindHeavy = (env, n) => {
  for (let i = 0; i < n; ++i) {
    env.push();
    for (let j = 0; j < 32; ++j) env.bindVal(NAMES[j & 7], j);
    env.pop();
  }
};

export default {
  inlined_shallow: n => {
    const env = new EnvInlined();
    driveShallow(env, n);
    return env;
  },
  mirrored_shallow: n => {
    const env = new EnvMirrored();
    driveShallow(env, n);
    return env;
  },
  inlined_deep: n => {
    const env = new EnvInlined();
    driveDeep(env, n);
    return env;
  },
  mirrored_deep: n => {
    const env = new EnvMirrored();
    driveDeep(env, n);
    return env;
  },
  inlined_bindheavy: n => {
    const env = new EnvInlined();
    driveBindHeavy(env, n);
    return env;
  },
  mirrored_bindheavy: n => {
    const env = new EnvMirrored();
    driveBindHeavy(env, n);
    return env;
  }
};
