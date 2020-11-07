import {Env, Unifier, Variable} from '../unify.js';
import walk from './walk.js';

const empty = {};

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

function postProcess(context) {
  const stackOut = context.stackOut,
    s = this.s,
    isArray = s instanceof Array,
    descriptors = Object.getOwnPropertyDescriptors(s);
  if (isArray) delete descriptors.length;
  const t = isArray ? [] : Object.create(Object.getPrototypeOf(s)),
    keys = Object.keys(descriptors).concat(Object.getOwnPropertySymbols(descriptors));
  for (const k of keys) {
    const d = descriptors[k];
    if (!(d.get || d.set)) {
      d.value = stackOut.pop();
    }
    Object.defineProperty(t, k, d);
  }
  stackOut.push(t);
}

function postProcessSeen(context) {
  const {stackOut, seen} = context,
    s = this.s,
    isArray = s instanceof Array,
    descriptors = Object.getOwnPropertyDescriptors(s);
  if (isArray) delete descriptors.length;
  const t = isArray ? [] : Object.create(Object.getPrototypeOf(s)),
    keys = Object.keys(descriptors).concat(Object.getOwnPropertySymbols(descriptors));
  setObject(seen, this.s, t);
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
  stackOut.push(t);
}

const processObject = (val, context) => {
  const {stack, ignoreSymbols} = context;
  stack.push(new walk.Command(context.seen ? postProcessSeen : postProcess, val));
  const descriptors = Object.getOwnPropertyDescriptors(val);
  const keys = Object.keys(descriptors).concat(Object.getOwnPropertySymbols(descriptors));
  for (const key of keys) {
    if (ignoreSymbols && typeof key == 'symbol') continue;
    const d = descriptors[key];
    !(d.get || d.set) && stack.push(d.value);
  }
};

function postProcessMap(context) {
  const stackOut = context.stackOut,
    t = new Map();
  for (const key of this.s.keys()) {
    t.set(key, stackOut.pop());
  }
  stackOut.push(t);
}

function postProcessMapSeen(context) {
  const {stackOut, seen} = context,
    t = new Map();
  setObject(seen, this.s, t);
  for (const k of this.s.keys()) {
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
  stackOut.push(t);
}

const processMap = (val, context) => {
  const stack = context.stack;
  stack.push(new walk.Command(context.seen ? postProcessMapSeen : postProcessMap, val));
  for (const value of val.values()) {
    stack.push(value);
  }
};

const processPromise = (val, context) =>
  context.stackOut.push(
    val.then(
      value => value,
      error => Promise.reject(error)
    )
  );

const registry = [
    walk.Command,
    function processCommand(val, context) {
      val.f(context);
    },
    Array,
    function processArray(val, context) {
      const {stack, ignoreSymbols} = context;
      stack.push(new walk.Command(context.seen ? postProcessSeen : postProcess, val));
      const descriptors = Object.getOwnPropertyDescriptors(val);
      delete descriptors.length;
      const keys = Object.keys(descriptors).concat(Object.getOwnPropertySymbols(descriptors));
      for (const key of keys) {
        if (ignoreSymbols && typeof key == 'symbol') continue;
        const d = descriptors[key];
        !(d.get || d.set) && stack.push(d.value);
      }
    },
    Variable,
    function processVariable(val, context) {
      const env = context.env;
      if (val.isBound(env)) {
        context.stack.push(val.get(env));
      } else {
        context.stackOut.push(val);
      }
    },
    Unifier,
    function processAsValue(val, context) {
      context.stackOut.push(val);
    },
    Date,
    function processDate(val, context) {
      context.stackOut.push(new Date(val.getTime()));
    },
    RegExp,
    function processRegExp(val, context) {
      context.stackOut.push(new RegExp(val.source, (val.global ? 'g' : '') + (val.multiline ? 'm' : '') + (val.ignoreCase ? 'i' : '')));
    }
  ],
  filters = [];

const processOther = (val, context) => context.stackOut.push(val);

const processCircular = (val, context) => context.stackOut.push(new Circular(val));

// add more exotic types

const addType = (Type, process) => registry.push(Type, process || ((val, context) => context.stackOut.push(new Type(val))));

addType(Map, processMap);
addType(Set);
addType(Promise, processPromise);

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

const clone = (source, env, options) => {
  if (env && !(env instanceof Env)) {
    options = env;
    env = null;
  }
  options = options || empty;

  const context = options.context || {},
    stackOut = [];
  context.stackOut = stackOut;
  context.seen = options.circular ? new Map() : null;
  context.env = env;

  walk(source, {
    processObject: options.processObject || processObject,
    processOther: options.processOther || processOther,
    processCircular: options.processCircular || processCircular,
    registry: options.registry || clone.registry,
    filters: options.filters || clone.filters,
    circular: options.circular,
    ignoreSymbols: Object.prototype.hasOwnProperty.call(options, 'ignoreSymbols') ? options.ignoreSymbols : true,
    context: context
  });

  // ice.assert(stackOut.length == 1);
  return stackOut[0];
};
clone.registry = registry;
clone.filters = filters;

export {registry, filters};
export default clone;
