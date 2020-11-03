import {_, isVariable} from '../env';

// utilities

export const cut = sys => (env, stack) => {
  const lastFrame = sys[0].get(env);
  for (let i = stack.length - 1; i >= 0; --i) {
    const frame = stack[i];
    if (frame.command === 2) {
      frame.index = Infinity;
    }
    if (frame === lastFrame) break;
  }
  return true;
};
export const fail = () => false;
export const halt = (env, stack) => (stack.splice(0), false);

export const head = (...args) => ({args});
export const term = (name, ...args) => ({name, args});

export const isBound = (...args) => env => args.every(V => isVariable(V) && V.isBound(env));

class Tail {
  constructor(value) {
    this.value = value;
  }
}

export const rest = list => new Tail(list);

export const list = (...args) => {
  if (!args.length) return null;
  let list = null,
    startFrom = args.length - 1;
  const last = args[startFrom];
  if (last instanceof Tail) {
    --startFrom;
    list = last.value;
  }
  for (let i = startFrom; i >= 0; --i) {
    const value = args[i];
    if (value instanceof Tail) throw new Error(`list cannot contain a tail argument in the middle`);
    list = {value, next: list};
  }
  return list;
};

// rules

export const rules = {
  // types
  isVar: X => [head(X), env => !X.isBound(env)],
  isNonVar: X => [head(X), env => X.isBound(env)],
  isNumber: X => [head(X), env => X.isBound(env) && typeof X.get(env) == 'number'],
  isString: X => [head(X), env => X.isBound(env) && typeof X.get(env) == 'string'],
  isNull: X => [head(X), env => X.isBound(env) && X.get(env) === null],
  isUndefined: X => [head(X), env => X.isBound(env) && X.get(env) === undefined],
  isArray: X => [head(X), env => X.isBound(env) && Array.isArray(X.get(env))],

  // equality
  eq: X => head(X, X),
  notEq: [(X, ...sys) => [head(X, X), cut(sys), fail], [_]]
};
