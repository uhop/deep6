const keyDepth = Symbol.for('deep6.env.depth');

const buildU = symCount => {
  const u = Object.create(null);
  u[keyDepth] = 0;
  for (let i = 0; i < symCount; ++i) u[Symbol('u' + i)] = 1;
  return u;
};

const us1 = Array.from({length: 32}, () => buildU(1));
const us2 = Array.from({length: 32}, () => buildU(2));
const us4 = Array.from({length: 32}, () => buildU(4));

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

const runOriginal = (n, us) => {
  const sink = Object.create(null);
  for (let i = 0; i < n; ++i) {
    const u = us[i & 31];
    collectOriginal(u).forEach(k => (sink[k] = 1));
  }
  return sink;
};

const runGenSet = (n, us) => {
  const sink = Object.create(null);
  for (let i = 0; i < n; ++i) {
    const u = us[i & 31];
    for (const k of collectGenSet(u)) sink[k] = 1;
  }
  return sink;
};

const runGenNoSet = (n, us) => {
  const sink = Object.create(null);
  for (let i = 0; i < n; ++i) {
    const u = us[i & 31];
    for (const k of collectGenNoSet(u)) sink[k] = 1;
  }
  return sink;
};

export default {
  original_n1: n => runOriginal(n, us1),
  genSet_n1: n => runGenSet(n, us1),
  genNoSet_n1: n => runGenNoSet(n, us1),
  original_n2: n => runOriginal(n, us2),
  genSet_n2: n => runGenSet(n, us2),
  genNoSet_n2: n => runGenNoSet(n, us2),
  original_n4: n => runOriginal(n, us4),
  genSet_n4: n => runGenSet(n, us4),
  genNoSet_n4: n => runGenNoSet(n, us4)
};
