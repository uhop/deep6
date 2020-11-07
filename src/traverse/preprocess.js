import {Unifier, Variable, open} from '../unify.js';
import walk, {Circular, setObject, processOther, processCircular, processMap, postMapCircular, buildNewMap, processObject} from './walk.js';

const empty = {};

function postProcess(context) {
  const {stackOut, symbols} = context,
    s = this.s,
    isArray = s instanceof Array,
    descriptors = Object.getOwnPropertyDescriptors(s);
  if (isArray) delete descriptors.length;
  const wrap = context[isArray ? 'wrapArray' : 'wrapObject'],
    t = isArray ? [] : Object.create(Object.getPrototypeOf(s));
  let keys = Object.keys(descriptors);
  if (symbols) keys = keys.concat(Object.getOwnPropertySymbols(descriptors));
  for (const key of keys) {
    const d = descriptors[key];
    if (!(d.get || d.set)) {
      d.value = stackOut.pop();
    }
    Object.defineProperty(t, key, d);
  }
  stackOut.push(wrap ? wrap(t) : t);
}

function postProcessSeen(context) {
  const {stackOut, seen, symbols} = context,
    s = this.s,
    isArray = s instanceof Array,
    descriptors = Object.getOwnPropertyDescriptors(s);
  if (isArray) delete descriptors.length;
  const wrap = context[isArray ? 'wrapArray' : 'wrapObject'],
    t = isArray ? [] : Object.create(Object.getPrototypeOf(s));
  let keys = Object.keys(descriptors);
  if (symbols) keys = keys.concat(Object.getOwnPropertySymbols(descriptors));
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
  const o = wrap ? wrap(t) : t;
  setObject(seen, this.s, o);
  stackOut.push(o);
}

function postProcessMap(context) {
  buildNewMap(this.s.keys(), context.stackOut, context.wrapMap);
}

function postProcessMapSeen(context) {
  postMapCircular(this.s, context);
}

function processSet(val, context) {
  const wrap = context.wrapSet;
  context.stackOut.push(wrap ? wrap(new Set(val)) : val);
}

const registry = [
    walk.Command,
    function processCommand(val, context) {
      val.f(context);
    },
    Array,
    processObject(postProcess, postProcessSeen),
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

addType(Map, processMap(postProcessMap, postProcessMapSeen));
addType(Set, processSet);
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

const preprocess = (source, options) => {
  options = options || empty;

  const context = options.context || {},
    stackOut = [];
  context.stackOut = stackOut;
  context.seen = options.circular ? new Map() : null;
  context.wrapObject = options.openObjects && open;
  context.wrapArray = options.openArrays && open;
  context.wrapMap = options.openMaps && open;
  context.wrapSet = options.openSets && open;

  walk(source, {
    processObject: options.processObject || processObject(postProcess, postProcessSeen),
    processOther: options.processOther || processOther,
    processCircular: options.processCircular || processCircular,
    registry: options.registry || preprocess.registry,
    filters: options.filters || preprocess.filters,
    circular: options.circular,
    symbols: options.symbols,
    context: context
  });

  // ice.assert(stackOut.length == 1);
  return stackOut[0];
};
preprocess.registry = registry;
preprocess.filters = filters;

export {registry, filters};
export default preprocess;
