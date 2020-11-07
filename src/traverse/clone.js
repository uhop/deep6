import {Env, Unifier, Variable} from '../unify.js';
import walk, {
  Circular,
  setObject,
  processOther,
  processCircular,
  processMap,
  postMapCircular,
  buildNewMap,
  processObject,
  getObjectData,
  buildNewObject
} from './walk.js';

const empty = {};

function postProcess(context) {
  const {descriptors, keys} = getObjectData(this.s, context);
  buildNewObject(this.s, descriptors, keys, context.stackOut);
}

function postProcessSeen(context) {
  const {stackOut, seen} = context,
    s = this.s,
    isArray = s instanceof Array;
  const {descriptors, keys} = getObjectData(this.s, context);
  const t = isArray ? [] : Object.create(Object.getPrototypeOf(s));
  setObject(seen, this.s, t);
  for (const k of keys) {
    const d = descriptors[k];
    if (d.get || d.set) {
      Object.defineProperty(t, k, d);
      continue;
    }
    const value = stackOut.pop();
    if (!(value instanceof Circular)) {
      d.value = value;
      Object.defineProperty(t, k, d);
      continue;
    }
    const record = seen.get(value.value);
    if (record) {
      if (record.actions) {
        record.actions.push([t, k]);
        d.value = null;
      } else {
        d.value = record.value;
      }
      Object.defineProperty(t, k, d);
      continue;
    }
    seen.set(value.value, {actions: [[t, k]]});
    d.value = null;
    Object.defineProperty(t, k, d);
  }
  stackOut.push(t);
}

function postProcessMap(context) {
  buildNewMap(this.s.keys(), context.stackOut);
}

function postProcessMapSeen(context) {
  postMapCircular(this.s, context);
}

const processPromise = (val, context) =>
  context.stackOut.push(
    val.then(
      value => value,
      error => Promise.reject(error)
    )
  );

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

// add more types

const addType = (Type, process) => registry.push(Type, process || ((val, context) => context.stackOut.push(new Type(val))));

addType(Map, processMap(postProcessMap, postProcessMapSeen));
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
    registry: options.registry || clone.registry,
    filters: options.filters || clone.filters,
    circular: options.circular,
    symbols: options.symbols,
    context: context
  });

  // ice.assert(stackOut.length == 1);
  return stackOut[0];
};
clone.registry = registry;
clone.filters = filters;

export {registry, filters};
export default clone;
