const empty = {};

const nop = () => {};

class Command {
  constructor(f, s) {
    this.f = f;
    this.s = s;
  }
}

const processCommand = (val, context) => val.f(context);

const processObject = (val, context) => {
  const stack = context.stack;
  for (let k in val) {
    if (val.hasOwnProperty(k)) {
      stack.push(val[k]);
    }
  }
};

const processArray = (val, context) => {
  const stack = context.stack;
  for (let i = 0, l = val.length; i < l; ++i) {
    if (val.hasOwnProperty(i)) {
      stack.push(val[i]);
    }
  }
};

const defaultRegistry = [Command, processCommand, Array, processArray, Date, nop, RegExp, nop],
  defaultFilters = [];

const walk = (o, options) => {
  // non-recursive stack-based walk about an object tree
  options = options || empty;
  const doObject = options.processObject || processObject,
    doOther = options.processOther || nop,
    registry = options.registry || defaultRegistry,
    filters = options.filters || defaultFilters,
    context = options.context || {},
    stack = [o];
  context.stack = stack;
  main: while (stack.length) {
    o = stack.pop();
    if (o && typeof o == 'object') {
      // process registered constructors
      for (let i = 0; i < registry.length; i += 2) {
        if (o instanceof registry[i]) {
          registry[i + 1](o, context);
          continue main;
        }
      }
      // process registered filters
      for (let i = 0; i < filters.length; ++i) {
        if (filters[i](o, context)) continue main;
      }
      // process naked objects
      doObject(o, context);
      continue;
    }
    doOther(o, context);
  }
};

walk.Command = Command;

export default walk;
