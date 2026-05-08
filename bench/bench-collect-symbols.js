const keyDepth = Symbol.for('deep6.env.depth');

const buildU = symCount => {
  const u = Object.create(null);
  u[keyDepth] = 0;
  for (let i = 0; i < symCount; ++i) u[Symbol('u' + i)] = 1;
  return u;
};

const us = Array.from({length: 32}, () => buildU(2));

const collectOriginal = object => {
  const symbols = new Set();
  while (object && typeof object == 'object') {
    Object.getOwnPropertySymbols(object).forEach(symbol => symbols.add(symbol));
    object = Object.getPrototypeOf(object);
  }
  symbols.delete(keyDepth);
  return Array.from(symbols);
};

const collectGenSet = function* (object) {
  const symbols = new Set();
  while (object && typeof object == 'object') {
    Object.getOwnPropertySymbols(object).forEach(symbol => symbols.add(symbol));
    object = Object.getPrototypeOf(object);
  }
  symbols.delete(keyDepth);
  yield* symbols;
};

const collectGenNoSet = function* (object) {
  while (object && typeof object == 'object') {
    const own = Object.getOwnPropertySymbols(object);
    for (let i = 0; i < own.length; ++i) {
      if (own[i] !== keyDepth) yield own[i];
    }
    object = Object.getPrototypeOf(object);
  }
};

export default {
  original: n => {
    const sink = Object.create(null);
    for (let i = 0; i < n; ++i) {
      const u = us[i & 31];
      collectOriginal(u).forEach(k => (sink[k] = 1));
    }
    return sink;
  },
  genSet: n => {
    const sink = Object.create(null);
    for (let i = 0; i < n; ++i) {
      const u = us[i & 31];
      for (const k of collectGenSet(u)) sink[k] = 1;
    }
    return sink;
  },
  genNoSet: n => {
    const sink = Object.create(null);
    for (let i = 0; i < n; ++i) {
      const u = us[i & 31];
      for (const k of collectGenNoSet(u)) sink[k] = 1;
    }
    return sink;
  }
};
