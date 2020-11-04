import {Unifier, Variable} from '../unify.js';
import walk from './walk.js';

const empty = {};

const postProcess = init =>
  function (context) {
    const stackOut = context.stackOut,
      s = this.s;
    let j = stackOut.length - 1;
    main: {
      const result = Object.keys(s).some(k => {
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
    const t = init;
    Object.keys(s).forEach(k => (t[k] = stackOut.pop()));
    stackOut.push(t);
  };

const processObject = (val, context) => {
  const stack = context.stack;
  stack.push(new walk.Command(postProcess({}), val));
  Object.keys(val).forEach(k => stack.push(val[k]));
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
    context: context
  });

  // ice.assert(stackOut.length == 1);
  return stackOut[0];
};
assemble.registry = registry;
assemble.filters = filters;

export default assemble;
