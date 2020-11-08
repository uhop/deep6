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
  const record = seen.get(source);
  if (record) {
    record.actions.forEach(([object, key]) => {
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
  for (const k of keys) {
    t.set(k, stackOut.pop());
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
  const stack = context.stack;
  postProcess && stack.push(new Command(postProcessSeen ? (context.seen ? postProcessSeen : postProcess) : postProcess, object));
  const {descriptors, keys} = getObjectData(object, context);
  for (const k of keys) {
    const d = descriptors[k];
    !(d.get || d.set) && stack.push(d.value);
  }
};

const postObjectCircular = (source, descriptors, keys, context) => {
  const {stackOut, seen} = context,
    isArray = Array.isArray(source),
    wrap = context[isArray ? 'wrapArray' : 'wrapObject'],
    t = isArray ? [] : Object.create(Object.getPrototypeOf(source));
  for (const k of keys) {
    const d = descriptors[k];
    if (d.get || d.set) {
      Object.defineProperty(t, k, d);
      continue;
    }
    const value = stackOut.pop();
    if (!(value instanceof Circular)) {
      d.value = value;
      Object.defineProperty(t, k, d);
      continue;
    }
    const record = seen.get(value.value);
    if (record) {
      if (record.actions) {
        record.actions.push([t, k]);
        d.value = null;
      } else {
        d.value = record.value;
      }
      Object.defineProperty(t, k, d);
      continue;
    }
    seen.set(value.value, {actions: [[t, k]]});
    d.value = null;
    Object.defineProperty(t, k, d);
  }
  const o = wrap ? wrap(t) : t;
  setObject(seen, source, o);
  stackOut.push(o);
};

const getObjectData = (object, context) => {
  const descriptors = Object.getOwnPropertyDescriptors(object);
  if (Array.isArray(object)) delete descriptors.length;
  let keys = Object.keys(descriptors);
  if (context.symbols) keys = keys.concat(Object.getOwnPropertySymbols(descriptors));
  if (!context.allProps) keys = keys.filter(key => descriptors[key].enumerable);
  return {descriptors, keys};
};

const buildNewObject = (source, descriptors, keys, stackOut, wrap) => {
  const t = Array.isArray(source) ? [] : Object.create(Object.getPrototypeOf(source));
  for (const k of keys) {
    const d = descriptors[k];
    if (!(d.get || d.set)) {
      d.value = stackOut.pop();
    }
    Object.defineProperty(t, k, d);
  }
  stackOut.push(wrap ? wrap(t) : t);
};

const processVariable = (val, context) => {
  const env = context.env;
  if (val.isBound(env)) {
    context.stack.push(val.get(env));
  } else {
    context.stackOut.push(val);
  }
};

// implementation

class Command {
  constructor(f, s) {
    this.f = f;
    this.s = s;
  }
}

const processCommand = (val, context) => val.f(context);

const defaultRegistry = [Command, processCommand, Array, processObject(), Date, nop, RegExp, nop, Map, processMap(), Set, nop, Promise, nop],
  defaultFilters = [];

// add more types

const addType = (Type, process) => defaultRegistry.push(Type, process || nop);

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
    seen = options.circular ? new Map() : null;
  context.stack = stack;
  context.seen = seen;
  context.symbols = options.symbols;
  context.allProps = options.allProps;
  main: while (stack.length) {
    o = stack.pop();
    if (!o || typeof o != 'object' || o === _) {
      doOther(o, context);
      continue;
    }
    // process circular dependencies
    if (seen) {
      if (seen.has(o)) {
        doCircular(o, context);
        continue;
      }
      seen.set(o, null);
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
  postObjectCircular,
  getObjectData,
  buildNewObject,
  processVariable,
  processCommand
};
export default walk;
