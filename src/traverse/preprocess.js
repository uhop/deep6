import {Unifier, Variable, open} from '../unify.js';
import walk from './walk.js';

const empty = {};

function postProcess(context) {
  const stackOut = context.stackOut,
    s = this.s,
    descriptors = Object.getOwnPropertyDescriptors(s);
  if (s instanceof Array) delete descriptors.length;
  const wrap = context[s instanceof Array ? 'wrapArray' : 'wrapObject'],
    t = s instanceof Array ? [] : Object.create(Object.getPrototypeOf(s)),
    keys = Object.keys(descriptors).concat(Object.getOwnPropertySymbols(descriptors));
  for (const k of keys) {
    const d = descriptors[k];
    if (!(d.get || d.set)) {
      d.value = stackOut.pop();
    }
    Object.defineProperty(t, k, d);
  }
  stackOut.push(wrap ? wrap(t) : t);
}

const processObject = (val, context) => {
  const stack = context.stack;
  stack.push(new walk.Command(postProcess, val));
  const descriptors = Object.getOwnPropertyDescriptors(val),
    keys = Object.keys(descriptors).concat(Object.getOwnPropertySymbols(descriptors));
  keys.forEach(key => {
    const d = descriptors[key];
    !(d.get || d.set) && stack.push(d.value);
  });
};

function postProcessMap(context) {
  const stackOut = context.stackOut,
    wrap = context.wrapMap,
    t = new Map();
  for (const key of this.s.keys()) {
    t.set(key, stackOut.pop());
  }
  stackOut.push(wrap ? wrap(t) : t);
}

const processMap = (val, context) => {
  const stack = context.stack;
  stack.push(new walk.Command(postProcessMap, val));
  for (const value of val.values()) {
    stack.push(value);
  }
};

function processSet(val, context) {
  const wrap = context.wrapSet;
  context.stackOut.push(wrap ? wrap(new Set(val)) : val);
}

const processOther = (val, context) => context.stackOut.push(val);

const registry = [
    walk.Command,
    function processCommand(val, context) {
      val.f(context);
    },
    Array,
    function processArray(val, context) {
      const stack = context.stack;
      stack.push(new walk.Command(postProcess, val));
      const descriptors = Object.getOwnPropertyDescriptors(val);
      delete descriptors.length;
      const keys = Object.keys(descriptors).concat(Object.getOwnPropertySymbols(descriptors));
      keys.forEach(key => {
        const d = descriptors[key];
        !(d.get || d.set) && stack.push(d.value);
      });
    },
    Variable,
    processOther,
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
addType(Set, processSet);
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

const preprocess = (source, options) => {
  options = options || empty;

  const context = options.context || {},
    stackOut = [];
  context.stackOut = stackOut;
  context.wrapObject = options.openObjects && open;
  context.wrapArray = options.openArrays && open;
  context.wrapMap = options.openMaps && open;
  context.wrapSet = options.openSets && open;

  walk(source, {
    processObject: options.processObject || processObject,
    processOther: options.processOther || processOther,
    registry: options.registry || preprocess.registry,
    filters: options.filters || preprocess.filters,
    circular: options.circular,
    context: context
  });

  // ice.assert(stackOut.length == 1);
  return stackOut[0];
};
preprocess.registry = registry;
preprocess.filters = filters;

export {registry, filters};
export default preprocess;
