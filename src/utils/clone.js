import {Unifier, Variable} from '../unify.js';
import walk from './walk.js';

const empty = {};

const postProcess = init =>
  function (context) {
    const stackOut = context.stackOut,
      t = init;
    Object.keys(this.s).forEach(k => (t[k] = stackOut.pop()));
    stackOut.push(t);
  };

const processObject = (val, context) => {
  const stack = context.stack;
  stack.push(new walk.Command(postProcess({}), val));
  Object.keys(val).forEach(k => stack.push(val[k]));
};

const postProcessMap = context => {
  const stackOut = context.stackOut,
    t = new Map();
  for (const key of this.s.keys()) {
    t.set(key, stackOut.pop());
  }
  stackOut.push(t);
};

const processMap = (val, context) => {
  const stack = context.stack;
  stack.push(new walk.Command(postProcessMap, val));
  for (const value of val) {
    stack.push(value);
  }
};

const registry = [
    walk.Command,
    function processCommand(val, context) {
      val.f(context);
    },
    Array,
    function processArray(val, context) {
      const stack = context.stack;
      stack.push(new walk.Command(postProcess([]), val));
      Object.keys(val).forEach(k => stack.push(val[k]));
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

// add more exotic types

const addType = (Type, process) => typeof Type == 'function' && registry.push(Type, process || ((val, context) => context.stackOut.push(new Type(val))));

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

// main

const clone = (source, env, options) => {
  options = options || empty;

  const context = options.context || {},
    stackOut = [];
  context.stackOut = stackOut;
  context.env = env;

  walk(source, {
    processObject: options.processObject || processObject,
    processOther: options.processOther || processOther,
    registry: options.registry || clone.registry,
    filters: options.filters || clone.filters,
    context: context
  });

  // ice.assert(stackOut.length == 1);
  return stackOut[0];
};
clone.registry = registry;
clone.filters = filters;

export {registry, filters};
export default clone;
