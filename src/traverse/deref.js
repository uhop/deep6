import {Unifier, Variable} from '../unify.js';
import walk from './walk.js';

const empty = {};

function postProcess(context) {
  const stackOut = context.stackOut,
    s = this.s;
  let j = stackOut.length - 1;
  Object.keys(s).forEach(k => (s[k] = stackOut[j--]));
  const l = stackOut.length - 1 - j;
  if (l) {
    stackOut.splice(-l, l, s);
  } else {
    stackOut.push(s);
  }
}

const processObject = (val, context) => {
  const stack = context.stack;
  stack.push(new walk.Command(postProcess, val));
  Object.keys(val).forEach(k => stack.push(val[k]));
};

function postProcessMap(context) {
  const stackOut = context.stackOut,
    s = this.s;
  let j = stackOut.length - 1;
  for (const key of s) {
    s.set(key, stackOut[j--]);
  }
  const l = stackOut.length - 1 - j;
  if (l) {
    stackOut.splice(-l, l, s);
  } else {
    stackOut.push(s);
  }
}

const processMap = (val, context) => {
  const stack = context.stack;
  stack.push(new walk.Command(postProcessMap, val));
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
      stack.push(new walk.Command(postProcess, val));
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

const deref = (source, env, options) => {
  options = options || empty;

  const context = options.context || {},
    stackOut = [];
  context.stackOut = stackOut;
  context.env = env;

  walk(source, {
    processObject: options.processObject || processObject,
    processOther: options.processOther || processOther,
    registry: options.registry || deref.registry,
    filters: options.filters || deref.filters,
    context: context
  });

  // ice.assert(stackOut.length == 1);
  return stackOut[0];
};
deref.registry = registry;
deref.filters = filters;

export {registry, filters};
export default deref;
