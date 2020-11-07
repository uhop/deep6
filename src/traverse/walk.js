import {_} from '../unify.js';

const empty = {};

const nop = () => {};

class Circular {
  constructor(value) {
    this.value = value;
  }
}

const setObject = (seen, s, t) => {
  if (seen.has(s)) {
    seen.get(s).actions.forEach(([object, key]) => {
      if (object instanceof Map) {
        object.set(key, t);
      } else {
        const d = Object.getOwnPropertyDescriptor(object, key);
        d.value = t;
        Object.defineProperty(object, key, d);
      }
    });
  }
  seen.set(s, {value: t});
};

class Command {
  constructor(f, s) {
    this.f = f;
    this.s = s;
  }
}

const processCommand = (val, context) => val.f(context);

const processObject = (val, context) => {
  const {stack, symbols} = context,
    descriptors = Object.getOwnPropertyDescriptors(val);
  if (val instanceof Array) delete descriptors.length;
  let keys = Object.keys(descriptors);
  if (symbols) keys = keys.concat(Object.getOwnPropertySymbols(descriptors));
  for (const key of keys) {
    const d = descriptors[key];
    !(d.get || d.set) && stack.push(d.value);
  }
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

addType(Map, processMap);
addType(Set);
addType(Promise);

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

// main

const walk = (o, options) => {
  // non-recursive stack-based walk about an object tree
  options = options || empty;
  const doObject = options.processObject || processObject,
    doOther = options.processOther || nop,
    doCircular = options.processCircular || nop,
    registry = options.registry || defaultRegistry,
    filters = options.filters || defaultFilters,
    context = options.context || {},
    stack = [o],
    seen = new Set();
  context.stack = stack;
  context.symbols = options.symbols;
  main: while (stack.length) {
    o = stack.pop();
    if (!o || typeof o != 'object' || o === _) {
      doOther(o, context);
      continue;
    }
    // process circular dependencies
    if (options.circular) {
      if (seen.has(o)) {
        doCircular(o, context);
        continue;
      }
      seen.add(o);
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

export {Circular, setObject, Command, defaultRegistry as registry, defaultFilters as filters};
export default walk;
