import {Env, Unifier, Variable} from '../unify.js';
import walk, {
  processOther,
  processCircular,
  processMap,
  postMapCircular,
  buildNewMap,
  replaceObject,
  processObject,
  postObjectCircular,
  getObjectData,
  buildNewObject
} from './walk.js';

const empty = {};

function postProcess(context) {
  const stackOut = context.stackOut,
    s = this.s,
    {descriptors, keys} = getObjectData(s, context);
  let j = stackOut.length - 1;
  main: {
    const result = keys.some(k => {
      const d = descriptors[k];
      if (d.get || d.set) return false;
      const t = stackOut[j--];
      return typeof t == 'number' && isNaN(t) ? typeof s[k] == 'number' && !isNaN(s[k]) : s[k] !== t;
    });
    if (result) break main;
    replaceObject(j, s, stackOut);
    return;
  }
  buildNewObject(s, descriptors, keys, stackOut);
}

function postProcessSeen(context) {
  const stackOut = context.stackOut,
    s = this.s,
    {descriptors, keys} = getObjectData(s, context);
  let j = stackOut.length - 1;
  main: {
    const result = keys.some(k => {
      const d = descriptors[k];
      if (d.get || d.set) return false;
      const t = stackOut[j--];
      return typeof t == 'number' && isNaN(t) ? typeof s[k] == 'number' && !isNaN(s[k]) : s[k] !== t;
    });
    if (result) break main;
    replaceObject(j, s, stackOut);
    return;
  }
  postObjectCircular(s, descriptors, keys, context);
}

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
    replaceObject(j, s, stackOut);
    return;
  }
  buildNewMap(s.keys(), stackOut);
};

function postProcessMapSeen(context) {
  const stackOut = context.stackOut,
    s = this.s;
  let j = stackOut.length - 1;
  main: {
    const result = Array.from(s.values()).some(v => {
      const t = stackOut[j--];
      return typeof t == 'number' && isNaN(t) ? typeof v == 'number' && !isNaN(v) : v !== t;
    });
    if (result) break main;
    replaceObject(j, s, stackOut);
    return;
  }
  postMapCircular(s, context);
}

const registry = [
    walk.Command,
    function processCommand(val, context) {
      val.f(context);
    },
    Array,
    processObject(postProcess, postProcessSeen),
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

// add more types

const addType = (Type, process) => registry.push(Type, process || processOther);

addType(Map, processMap(postProcessMap, postProcessMapSeen));
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
    processObject: options.processObject || processObject(postProcess, postProcessSeen),
    processOther: options.processOther || processOther,
    processCircular: options.processCircular || processCircular,
    registry: options.registry || assemble.registry,
    filters: options.filters || assemble.filters,
    circular: options.circular,
    symbols: options.symbols,
    context: context
  });

  // ice.assert(stackOut.length == 1);
  return stackOut[0];
};
assemble.registry = registry;
assemble.filters = filters;

export {registry, filters};
export default assemble;
