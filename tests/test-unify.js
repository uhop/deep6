import unify, {_, variable as v, open} from '../src/unify.js';
import {submit, TEST} from './harness.js';

export default [
  function test_constants() {
    eval(TEST('unify(1, 1)'));
    eval(TEST('unify(0, 0)'));
    eval(TEST('unify(null, null)'));
    eval(TEST('unify(undefined, undefined)'));
    eval(TEST('unify(true, true)'));
    eval(TEST('unify(false, false)'));
    eval(TEST("unify('', '')"));
    eval(TEST("unify('1', '1')"));
    eval(TEST('unify(Infinity, Infinity)'));
    eval(TEST('unify(-Infinity, -Infinity)'));
    eval(TEST('unify(NaN, NaN)'));
    eval(TEST('!unify(1, 2)'));
    eval(TEST('!unify(1, true)'));
    eval(TEST("!unify(1, '1')"));
    eval(TEST('!unify(1, [])'));
    eval(TEST('!unify(1, {})'));
  },
  function test_anyvar() {
    eval(TEST('unify(_, 1)'));
    eval(TEST('unify(_, 2)'));
    eval(TEST('unify(_, true)'));
    eval(TEST("unify(_, '1')"));
    eval(TEST('unify(_, [])'));
    eval(TEST('unify(_, {})'));
    eval(TEST('unify(1, _)'));
    eval(TEST('unify(2, _)'));
    eval(TEST('unify(true, _)'));
    eval(TEST("unify('1', _)"));
    eval(TEST('unify([], _)'));
    eval(TEST('unify({}, _)'));
  },
  function test_exact_arrays() {
    eval(TEST('unify([], [])'));
    eval(TEST('unify([1], [1])'));
    eval(TEST('unify([1,2], [1,2])'));
    eval(TEST('!unify([], [1])'));
    eval(TEST('!unify([1], [2])'));
    eval(TEST('!unify([2,1], [1,2])'));
    eval(TEST('unify([1,_,3], [_,2,_])'));
    eval(TEST('unify([_,_,3], [1,_,_])'));
    eval(TEST('unify([[]], [[]])'));
    eval(TEST('unify([[], []], [[], []])'));
    eval(TEST('unify([1,,3], [1,,3])'));
    eval(TEST('!unify([1,,3], [1,2,3])'));
  },
  function test_exact_objects() {
    eval(TEST('unify({}, {})'));
    eval(TEST('unify({a: 1}, {a: 1})'));
    eval(TEST('unify({a: 1, b: 2}, {b: 2, a: 1})'));
    eval(TEST('!unify({}, {a: 1})'));
    eval(TEST('!unify({a: 1}, {a: 2})'));
    eval(TEST('!unify({a: 1}, {b: 1})'));
    eval(TEST('unify({a: _, b: 2}, {a: 1, b: _})'));
    eval(TEST('unify({a: {a: 1}, b: 2}, {a: {a: 1}, b: 2})'));
    eval(TEST('!unify({a: {a: 1}, b: 2}, {a: {a: 3}, b: 2})'));
    eval(TEST('!unify({a: {a: 1}, b: 2}, {a: {a: 1}, b: 3})'));
  },
  function test_variables() {
    const values = env => {
      const all = {};
      for (const {name, value} of env.getAllValues()) all[name] = value;
      return all;
    };
    let result = unify(1, 1);
    eval(TEST('result && unify(values(result), {})'));
    result = unify(1, _);
    eval(TEST('result && unify(values(result), {})'));
    result = unify(1, v('x'));
    eval(TEST('result'));
    eval(TEST('unify(values(result), {x: 1})'));
    eval(TEST("v('x').isBound(result)"));
    eval(TEST("v('x').get(result) === 1"));
    result = unify(v('y'), v('x'));
    eval(TEST('result'));
    eval(TEST('unify(values(result), {})'));
    eval(TEST("!v('x').isBound(result)"));
    eval(TEST("!v('y').isBound(result)"));
    eval(TEST("v('x').isAlias('y', result)"));
    eval(TEST("v('y').isAlias('x', result)"));
    eval(TEST("!v('x').isAlias('z', result)"));
    eval(TEST("!v('y').isAlias('z', result)"));
    result = unify(v('y'), _);
    eval(TEST('result && unify(values(result), {})'));
    result = unify([1, v('x')], [v('y'), 2]);
    eval(TEST('result'));
    eval(TEST('unify(values(result), {x: 2, y: 1})'));
    eval(TEST("v('x').isBound(result)"));
    eval(TEST("v('x').get(result) === 2"));
    eval(TEST("v('y').isBound(result)"));
    eval(TEST("v('y').get(result) === 1"));
    result = unify({a: 1, b: v('x')}, {a: v('y'), b: 2});
    eval(TEST('result'));
    eval(TEST('unify(values(result), {x: 2, y: 1})'));
    eval(TEST("v('x').isBound(result)"));
    eval(TEST("v('x').get(result) === 2"));
    eval(TEST("v('y').isBound(result)"));
    eval(TEST("v('y').get(result) === 1"));
    result = unify({a: 1, b: v('x')}, {a: v('y'), c: 2});
    eval(TEST('!result'));
    result = unify({c: 1, b: v('x')}, {a: v('y'), b: 2});
    eval(TEST('!result'));
  },
  function test_unify_circular() {
    const diamond1 = {},
      diamond2 = {};
    diamond1.a = diamond1.b = {};
    diamond2.a = diamond2.b = {};
    eval(TEST('unify(diamond1, diamond2, null, {circular: true})'));
    diamond2.b = {};
    eval(TEST('unify(diamond1, diamond2, null, {circular: true})'));
    eval(TEST("unify(diamond1, diamond2, null, {circular: 'closure'})"));
    eval(TEST("!unify(diamond1, diamond2, null, {circular: 'graph'})"));

    const circle1 = {},
      circle2 = {};
    circle1.a = circle1;
    circle2.a = circle2;
    eval(TEST('unify(circle1, circle2, null, {circular: true})'));

    circle2.a = circle1;
    eval(TEST('unify(circle1, circle2, null, {circular: true})'));
    eval(TEST("!unify(circle1, circle2, null, {circular: 'closure'})"));
    eval(TEST("!unify(circle1, circle2, null, {circular: 'graph'})"));
    circle2.a = circle2;

    circle1.b = {c: circle1};
    circle2.b = {c: circle2};
    eval(TEST('unify(circle1, circle2, null, {circular: true})'));
    circle2.a = {a: 1};
    eval(TEST('!unify(circle1, circle2, null, {circular: true})'));
  },
  function test_unify_shared_references() {
    const t = {v: 1};
    eval(TEST('unify([t, t], [{v: 1}, {v: 1}], null, {circular: true})'));
    eval(TEST('unify([{v: 1}, {v: 1}], [t, t], null, {circular: true})'));
    eval(TEST('unify([t, t], [t, {v: 1}], null, {circular: true})'));
    const e = {v: 1};
    eval(TEST('unify([t, t], [e, e], null, {circular: true})'));
    eval(TEST('!unify([t, t], [{v: 1}, {v: 2}], null, {circular: true})'));
    eval(TEST('!unify([t, t], [{v: 2}, {v: 1}], null, {circular: true})'));
    const deep = {a: {b: {c: 42}}};
    eval(TEST('unify({x: deep, y: deep}, {x: {a: {b: {c: 42}}}, y: {a: {b: {c: 42}}}}, null, {circular: true})'));
    eval(TEST('!unify({x: deep, y: deep}, {x: {a: {b: {c: 42}}}, y: {a: {b: {c: 43}}}}, null, {circular: true})'));
    eval(TEST("unify([t, t], [{v: 1}, {v: 1}], null, {circular: 'closure'})"));
    eval(TEST("!unify([t, t], [{v: 1}, {v: 1}], null, {circular: 'graph'})"));
  },
  function test_unify_cycle_geometry() {
    const cycle1 = {};
    cycle1.x = cycle1;
    const cycle1too = {};
    cycle1too.x = cycle1too;
    const cycle2 = {x: {}};
    cycle2.x.x = cycle2;
    const cycle2too = {x: {}};
    cycle2too.x.x = cycle2too;
    const cycle1three = {};
    cycle1three.x = cycle1three;
    eval(TEST('unify(cycle1, cycle1too, null, {circular: true})'));
    eval(TEST('unify(cycle2, cycle2too, null, {circular: true})'));
    eval(TEST('unify(cycle1, cycle2, null, {circular: true})'));
    eval(TEST("unify(cycle1, cycle2, null, {circular: 'bisimulation'})"));
    eval(TEST("!unify(cycle1, cycle2, null, {circular: 'closure'})"));
    eval(TEST("!unify(cycle2, cycle1, null, {circular: 'closure'})"));
    eval(TEST("!unify(cycle1, cycle2, null, {circular: 'graph'})"));
    eval(TEST('unify(cycle1, cycle1, null, {circular: true})'));
    eval(TEST('!unify(cycle1, {x: {x: {}}}, null, {circular: true})'));
    eval(TEST("!unify(cycle1, {x: {x: {}}}, null, {circular: 'closure'})"));
    eval(TEST("!unify(cycle1, {x: {x: {}}}, null, {circular: 'graph'})"));
    const shared = {a: cycle1, b: cycle1},
      copies = {a: cycle1too, b: cycle1three};
    eval(TEST('unify(shared, copies, null, {circular: true})'));
    eval(TEST("unify(shared, copies, null, {circular: 'closure'})"));
    eval(TEST("!unify(shared, copies, null, {circular: 'graph'})"));
    let l = {v: 1},
      r = {v: 1},
      bad = {v: 2};
    for (let i = 0; i < 30; ++i) {
      l = {a: l, b: l};
      r = {a: r, b: r};
      bad = {a: bad, b: bad};
    }
    eval(TEST('unify(l, r, null, {circular: true})'));
    eval(TEST("unify(l, r, null, {circular: 'closure'})"));
    eval(TEST('!unify(l, bad, null, {circular: true})'));
  },
  function test_unify_flags() {
    eval(TEST('unify(0, -0)'));
    eval(TEST('!unify(0, -0, null, {signedZero: true})'));
    eval(TEST('!unify(() => {}, () => {})'));
    eval(TEST('unify(() => {}, () => {}, null, {ignoreFunctions: true})'));
  },
  function test_loose() {
    eval(TEST('!unify([42], ["42"])'));
    eval(TEST('unify([42], ["42"], null, {loose: true})'));
  },
  function test_symbols() {
    const a = {[Symbol()]: 1},
      b = {[Symbol()]: 1};
    eval(TEST('!unify(a, b, {symbols: true})'));
    const s = Symbol(),
      c = {[s]: 1},
      d = {[s]: 1};
    eval(TEST('unify(c, d, {symbols: true})'));
    const e = {[Symbol.for('x')]: 1},
      f = {[Symbol.for('x')]: 1};
    eval(TEST('unify(e, f, {symbols: true})'));
    const g = {a: Symbol()},
      h = {a: Symbol()};
    eval(TEST('!unify(g, h, {symbols: true})'));
    const i = {a: s},
      j = {a: s};
    eval(TEST('unify(i, j, {symbols: true})'));
    const k = {a: Symbol.for('x')},
      l = {a: Symbol.for('x')};
    eval(TEST('unify(k, l, {symbols: true})'));
  },
  function test_nullProto() {
    const x = Object.create(null),
      y = Object.create(null),
      z = Object.create(null);
    ((x.a = 1), (x.b = []), (x.c = null));
    ((y.a = 1), (y.b = []), (y.c = null));
    ((z.a = 2), (z.b = []), (z.c = null));

    let env = unify(x, y);
    eval(TEST('env'));
    env = unify(x, {c: null, b: [], a: 1});
    eval(TEST('env'));
    env = unify(y, {c: null, b: [], a: 1});
    eval(TEST('env'));
    env = unify(x, z);
    eval(TEST('!env'));
    env = unify(x, {c: null, b: [], a: 2});
    eval(TEST('!env'));
  },
  function test_generations() {
    const x = {a: 1, b: 2},
      y = {a: 1, c: 3},
      z = {a: 1, d: 4},
      va = v(),
      vd = v();
    let env = unify(x, {a: va, b: 2});
    eval(TEST('env'));
    eval(TEST('va.isBound(env)'));
    eval(TEST('va.get(env) === 1'));
    env.push();
    const nextEnv = unify(y, {a: va, d: vd}, env);
    eval(TEST('!nextEnv'));
    env.pop();
    env.push();
    env = unify(z, {a: va, d: vd}, env);
    eval(TEST('env'));
    eval(TEST('va.isBound(env)'));
    eval(TEST('va.get(env) === 1'));
    eval(TEST('vd.isBound(env)'));
    eval(TEST('vd.get(env) === 4'));
  }
];
