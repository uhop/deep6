import equal, {clone, match, isShape, any, _} from '../src/index.js';
import replaceVars from '../src/utils/replaceVars.js';
import unify, {variable as v} from '../src/unify.js';
import {submit, TEST} from './harness.js';

export default [
  function test_equal() {
    eval(TEST('equal({a: 1, b: 2}, {b: 2, a: 1})'));
    eval(TEST('!equal({a: 1}, {a: 2})'));
    eval(TEST('equal([1, 2, 3], [1, 2, 3])'));
    eval(TEST('!equal([1, 2], [1, 2, 3])'));
    eval(TEST('equal(null, null)'));
    eval(TEST('equal(NaN, NaN)'));
    eval(TEST('!equal(1, "1")'));
    eval(TEST('equal(new Date(2024, 0, 1), new Date(2024, 0, 1))'));
    eval(TEST('equal(new Map([["a", 1]]), new Map([["a", 1]]))'));
    eval(TEST('equal(new Set([1, 2]), new Set([1, 2]))'));
  },
  function test_equal_circular() {
    const a = {},
      b = {};
    a.self = a;
    b.self = b;
    eval(TEST('equal(a, b)'));
  },
  function test_equal_options() {
    eval(TEST('equal(0, -0)'));
    eval(TEST('!equal(0, -0, {signedZero: true})'));
    eval(TEST('!equal(() => {}, () => {})'));
    eval(TEST('equal(() => {}, () => {}, {ignoreFunctions: true})'));
    eval(TEST("!equal(1, '1')"));
    eval(TEST("equal(1, '1', {loose: true})"));
    const s = Symbol();
    eval(TEST('equal({[s]: 1}, {[s]: 1}, {symbols: true})'));
  },
  function test_equal_url() {
    if (typeof URL != 'function') return;
    eval(TEST("equal(new URL('https://example.com/'), new URL('https://example.com/'))"));
    eval(TEST("!equal(new URL('https://example.com/'), new URL('https://other.com/'))"));
  },
  function test_match_url() {
    if (typeof URL != 'function') return;
    eval(TEST("match({link: new URL('https://example.com/')}, {link: new URL('https://example.com/')})"));
    eval(TEST("!match({link: new URL('https://example.com/')}, {link: new URL('https://other.com/')})"));
  },
  function test_clone_url_in_object() {
    if (typeof URL != 'function') return;
    const source = {link: new URL('https://example.com/path')};
    const result = clone(source);
    eval(TEST('result.link instanceof URL'));
    eval(TEST('result.link !== source.link'));
    eval(TEST('result.link.href === source.link.href'));
    eval(TEST('equal(source, result)'));
  },
  function test_match_api() {
    eval(TEST('match({a: 1, b: 2}, {a: 1})'));
    eval(TEST('!match({a: 1}, {a: 1, b: 2})'));
    eval(TEST('match({a: 1, b: 2}, {a: any})'));
    eval(TEST('match({a: 1, b: 2}, {a: _})'));
    eval(TEST('match([1, 2, 3], [1, 2, 3])'));
    eval(TEST('!match([1, 2], [1, 2, 3])'));
    eval(TEST('match(new Map([["a", 1], ["b", 2]]), new Map([["a", 1]]))'));
    eval(TEST('match(new Set([1, 2, 3]), new Set([1, 2]))'));
  },
  function test_clone_api() {
    const source = {a: 1, b: [2, 3], c: {d: 4}};
    const result = clone(source);
    eval(TEST('equal(source, result)'));
    eval(TEST('result !== source'));
    eval(TEST('result.b !== source.b'));
    eval(TEST('result.c !== source.c'));
  },
  function test_isShape() {
    eval(TEST('isShape === match'));
    eval(TEST('isShape({a: 1, b: 2}, {a: 1})'));
  },
  function test_any_wildcard() {
    eval(TEST('any === _'));
    eval(TEST('typeof any === "symbol"'));
  },
  function test_replaceVars() {
    const x = v('x'),
      y = v('y'),
      val = v('val'),
      env = unify(
        {
          val: 3,
          pos: [1, 2]
        },
        {
          val: val,
          pos: [x, y]
        }
      );
    eval(TEST('env'));
    eval(TEST('x.isBound(env)'));
    eval(TEST('unify(x, 1, env)'));
    eval(TEST('y.isBound(env)'));
    eval(TEST('unify(y, 2, env)'));
    eval(TEST('val.isBound(env)'));
    eval(TEST('unify(val, 3, env)'));
    eval(TEST('replaceVars(env)`${x} + ${y} = ${val}` === "1 + 2 = 3"'));
  }
];
