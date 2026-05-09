// @ts-self-types="./env.d.ts"
// Env — proto-chain implementation

import {Unifier, isUnifier, Variable, variable, isVariable, _, any} from './env-shared.js';

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

class Env {
  constructor() {
    this.variables = Object.create(null);
    this.values = Object.create(null);
    this.variables[keyDepth] = this.values[keyDepth] = 0;
    this.depth = this.varsDepth = this.valsDepth = 0;
    this.options = {};
  }
  push() {
    ++this.depth;
  }
  pop() {
    if (this.depth < 1) throw new Error('attempt to pop a frame with an empty stack');
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
  revert(depth) {
    if (this.depth < depth) throw new Error('attempt to revert a stack to a higher depth');
    while (this.varsDepth > depth) {
      this.variables = Object.getPrototypeOf(this.variables);
      this.varsDepth = this.variables[keyDepth];
    }
    while (this.valsDepth > depth) {
      this.values = Object.getPrototypeOf(this.values);
      this.valsDepth = this.values[keyDepth];
    }
    this.depth = depth;
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
  // helpers
  isBound(name) {
    return name in this.values;
  }
  isAlias(name1, name2) {
    const u = this.variables[name2];
    return u && u[name1] === 1;
  }
  get(name) {
    return this.values[name];
  }
  // debugging
  getAllValues() {
    const values = this.values,
      result = [];
    for (const k of collectSymbols(values)) result.push({name: k, value: values[k]});
    for (const k in values) {
      result.push({name: k, value: values[k]});
    }
    return result;
  }
}

export {Env, Unifier, isUnifier, Variable, variable, isVariable, _, any};
