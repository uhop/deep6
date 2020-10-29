import unify from '../main.js';
import walk from './walk.js';

const empty = {};

function postArray(context) {
  const stackOut = context.stackOut,
    s = this.s;
  let l = s.length,
    j = stackOut.length - 1;
  for (let i = 0; i < l; ++i) {
    if (s.hasOwnProperty(i)) {
      s[i] = stackOut[j--];
    }
  }
  l = stackOut.length - 1 - j;
  if (l) {
    stackOut.splice(-l, l, s);
  } else {
    stackOut.push(s);
  }
}

function postObject(context) {
  const stackOut = context.stackOut,
    s = this.s;
  let j = stackOut.length - 1;
  for (let k in s) {
    if (s.hasOwnProperty(k)) {
      s[k] = stackOut[j--];
    }
  }
  const l = stackOut.length - 1 - j;
  if (l) {
    stackOut.splice(-l, l, s);
  } else {
    stackOut.push(s);
  }
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
    processOther,
    Date,
    processOther,
    RegExp,
    processOther
  ],
  filters = [];

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

export default deref;
