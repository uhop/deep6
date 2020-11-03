import {_, isVariable} from '../env.js';

// utilities

export const fail = () => false;
export const halt = (env, goals, stack) => (stack.splice(0), false);
export const cut = sys => (env, goals, stack) => {
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
export const call = X => (env, goals) => {
  let term = X,
    name,
    args;
  if (isVariable(X)) {
    if (!X.isBound(env)) return false;
    term = X.get(env);
  }
  if (typeof term == 'string') {
    name = term;
  } else {
    if (!term || typeof term != 'object') return false;
    name = term.name;
    args = term.args;
    if (isVariable(name)) {
      name = name.get(env);
    }
    if (typeof name != 'string') return false;
    if (isVariable(args)) {
      args = args.get(env);
    }
    if (args && !Array.isArray(args)) return false;
  }
  return {terms: [{name, args}], index: 0, next: goals};
};

export const isBound = (...args) => env => args.every(V => isVariable(V) && V.isBound(env));

export const head = (...args) => ({args});
export const term = (name, ...args) => ({name, args});

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
    if (value instanceof Tail) throw new Error('list cannot contain a tail argument in the middle');
    list = {value, next: list};
  }
  return list;
};
export const listHead = (...args) => {
  if (args.length < 2) throw new Error('list constructor cannot have less then 2 elements');
  let startFrom = args.length - 1,
    list = args[startFrom];
  for (let i = startFrom - 1; i >= 0; --i) {
    list = {value: args[i], next: list};
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
  notEq: [(X, ...sys) => [head(X, X), cut(sys), fail], [_]],
  // unify is eq

  // control predicates
  call: X => [head(X), call(X)],
  not: [(X, ...sys) => [head(X), call(X), cut(sys), fail], () => [head()]],
  isUnifiable: (X, Y) => [head(X, Y), term('not', term('not', term('eq', [X, Y])))],
  // notUnifiable is notEq
  conjunction: [() => [head(null)], (X, Xt) => [head(listHead(X, Xt)), call(X), term('conjunction', Xt)]],
  disjunction: [X => [head(listHead(X, _)), call(X)], Xt => [head(listHead(_, Xt)), term('disjunction', Xt)]],
  true: () => [head()],
  once: (X, ...sys) => [head(X), call(X), cut(sys)],

  // meta predicates
  // apply, applyp

  // extended logic
  counterExample: (A, B) => [head(A, B), call(A), term('not', B)],
  implies: (A, B) => [head(A, B), term('not', term('counterExample', A, B))],

  // second-order logic
  // map, filter, foldl, foldr, compose, converse
  map: [() => [head(_, null, null)], (F, X, Xt, Y, Yt) => [head(F, listHead(X, Xt), listHead(Y, Yt)), call(term(F, X, Y)), term('map', Xt, Yt)]],
  filter: [
    () => [head(_, null, null)],
    (P, X, Xt, Yt) => [head(P, listHead(X, Xt), listHead(X, Yt)), term(P, X), term('filter', Xt, Yt)],
    (P, X, Xt, Yt) => [head(P, listHead(X, Xt), listHead(X, Yt)), term('not', term(P, X)), term('filter', Xt, Yt)]
  ],
  foldl: [A => [head(_, A, null, A)], (F, A, X, Xt, O, B) => [head(F, A, listHead(X, Xt), Yt), call(term(F, A, X, B)), term('foldl', F, B, Xt, O)]],
  foldr: [A => [head(_, A, null, A)], (F, A, X, Xt, O, T) => [head(F, A, listHead(X, Xt), O), term('foldr', F, A, Xt, T), call(term(F, X, T, O))]],
  compose: (F, G, X, O, T) => [head(F, G, X, O), call(term(G, X, T)), call(term(F, T, O))],
  converse: (F, X, Y, O) => [head(F, X, Y, O), call(term(F, Y, X, O))]
};
rules.unify = rules.eq;
rules.notUnifiable = rules.notEq;
