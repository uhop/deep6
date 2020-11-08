import {Env, Unifier, Variable} from '../unify.js';
import walk, {
  processOther,
  processCircular,
  processMap,
  postMapCircular,
  buildNewMap,
  processObject,
  postObjectCircular,
  getObjectData,
  buildNewObject,
  processVariable,
  processCommand
} from './walk.js';

const empty = {};

function postProcess(context) {
  const {descriptors, keys} = getObjectData(this.s, context);
  buildNewObject(this.s, descriptors, keys, context.stackOut);
}

function postProcessSeen(context) {
  const {descriptors, keys} = getObjectData(this.s, context);
  postObjectCircular(this.s, descriptors, keys, context);
}

function postProcessMap(context) {
  buildNewMap(this.s.keys(), context.stackOut);
}

function postProcessMapSeen(context) {
  postMapCircular(this.s, context);
}

const registry = [
    walk.Command,
    processCommand,
    Array,
    processObject(postProcess, postProcessSeen),
    Variable,
    processVariable,
    Unifier,
    processOther,
    Date,
    (val, context) => context.stackOut.push(new Date(val.getTime())),
    RegExp,
    (val, context) => context.stackOut.push(new RegExp(val.source, (val.global ? 'g' : '') + (val.multiline ? 'm' : '') + (val.ignoreCase ? 'i' : ''))),
    Map,
    processMap(postProcessMap, postProcessMapSeen),
    Promise,
    processOther
  ],
  filters = [];

// add more types

const addType = (Type, process) => registry.push(Type, process || ((val, context) => context.stackOut.push(new Type(val))));

addType(Set);

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
    processObject: options.processObject || processObject(postProcess, postProcessSeen),
    processOther: options.processOther || processOther,
    processCircular: options.processCircular || processCircular,
    registry: options.registry || clone.registry,
    filters: options.filters || clone.filters,
    circular: options.circular,
    symbols: options.symbols,
    allProps: options.allProps,
    context: context
  });

  // ice.assert(stackOut.length == 1);
  return stackOut[0];
};
clone.registry = registry;
clone.filters = filters;

export {registry, filters};
export default clone;
