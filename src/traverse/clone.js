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

const processPromise = (val, context) => context.stackOut.push(val.then(value => value, error => Promise.reject(error)));

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
