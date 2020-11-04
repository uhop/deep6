import {_} from '../unify.js';

const empty = {};

const nop = () => {};

class Command {
  constructor(f, s) {
    this.f = f;
    this.s = s;
  }
}

const processCommand = (val, context) => val.f(context);

const processObject = (val, context) => {
  const stack = context.stack;
  Object.keys(val).forEach(k => stack.push(val[k]));
};

const processMap = (val, context) => {
  const stack = context.stack;
  for (const value of val.values()) {
    stack.push(value);
  }
};

const defaultRegistry = [Command, processCommand, Array, processObject, Date, nop, RegExp, nop],
  defaultFilters = [];

// add more exotic types

const addType = (Type, process) => typeof Type == 'function' && defaultRegistry.push(Type, process || nop);

addType(Map, processMap);
addType(Set);
addType(Int8Array);
addType(Uint8Array);
addType(Uint8ClampedArray);
addType(Int16Array);
addType(Uint16Array);
addType(Int32Array);
addType(Uint32Array);
addType(Float32Array);
addType(Float64Array);
addType(BigInt64Array);
addType(BigUint64Array);
addType(DataView);
addType(ArrayBuffer);

// main

const walk = (o, options) => {
  // non-recursive stack-based walk about an object tree
  options = options || empty;
  const doObject = options.processObject || processObject,
    doOther = options.processOther || nop,
    registry = options.registry || defaultRegistry,
    filters = options.filters || defaultFilters,
    context = options.context || {},
    stack = [o];
  context.stack = stack;
  main: while (stack.length) {
    o = stack.pop();
    if (o && typeof o == 'object') {
      if (o === _) {
        doOther(o, context);
        continue;
      }
      // process registered constructors
      for (let i = 0; i < registry.length; i += 2) {
        if (o instanceof registry[i]) {
          registry[i + 1](o, context);
          continue main;
        }
      }
      // process registered filters
      for (let i = 0; i < filters.length; ++i) {
        if (filters[i](o, context)) continue main;
      }
      // process naked objects
      doObject(o, context);
      continue;
    }
    doOther(o, context);
  }
};

walk.Command = Command;

export {Command};
export default walk;
