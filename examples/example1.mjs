import equal, {match, clone, any} from 'deep6';

const x = {a: 1, b: 2, c: ['hi!', 42, null, {}]};

// deep equality
console.log(equal(x, {b: 2, a: 1, c: ['hi!', 42, null, {}]})); // true
console.log(equal(x, {b: 2, a: 1, c: ['hi!', 42, null, {z: 1}]})); // false

// match
console.log(match(x, {a: 1})); // true
console.log(match(x, {z: 1})); // false
console.log(match(x, {a: 1, c: any})); // true
console.log(match(x, {a: 1, c: []})); // false
console.log(match(x, {a: 1, d: any})); // false

// clone
const y = clone(x);
console.log(equal(x, y)); // true

// circular dependencies are fine
const z = {},
  w = {};
z.z = z;
w.z = w;
console.log(equal(z, w)); // true
console.log(equal(z, clone(w))); // true

// advanced: more standard types
const m = {a: new Map(), b: Buffer.from([99, 98, 97])};
m.a.set('a', [Symbol(), new Set([1, 2, 3])]);
m.a.set('b', [/^abc/i, new Date()]);
const n = clone(m);
console.log(equal(m, n)); // true

// advanced: symbols
const s = Symbol(),
  t = {[s]: 42, [Symbol.for('deep6')]: 33},
  u = {[s]: 42, [Symbol.for('deep6')]: 33};
console.log(equal(t, u, {symbols: true})); // true
const v = clone(u, {symbols: true});
console.log(equal(t, v, {symbols: true})); // true

// advanced: clone non-enumerable properties
const r = {a: 1};
Object.defineProperty(r, 'b', {value: 2, enumerable: false});
const q = clone(r, {allProps: true});
console.log(r === q); // false
console.log(equal(r, {a: 1})); // true
console.log(equal(r, {a: 1, b: 2})); // false
console.log(r.a === q.a); // true
console.log(r.b === q.b); // true
