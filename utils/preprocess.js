import unify from '../main.js';
import walk from './walk.js';

const empty = {};

function postArray(context) {
  const stackOut = context.stackOut,
    wrapArray = context.wrapArray,
    s = this.s,
    l = s.length,
    t = [];
  for (let i = 0; i < l; ++i) {
    if (s.hasOwnProperty(i)) {
      t[i] = stackOut.pop();
    }
  }
  stackOut.push(wrapArray ? wrapArray(t) : t);
}

function postObject(context) {
  const stackOut = context.stackOut,
    wrapObject = context.wrapObject,
    t = {},
    s = this.s;
  for (let k in s) {
    if (s.hasOwnProperty(k)) {
      t[k] = stackOut.pop();
    }
  }
  stackOut.push(wrapObject ? wrapObject(t) : t);
}

const processObject = (val, context) => {
  if (val === unify._) {
    context.stackOut.push(val);
  } else {
    const stack = context.stack;
    stack.push(new walk.Command(postObject, val));
    for (let k in val) {
      if (val.hasOwnProperty(k)) {
        stack.push(val[k]);
      }
    }
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
      const stack = context.stack,
        l = val.length;
      stack.push(new walk.Command(postArray, val));
      for (let i = 0; i < l; ++i) {
        if (val.hasOwnProperty(i)) {
          stack.push(val[i]);
        }
      }
    },
    unify.Variable,
    processOther,
    unify.Unifier,
    processOther,
    Date,
    processOther,
    RegExp,
    processOther
  ],
  filters = [];

const preprocess = (source, nonExactObjects, nonExactArrays, opt) => {
  opt = opt || empty;

  const context = opt.context || {},
    stackOut = [];
  context.stackOut = stackOut;
  context.wrapObject = nonExactObjects && unify.open;
  context.wrapArray = nonExactArrays && unify.open;

  walk(source, {
    processObject: opt.processObject || processObject,
    processOther: opt.processOther || processOther,
    registry: opt.registry || preprocess.registry,
    filters: opt.filters || preprocess.filters,
    context: context
  });

  // ice.assert(stackOut.length == 1);
  return stackOut[0];
};
preprocess.registry = registry;
preprocess.filters = filters;

export default preprocess;
