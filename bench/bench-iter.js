const keyDepth = Symbol.for('deep6.env.depth');

const buildU = symCount => {
  const u = Object.create(null);
  u[keyDepth] = 0;
  for (let i = 0; i < symCount; ++i) u[Symbol('u' + i)] = 1;
  return u;
};

const collectSymbols = object => {
  const symbols = new Set();
  while (object && typeof object == 'object') {
    Object.getOwnPropertySymbols(object).forEach(symbol => symbols.add(symbol));
    object = Object.getPrototypeOf(object);
  }
  symbols.delete(keyDepth);
  return Array.from(symbols);
};

const us2 = Array.from({length: 32}, () => buildU(2));
const us4 = Array.from({length: 32}, () => buildU(4));
const us8 = Array.from({length: 32}, () => buildU(8));

const consumeForEach = (syms, sink, val) => syms.forEach(k => (sink[k] = val));

const consumeForOf = (syms, sink, val) => {
  for (const k of syms) sink[k] = val;
};

const consumeArith = (syms, sink, val) => {
  for (let i = 0, l = syms.length; i < l; ++i) sink[syms[i]] = val;
};

const driveForEach = (us, n) => {
  const sink = Object.create(null);
  for (let i = 0; i < n; ++i) consumeForEach(collectSymbols(us[i & 31]), sink, i);
  return sink;
};

const driveForOf = (us, n) => {
  const sink = Object.create(null);
  for (let i = 0; i < n; ++i) consumeForOf(collectSymbols(us[i & 31]), sink, i);
  return sink;
};

const driveArith = (us, n) => {
  const sink = Object.create(null);
  for (let i = 0; i < n; ++i) consumeArith(collectSymbols(us[i & 31]), sink, i);
  return sink;
};

export default {
  forEach_n2: n => driveForEach(us2, n),
  forOf_n2: n => driveForOf(us2, n),
  arith_n2: n => driveArith(us2, n),
  forEach_n4: n => driveForEach(us4, n),
  forOf_n4: n => driveForOf(us4, n),
  arith_n4: n => driveArith(us4, n),
  forEach_n8: n => driveForEach(us8, n),
  forOf_n8: n => driveForOf(us8, n),
  arith_n8: n => driveArith(us8, n)
};
