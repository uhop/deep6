import {Env, Unifier, Variable} from '../unify.js';
import walk, {processOther, processMap, replaceObject, processObject} from './walk.js';

const empty = {};

function postProcess(context) {
  const {stackOut, symbols} = context,
    s = this.s,
    descriptors = Object.getOwnPropertyDescriptors(s);
  if (s instanceof Array) delete descriptors.length;
  let keys = Object.keys(descriptors);
  if (symbols) keys = keys.concat(Object.getOwnPropertySymbols(descriptors));
  let j = stackOut.length - 1;
  for (const key of keys) {
    const d = descriptors[key];
    if (!(d.get || d.set)) {
      d.value = stackOut.pop();
      Object.defineProperty(s, key, d);
    }
  }
  const l = stackOut.length - 1 - j;
  if (l) {
    stackOut.splice(-l, l, s);
  } else {
    stackOut.push(s);
  }
}

function postProcessMap(context) {
  const stackOut = context.stackOut,
    s = this.s;
  let j = stackOut.length - 1;
  for (const key of s) {
    s.set(key, stackOut[j--]);
  }
  replaceObject(j, s, stackOut);
}

const registry = [
    walk.Command,
    function processCommand(val, context) {
      val.f(context);
    },
    Array,
    processObject(postProcess),
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

addType(Map, processMap(postProcessMap));
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
  if (env && !(env instanceof Env)) {
    options = env;
    env = null;
  }
  options = options || empty;

  const context = options.context || {},
    stackOut = [];
  context.stackOut = stackOut;
  context.env = env;

  walk(source, {
    processObject: options.processObject || processObject(postProcess),
    processOther: options.processOther || processOther,
    processCircular: options.processCircular || processOther,
    registry: options.registry || deref.registry,
    filters: options.filters || deref.filters,
    circular: options.circular,
    symbols: options.symbols,
    context: context
  });

  // ice.assert(stackOut.length == 1);
  return stackOut[0];
};
deref.registry = registry;
deref.filters = filters;

export {registry, filters};
export default deref;
