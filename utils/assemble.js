import unify from '../main.js';
import walk from './walk.js';

const empty = {};

function postArray(context) {
  const stackOut = context.stackOut,
    s = this.s;
  let l = s.length,
    j = stackOut.length - 1;
  main: {
    for (let i = 0; i < l; ++i) {
      if (s.hasOwnProperty(i)) {
        const t = stackOut[j--];
        if (typeof t == 'number' && isNaN(t) ? typeof s[i] == 'number' && !isNaN(s[i]) : s[i] !== t) break main;
      }
    }
    l = stackOut.length - 1 - j;
    if (l) {
      stackOut.splice(-l, l, s);
    } else {
      stackOut.push(s);
    }
    return;
  }
  const t = [];
  for (let i = 0; i < l; ++i) {
    if (s.hasOwnProperty(i)) {
      t[i] = stackOut.pop();
    }
  }
  stackOut.push(t);
}

function postObject(context) {
  const stackOut = context.stackOut,
    s = this.s;
  let j = stackOut.length - 1;
  main: {
    for (let k in s) {
      if (s.hasOwnProperty(k)) {
        const t = stackOut[j--];
        if (typeof t == 'number' && isNaN(t) ? typeof s[k] == 'number' && !isNaN(s[k]) : s[k] !== t) break main;
      }
    }
    const l = stackOut.length - 1 - j;
    if (l) {
      stackOut.splice(-l, l, s);
    } else {
      stackOut.push(s);
    }
    return;
  }
  const t = {};
  for (let k in s) {
    if (s.hasOwnProperty(k)) {
      t[k] = stackOut.pop();
    }
  }
  stackOut.push(t);
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

const assemble = (source, env, options) => {
  options = options || empty;

  const context = options.context || {},
    stackOut = [];
  context.stackOut = stackOut;
  context.env = env;

  walk(source, {
    processObject: options.processObject || processObject,
    processOther: options.processOther || processOther,
    registry: options.registry || assemble.registry,
    filters: options.filters || assemble.filters,
    context: context
  });

  // ice.assert(stackOut.length == 1);
  return stackOut[0];
};
assemble.registry = registry;
assemble.filters = filters;

export default assemble;
