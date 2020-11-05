import {Unifier, Variable, open} from '../unify.js';
import walk from './walk.js';

const empty = {};

const postProcess = (init, wrapper) =>
  function (context) {
    const stackOut = context.stackOut,
      wrap = context[wrapper],
      s = this.s,
      t = init;
    Object.keys(s).forEach(k => (t[k] = stackOut.pop()));
    stackOut.push(wrap ? wrap(t) : t);
  };

const processObject = (val, context) => {
  const stack = context.stack;
  stack.push(new walk.Command(postProcess({}, 'wrapObject'), val));
  Object.keys(val).forEach(k => stack.push(val[k]));
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
      stack.push(new walk.Command(postProcess([], 'wrapArray'), val));
      Object.keys(val).forEach(k => stack.push(val[k]));
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

typeof Map == 'function' && addType(Map, processMap);
typeof Set == 'function' && addType(Set, processSet);
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
    context: context
  });

  // ice.assert(stackOut.length == 1);
  return stackOut[0];
};
preprocess.registry = registry;
preprocess.filters = filters;

export {registry, filters};
export default preprocess;
