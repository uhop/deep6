import {_} from '../env';
import {head} from './system.js';

export const rules = {
  // logical operations
  logicalAnd: (X, Y, Z) => [
    head(X, Y, Z),
    env => {
      const isX = X.isBound(env),
        isY = Y.isBound(env),
        isZ = Z.isBound(env),
        count = (isX ? 1 : 0) + (isY ? 1 : 0) + (isZ ? 1 : 0);
      if (count < 2) return false;
      if (count == 3) {
        const x = X.get(env),
          y = Y.get(env),
          z = X.get(env);
        if (x === _ || y === _ || z === _) return true;
        return !(x && y) === !z;
      }
      if (isX) {
        const x = X.get(env);
        if (isY) {
          const y = Y.get(env);
          if (x === _ || y === _) return true;
          env.bindVal(Z.name, !!(x && y));
          return true;
        }
        return false;
      }
      return false;
    }
  ],
  logicalOr: (X, Y, Z) => [
    head(X, Y, Z),
    env => {
      const isX = X.isBound(env),
        isY = Y.isBound(env),
        isZ = Z.isBound(env),
        count = (isX ? 1 : 0) + (isY ? 1 : 0) + (isZ ? 1 : 0);
      if (count < 2) return false;
      if (count == 3) {
        const x = X.get(env),
          y = Y.get(env),
          z = X.get(env);
        if (x === _ || y === _ || z === _) return true;
        return !(x || y) === !z;
      }
      if (isX) {
        const x = X.get(env);
        if (isY) {
          const y = Y.get(env);
          if (x === _ || y === _) return true;
          env.bindVal(Z.name, !!(x || y));
          return true;
        }
        return false;
      }
      return false;
    }
  ],
  logicalXor: (X, Y, Z) => [
    head(X, Y, Z),
    env => {
      const isX = X.isBound(env),
        isY = Y.isBound(env),
        isZ = Z.isBound(env),
        count = (isX ? 1 : 0) + (isY ? 1 : 0) + (isZ ? 1 : 0);
      if (count < 2) return false;
      if (count == 3) {
        const x = X.get(env),
          y = Y.get(env),
          z = X.get(env);
        if (x === _ || y === _ || z === _) return true;
        return (!!x ^ !!y) === !!z;
      }
      if (isX) {
        const x = X.get(env);
        if (isY) {
          const y = Y.get(env);
          if (x === _ || y === _) return true;
          env.bindVal(Z.name, !!(!!x ^ !!y));
          return true;
        }
        const z = Z.get(env);
        if (x === _ || z === _) return true;
        env.bindVal(Y.name, !!(!!x ^ !!z));
        return true;
      }
      const y = Y.get(env),
        z = Z.get(env);
      if (y === _ || z === _) return true;
      env.bindVal(X.name, !!(!!y ^ !!z));
      return true;
    }
  ],
  logicalNot: (X, Y) => [
    head(X, Y),
    env => {
      const isX = X.isBound(env),
        isY = Y.isBound(env);
      count = (isX ? 1 : 0) + (isY ? 1 : 0);
      if (count < 1) return false;
      if (count == 2) {
        const x = X.get(env),
          y = Y.get(env);
        if (x === _ || y === _) return true;
        return !x === !!y;
      }
      if (isX) {
        const x = X.get(env);
        if (x === _) return true;
        env.bindVal(Y.name, !x);
        return true;
      }
      const y = Y.get(env);
      if (y === _) return true;
      env.bindVal(X.name, !y);
      return true;
    }
  ]
};
