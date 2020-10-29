import unify from '../unify.js';
import walk from './walk.js';

const empty = {};

const postProcess = (init, wrapper) =>
  function (context) {
    const stackOut = context.stackOut,
      wrap = context[wrapper],
      s = this.s,
      t = init;
    Object.keys(s).forEach(k => (t[k] = stackOut.pop()));
    stackOut.push(wrap ? wrap(t) : t);
  };

const processObject = (val, context) => {
  if (val === unify._) {
    context.stackOut.push(val);
  } else {
    const stack = context.stack;
    stack.push(new walk.Command(postProcess({}, 'wrapObject'), val));
    Object.keys(val).forEach(k => stack.push(val[k]));
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
      if (val === unify._) {
        context.stackOut.push(val);
      } else {
        const stack = context.stack;
        stack.push(new walk.Command(postProcess([], 'wrapArray'), val));
        Object.keys(val).forEach(k => stack.push(val[k]));
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

const preprocess = (source, options) => {
  options = options || empty;

  const context = options.context || {},
    stackOut = [];
  context.stackOut = stackOut;
  context.wrapObject = options.openObjects && unify.open;
  context.wrapArray = options.openArrays && unify.open;

  walk(source, {
    processObject: options.processObject || processObject,
    processOther: options.processOther || processOther,
    registry: options.registry || preprocess.registry,
    filters: options.filters || preprocess.filters,
    context: context
  });

  // ice.assert(stackOut.length == 1);
  return stackOut[0];
};
preprocess.registry = registry;
preprocess.filters = filters;

export default preprocess;
