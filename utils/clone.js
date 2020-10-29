import unify from '../main.js';
import walk from './walk.js';

const empty = {};

const postProcess = init =>
  function (context) {
    const stackOut = context.stackOut,
      t = init;
    Object.keys(this.s).forEach(k => (t[k] = stackOut.pop()));
    stackOut.push(t);
  };

const processObject = (val, context) => {
  if (val === unify._) {
    context.stackOut.push(s);
  } else {
    const stack = context.stack;
    stack.push(new walk.Command(postProcess({}), val));
    Object.keys(val).forEach(k => stack.push(val[k]));
  }
};

const registry = [
    walk.Command,
    function processCommand(val, context) {
      val.f(context);
    },
    Array,
    function processArray(val, context) {
      if (val === unify._) {
        context.stackOut.push(val);
      } else {
        const stack = context.stack;
        stack.push(new walk.Command(postProcess([]), val));
        Object.keys(val).forEach(k => stack.push(val[k]));
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

const clone = (source, env, options) => {
  options = options || empty;

  const context = options.context || {},
    stackOut = [];
  context.stackOut = stackOut;
  context.env = env;

  walk(source, {
    processObject: options.processObject || processObject,
    processOther: options.processOther || processOther,
    registry: options.registry || clone.registry,
    filters: options.filters || clone.filters,
    context: context
  });

  // ice.assert(stackOut.length == 1);
  return stackOut[0];
};
clone.registry = registry;
clone.filters = filters;

export default clone;
