import {Unifier, Variable, _, open} from '../unify.js';
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

const postProcessMap = (wrapper) =>
  function (context) {
    const stackOut = context.stackOut,
      wrap = context[wrapper],
      t = new Map();
    for (const key of this.s.keys()) {
      t.set(key, stackOut.pop());
    }
    stackOut.push(wrap ? wrap(t) : t);
  };

const processMap = (val, context) => {
  const stack = context.stack;
  stack.push(new walk.Command(postProcessMap('wrapMap'), val));
  for (const value of val.values()) {
    stack.push(value);
  }
};

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

const addType = (Type, process) => typeof Type == 'function' && registry.push(Type, process || processOther);

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

const preprocess = (source, options) => {
  options = options || empty;

  const context = options.context || {},
    stackOut = [];
  context.stackOut = stackOut;
  context.wrapObject = options.openObjects && open;
  context.wrapArray = options.openArrays && open;
  context.wrapMap = options.openMaps && open;

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

export default preprocess;
