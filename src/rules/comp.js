import {_} from '../env';
import {head, cut, fail, isBound} from './system.js';

const comparable = {string: 1, number: 1};

export const rules = {
  // comparisons
  lt: (X, Y) => [
    head(X, Y),
    isBound(X, Y),
    env => {
      const x = X.get(env),
        y = Y.get(env);
      if (x === _) return y === _ || comparable[typeof y] === 1;
      if (y === _) return comparable[typeof x] === 1;
      return typeof x == typeof y && comparable[typeof x] === 1 && x < y;
    }
  ],
  le: (X, Y) => [
    head(X, Y),
    isBound(X, Y),
    env => {
      const x = X.get(env),
        y = Y.get(env);
      if (x === _) return y === _ || comparable[typeof y] === 1;
      if (y === _) return comparable[typeof x] === 1;
      return typeof x == typeof y && comparable[typeof x] === 1 && x <= y;
    }
  ],
  gt: (X, Y) => [
    head(X, Y),
    isBound(X, Y),
    env => {
      const x = X.get(env),
        y = Y.get(env);
      if (x === _) return y === _ || comparable[typeof y] === 1;
      if (y === _) return comparable[typeof x] === 1;
      return typeof x == typeof y && comparable[typeof x] === 1 && x > y;
    }
  ],
  ge: (X, Y) => [
    head(X, Y),
    isBound(X, Y),
    env => {
      const x = X.get(env),
        y = Y.get(env);
      if (x === _) return y === _ || comparable[typeof y] === 1;
      if (y === _) return comparable[typeof x] === 1;
      return typeof x == typeof y && comparable[typeof x] === 1 && x >= y;
    }
  ],

  // miscellaneous
  nz: [(...sys) => [head(0), cut(sys), fail], (...sys) => [head(_), cut(sys)]]
};
