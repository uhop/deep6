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

const addType = (Type, process) => defaultRegistry.push(Type, process || nop);

typeof Map == 'function' && addType(Map, processMap);
typeof Set == 'function' && addType(Set);
typeof Int8Array == 'function' && addType(Int8Array);
typeof Uint8Array == 'function' && addType(Uint8Array);
typeof Uint8ClampedArray == 'function' && addType(Uint8ClampedArray);
typeof Int16Array == 'function' && addType(Int16Array);
typeof Uint16Array == 'function' && addType(Uint16Array);
typeof Int32Array == 'function' && addType(Int32Array);
typeof Uint32Array == 'function' && addType(Uint32Array);
typeof Float32Array == 'function' && addType(Float32Array);
typeof Float64Array == 'function' && addType(Float64Array);
typeof BigInt64Array == 'function' && addType(BigInt64Array);
typeof BigUint64Array == 'function' && addType(BigUint64Array);
typeof DataView == 'function' && addType(DataView);
typeof ArrayBuffer == 'function' && addType(ArrayBuffer);
typeof Promise == 'function' && addType(Promise);

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
    if (!o || typeof o != 'object' || o === _) {
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
  }
};

walk.Command = Command;

export {Command, defaultRegistry as registry, defaultFilters as filters};
export default walk;
