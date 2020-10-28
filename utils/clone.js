import unify from '../main.js';
import walk from './walk.js';

const empty = {};

function postArray(context) {
  const stackOut = context.stackOut,
    t = [];
  for (let i = 0, s = this.s, l = s.length; i < l; ++i) {
    if (s.hasOwnProperty(i)) {
      t[i] = stackOut.pop();
    }
  }
  stackOut.push(t);
}

function postObject(context) {
  const stackOut = context.stackOut,
    t = {},
    s = this.s;
  for (let k in s) {
    if (s.hasOwnProperty(k)) {
      t[k] = stackOut.pop();
    }
  }
  stackOut.push(t);
}

const processObject = (val, context) => {
  if (val === unify._) {
    context.stackOut.push(s);
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

var registry = [
    walk.Command,
    function processCommand(val, context) {
      val.f(context);
    },
    Array,
    function processArray(val, context) {
      const stack = context.stack;
      stack.push(new walk.Command(postArray, val));
      for (let i = 0, l = val.length; i < l; ++i) {
        if (val.hasOwnProperty(i)) {
          stack.push(val[i]);
        }
      }
    },
    unify.Variable,
    function processVariable(val, context) {
      const env = context.env;
      if (val.bound(env)) {
        context.stack.push(val.get(env));
      } else {
        context.stackOut.push(val);
      }
    },
    unify.Unifier,
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

const clone = (source, env, opt) => {
  opt = opt || empty;

  const context = opt.context || {},
    stackOut = [];
  context.stackOut = stackOut;
  context.env = env;

  walk(source, {
    processObject: opt.processObject || processObject,
    processOther: opt.processOther || processOther,
    registry: opt.registry || clone.registry,
    filters: opt.filters || clone.filters,
    context: context
  });

  // ice.assert(stackOut.length == 1);
  return stackOut[0];
};
clone.registry = registry;
clone.filters = filters;

export default clone;
