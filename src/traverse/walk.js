import {_} from '../unify.js';

const empty = {};

const nop = () => {};

// public utilities to build walkers

class Circular {
  constructor(value) {
    this.value = value;
  }
}

const setObject = (seen, source, value) => {
  if (seen.has(source)) {
    seen.get(source).actions.forEach(([object, key]) => {
      if (object instanceof Map) {
        object.set(key, value);
      } else {
        const d = Object.getOwnPropertyDescriptor(object, key);
        d.value = value;
        Object.defineProperty(object, key, d);
      }
    });
  }
  seen.set(source, {value});
};

const processOther = (value, context) => context.stackOut.push(value);

const processCircular = (value, context) => context.stackOut.push(new Circular(value));

const processMap = (postProcess, postProcessSeen) => (object, context) => {
  const stack = context.stack;
  postProcess && stack.push(new Command(postProcessSeen ? (context.seen ? postProcessSeen : postProcess) : postProcess, object));
  for (const value of object.values()) {
    stack.push(value);
  }
};

const postMapCircular = (source, context) => {
  const {stackOut, seen, wrapMap} = context,
    t = new Map();
  for (const k of source.keys()) {
    const value = stackOut.pop();
    if (!(value instanceof Circular)) {
      t.set(k, value);
      continue;
    }
    const record = seen.get(value.value);
    if (record) {
      if (record.actions) {
        record.actions.push([t, k]);
      } else {
        t.set(k, record.value);
      }
    } else {
      seen.set(value.value, {actions: [[t, k]]});
    }
  }
  const o = wrapMap ? wrapMap(t) : t;
  setObject(seen, source, o);
  stackOut.push(o);
};

const buildNewMap = (keys, stackOut, wrap) => {
  const t = new Map();
  for (const key of keys) {
    t.set(key, stackOut.pop());
  }
  stackOut.push(wrap ? wrap(t) : t);
};

const replaceObject = (upTo, object, stackOut) => {
  const l = stackOut.length - 1 - upTo;
  if (l) {
    stackOut.splice(-l, l, object);
  } else {
    stackOut.push(object);
  }
};

const processObject = (postProcess, postProcessSeen) => (object, context) => {
  const {stack, symbols} = context;
  postProcess && stack.push(new Command(postProcessSeen ? (context.seen ? postProcessSeen : postProcess) : postProcess, object));
  const descriptors = Object.getOwnPropertyDescriptors(object);
  Array.isArray(object) && delete descriptors.length;
  let keys = Object.keys(descriptors);
  if (symbols) keys = keys.concat(Object.getOwnPropertySymbols(descriptors));
  for (const key of keys) {
    const d = descriptors[key];
    !(d.get || d.set) && stack.push(d.value);
  }
};

const getObjectData = (object, context) => {
  const descriptors = Object.getOwnPropertyDescriptors(object);
  if (Array.isArray(object)) delete descriptors.length;
  let keys = Object.keys(descriptors);
  if (context.symbols) keys = keys.concat(Object.getOwnPropertySymbols(descriptors));
  return {descriptors, keys};
};

const buildNewObject = (source, descriptors, keys, stackOut, wrap) => {
  const t = Array.isArray(source) ? [] : Object.create(Object.getPrototypeOf(source));
  for (const key of keys) {
    const d = descriptors[key];
    if (!(d.get || d.set)) {
      d.value = stackOut.pop();
    }
    Object.defineProperty(t, key, d);
  }
  stackOut.push(wrap ? wrap(t) : t);
};

// implementation

class Command {
  constructor(f, s) {
    this.f = f;
    this.s = s;
  }
}

const processCommand = (val, context) => val.f(context);

const defaultRegistry = [Command, processCommand, Array, processObject(), Date, nop, RegExp, nop],
  defaultFilters = [];

// add more types

const addType = (Type, process) => defaultRegistry.push(Type, process || nop);

addType(Map, processMap());
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
  const doObject = options.processObject || processObject(),
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

export {
  Command,
  defaultRegistry as registry,
  defaultFilters as filters,
  Circular,
  setObject,
  processMap,
  postMapCircular,
  processOther,
  processCircular,
  buildNewMap,
  replaceObject,
  processObject,
  getObjectData,
  buildNewObject
};
export default walk;
