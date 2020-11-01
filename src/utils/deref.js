import {Unifier, Variable, _} from '../unify.js';
import walk from './walk.js';

const empty = {};

function postProcess(context) {
  const stackOut = context.stackOut,
    s = this.s;
  let j = stackOut.length - 1;
  Object.keys(s).forEach(k => (s[k] = stackOut[j--]));
  const l = stackOut.length - 1 - j;
  if (l) {
    stackOut.splice(-l, l, s);
  } else {
    stackOut.push(s);
  }
}

const processObject = (val, context) => {
  if (val === _) {
    context.stackOut.push(val);
  } else {
    const stack = context.stack;
    stack.push(new walk.Command(postProcess, val));
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
      if (val === _) {
        context.stackOut.push(val);
      } else {
        const stack = context.stack;
        stack.push(new walk.Command(postProcess, val));
        Object.keys(val).forEach(k => stack.push(val[k]));
      }
    },
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
