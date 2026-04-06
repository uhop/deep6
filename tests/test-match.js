import unify, {_, variable as v, open, soft, isSoft} from '../src/unify.js';
import preprocess from '../src/traverse/preprocess.js';
import {submit, TEST} from './harness.js';

export default [
  function test_open_structures() {
    eval(TEST('unify({a: 1, b: 2, c: 3}, open({a: 1}))'));
    eval(TEST('unify(open({a: 1}), {a: 1, b: 2, c: 3})'));
    eval(TEST('unify([1, 2, 3], open([1,2]))'));
    eval(TEST('unify(open([1, 2]), [1, 2, 3])'));
    eval(TEST('unify(open({a: 1}), open({b: 2}))'));
    eval(TEST('unify(open([1]), open([1, 2]))'));
  },
  function test_open_sets() {
    if (typeof Set != 'function') return;
    eval(TEST('unify(new Set([1, 2, 3]), open(new Set([3, 1])))'));
  },
  function test_soft_sets() {
    if (typeof Set != 'function') return;
    const set1 = new Set();
    eval(TEST('unify(new Set([1, 2, 3]), soft(set1))'));
    eval(TEST('unify(new Set([1, 2, 3]), set1)'));
    const set2 = new Set([5]);
    eval(TEST('unify(new Set([1, 2, 3]), soft(set2))'));
    eval(TEST('unify(new Set([1, 2, 3, 5]), set2)'));
    const set3 = new Set([4]),
      set4 = new Set([5]);
    eval(TEST('!unify(set3, set4)'));
    eval(TEST('unify(soft(set3), soft(set4))'));
    eval(TEST('unify(set3, set4)'));
  },
  function test_open_maps() {
    if (typeof Map != 'function') return;
    eval(TEST('unify(new Map([["a", 1], ["b", 2], ["c", 3]]), open(new Map([["a", 1], ["c", 3]])))'));
  },
  function test_soft_maps() {
    if (typeof Map != 'function') return;
    const map1 = new Map();
    eval(TEST('unify(new Map([["a", 1], ["b", 2], ["c", 3]]), soft(map1))'));
    eval(TEST('unify(new Map([["a", 1], ["b", 2], ["c", 3]]), map1)'));
    const map2 = new Map([['e', 5]]);
    eval(TEST('unify(open(new Map([["a", 1], ["b", 2], ["c", 3]])), soft(map2))'));
    eval(TEST('unify(new Map([["a", 1], ["b", 2], ["c", 3], ["e", 5]]), map2)'));
    const map3 = new Map([['d', 4]]),
      map4 = new Map([['e', 5]]);
    eval(TEST('!unify(map3, map4)'));
    eval(TEST('unify(soft(map3), soft(map4))'));
    eval(TEST('unify(map3, map4)'));
  },
  function test_soft_structures() {
    const x = v('x');
    let result = unify([soft({a: 1}), soft({b: 2})], soft([x, x]));
    eval(TEST('result'));
    eval(TEST('isSoft(x.get(result))'));
    eval(TEST("x.get(result).type === 'soft'"));
    eval(TEST('unify(x.get(result).object, {a: 1, b: 2})'));
    result = unify([soft({a: 1}), x], soft([x, soft({b: 2})]));
    eval(TEST('result'));
    eval(TEST('isSoft(x.get(result))'));
    eval(TEST("x.get(result).type === 'soft'"));
    eval(TEST('unify(x.get(result).object, {a: 1, b: 2})'));
  },
  function test_soft_presets() {
    const x = v('x'),
      env = unify(x, soft({}));
    let result = unify([1], [x], env);
    eval(TEST('!result'));
    result = unify([open({a: 1}), open({b: 2})], [x, x], env);
    eval(TEST('result'));
    eval(TEST('isSoft(x.get(result))'));
    eval(TEST("x.get(result).type === 'soft'"));
    eval(TEST('unify(x.get(env).object, {a: 1, b: 2})'));
  },
  function test_complex_structures() {
    const x = v('x'),
      y = v('y');
    const tree = {
      value: 0,
      left: {
        value: 1,
        left: {
          value: 3
        },
        right: {
          value: 4
        }
      },
      right: {
        value: 2,
        left: null,
        right: {
          value: 3
        }
      }
    };
    const result = unify(tree, {
      value: x,
      left: open({left: y}),
      right: open({right: y})
    });
    eval(TEST('result'));
    eval(TEST('x.get(result) === 0'));
    eval(TEST('unify(y.get(result), {value: 3})'));
  },
  function test_preprocess() {
    const s = Symbol(),
      l = {
        x: 5,
        y: {
          a: 42,
          b: {},
          c: [1, 2, 3],
          d: s
        },
        z: 'ah!',
        [s]: 42
      },
      r = {
        y: {
          b: {},
          d: s
        },
        z: 'ah!',
        [s]: 99
      };
    let result = unify(l, r);
    eval(TEST('!result'));
    result = unify(l, preprocess(r));
    eval(TEST('!result'));
    result = unify(l, preprocess(r, {openObjects: true}));
    eval(TEST('result'));
    result = unify(l.y, {c: [1, 2]});
    eval(TEST('!result'));
    result = unify(l.y, preprocess({c: [1, 2]}));
    eval(TEST('!result'));
    result = unify(l.y, preprocess({c: [1, 2]}, {openArrays: true}));
    eval(TEST('!result'));
    result = unify(l.y, preprocess({c: [1, 2]}, {openObjects: true, openArrays: true}));
    eval(TEST('result'));
    result = unify(l, preprocess(r, {openObjects: true, symbols: true}), {symbols: true});
    eval(TEST('!result'));
    const a = {x: 42},
      b = {};
    a.a = a;
    b.a = b;
    result = unify(a, preprocess(b, {openObjects: true, circular: true}), {circular: true});
    eval(TEST('result'));
  }
];
