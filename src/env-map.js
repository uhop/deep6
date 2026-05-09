// @ts-self-types="./env-map.d.ts"
// EnvMap — Map-stack implementation. Duck-typed sibling of Env.

import {Unifier, isUnifier, Variable, variable, isVariable, _, any} from './env-shared.js';

class EnvMap {
  constructor() {
    this.valuesStack = [new Map()];
    this.variablesStack = [new Map()];
    this.depth = 0;
    this.options = {};
  }
  push() {
    ++this.depth;
    this.valuesStack.push(null);
    this.variablesStack.push(null);
  }
  pop() {
    if (this.depth < 1) throw new Error('attempt to pop a frame with an empty stack');
    --this.depth;
    this.valuesStack.pop();
    this.variablesStack.pop();
  }
  revert(depth) {
    if (this.depth < depth) throw new Error('attempt to revert a stack to a higher depth');
    while (this.depth > depth) {
      this.valuesStack.pop();
      this.variablesStack.pop();
      --this.depth;
    }
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
  isBound(name) {
    for (let i = this.depth; i >= 0; --i) {
      const m = this.valuesStack[i];
      if (m && m.has(name)) return true;
    }
    return false;
  }
  isAlias(name1, name2) {
    const u = this._findAliasSet(name2);
    return !!u && u.has(name1);
  }
  get(name) {
    for (let i = this.depth; i >= 0; --i) {
      const m = this.valuesStack[i];
      if (m && m.has(name)) return m.get(name);
    }
    return undefined;
  }
  getAllValues() {
    const seen = new Set(),
      result = [];
    for (let i = this.depth; i >= 0; --i) {
      const m = this.valuesStack[i];
      if (!m) continue;
      for (const [name, value] of m) {
        if (seen.has(name)) continue;
        seen.add(name);
        result.push({name, value});
      }
    }
    return result;
  }
}

export {EnvMap, Unifier, isUnifier, Variable, variable, isVariable, _, any};
