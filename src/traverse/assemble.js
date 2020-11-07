import {Unifier, Variable} from '../unify.js';
import walk from './walk.js';

const empty = {};

function postProcess(context) {
  const {stackOut, ignoreSymbols} = context,
    s = this.s,
    isArray = s instanceof Array,
    descriptors = Object.getOwnPropertyDescriptors(s);
  if (isArray) delete descriptors.length;
  const keys = Object.keys(descriptors).concat(Object.getOwnPropertySymbols(descriptors));
  let j = stackOut.length - 1;
  main: {
    const result = keys.some(k => {
      if (ignoreSymbols && typeof k == 'symbol') return false;
      const d = descriptors[k];
      if (d.get || d.set) return false;
      const t = stackOut[j--];
      return typeof t == 'number' && isNaN(t) ? typeof s[k] == 'number' && !isNaN(s[k]) : s[k] !== t;
    });
    if (result) break main;
    const l = stackOut.length - 1 - j;
    if (l) {
      stackOut.splice(-l, l, s);
    } else {
      stackOut.push(s);
    }
    return;
  }
  const t = isArray ? [] : Object.create(Object.getPrototypeOf(s));
  for (const key of keys) {
    if (ignoreSymbols && typeof key == 'symbol') continue;
    const d = descriptors[key];
    if (!(d.get || d.set)) {
      d.value = stackOut.pop();
    }
    Object.defineProperty(t, key, d);
  }
  stackOut.push(t);
}

const processObject = (val, context) => {
  const {stack, ignoreSymbols} = context;
  stack.push(new walk.Command(postProcess, val));
  const descriptors = Object.getOwnPropertyDescriptors(val),
    keys = Object.keys(descriptors).concat(Object.getOwnPropertySymbols(descriptors));
  for (const key of keys) {
    if (ignoreSymbols && typeof key == 'symbol') continue;
    const d = descriptors[key];
    !(d.get || d.set) && stack.push(d.value);
  }
};

const postProcessMap = context => {
  const stackOut = context.stackOut,
    s = this.s;
  let j = stackOut.length - 1;
  main: {
    const result = Array.from(s.values()).some(v => {
      const t = stackOut[j--];
      return typeof t == 'number' && isNaN(t) ? typeof v == 'number' && !isNaN(v) : v !== t;
    });
    if (result) break main;
    const l = stackOut.length - 1 - j;
    if (l) {
      stackOut.splice(-l, l, s);
    } else {
      stackOut.push(s);
    }
    return;
  }
  const t = new Map();
  for (const key of s.keys()) {
    t.set(key, stackOut.pop());
  }
  stackOut.push(t);
};

const processMap = (val, context) => {
  const stack = context.stack;
  stack.push(new walk.Command(postProcessMap, val));
  for (const value of val.values()) {
    stack.push(value);
  }
};

// no processing, use as a reference
const processOther = (val, context) => context.stackOut.push(val);

const registry = [
    walk.Command,
    function processCommand(val, context) {
      val.f(context);
    },
    Array,
    function processArray(val, context) {
      const {stack, ignoreSymbols} = context;
      stack.push(new walk.Command(postProcess, val));
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
    processOther,
    Date,
    processOther,
    RegExp,
    processOther
  ],
  filters = [];

// add more exotic types

const addType = (Type, process) => registry.push(Type, process || processOther);

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

const assemble = (source, env, options) => {
  options = options || empty;

  const context = options.context || {},
    stackOut = [];
  context.stackOut = stackOut;
  context.env = env;

  walk(source, {
    processObject: options.processObject || processObject,
    processOther: options.processOther || processOther,
    registry: options.registry || assemble.registry,
    filters: options.filters || assemble.filters,
    circular: options.circular,
    ignoreSymbols: Object.prototype.hasOwnProperty.call(options, 'ignoreSymbols') ? options.ignoreSymbols : true,
    context: context
  });

  // ice.assert(stackOut.length == 1);
  return stackOut[0];
};
assemble.registry = registry;
assemble.filters = filters;

export {registry, filters};
export default assemble;
