import equal, {match, clone} from '../src/index.js';
import unify, {open, variable as v} from '../src/unify.js';
import {variable} from '../src/env.js';
import matchString from '../src/unifiers/matchString.js';
import matchInstanceOf from '../src/unifiers/matchInstanceOf.js';
import {submit, TEST} from './harness.js';

export default [
  function test_array_object_collision() {
    // arrays and plain objects with the same numeric keys must NOT unify
    eval(TEST('!equal([1, 2, 3], {0: 1, 1: 2, 2: 3})'));
    eval(TEST('!equal({0: 1, 1: 2, 2: 3}, [1, 2, 3])'));
    eval(TEST('!equal([], {})'));
    eval(TEST('!equal({}, [])'));
    eval(TEST('!unify([1, 2, 3], {0: 1, 1: 2, 2: 3})'));
  },
  function test_reused_unifier_under_circular() {
    const m = matchString(/\d+/);
    eval(TEST('match(["1", "2"], [m, m])'));
    eval(TEST('match(["1", "2", "3"], [m, m, m])'));
    eval(TEST('!match(["a", "1"], [m, m])'));

    const isObj = matchInstanceOf(Object);
    eval(TEST('match([{a: 1}, {b: 2}], [isObj, isObj])'));
  },
  function test_reused_atomic_under_circular() {
    const d = new Date(2026, 0, 1);
    const t = d.getTime();
    eval(TEST('equal([d, d], [new Date(t), new Date(t)])'));
    eval(TEST('equal({a: d, b: d}, {a: new Date(t), b: new Date(t)})'));

    const re = /abc/;
    eval(TEST('equal([re, re], [/abc/, /abc/])'));
    eval(TEST('equal({a: re, b: re}, {a: /abc/, b: /abc/})'));

    if (typeof URL == 'function') {
      const u = new URL('https://example.com/');
      eval(TEST('equal([u, u], [new URL("https://example.com/"), new URL("https://example.com/")])'));
    }
  },
  function test_clone_with_variable_no_env() {
    // clone() with a Variable in the source and no env must not crash
    const x = variable('x');
    const cloned = clone({a: x, b: [x, 1]});
    eval(TEST('cloned.a === x'));
    eval(TEST('cloned.b[0] === x'));
    eval(TEST('cloned.b[1] === 1'));
  },
  function test_match_open_arrays_default() {
    // match() should treat extra trailing array elements as OK by default
    eval(TEST('match([1, 2, 3], [1, 2])'));
    eval(TEST('match([1, 2, 3, 4], [1])'));
    eval(TEST('!match([1, 2], [1, 2, 3])')); // pattern still requires its keys
  },
  function test_circular_still_works() {
    // ensure cycle detection on plain objects/arrays still works after the fix
    const a = {};
    a.self = a;
    const b = {};
    b.self = b;
    eval(TEST('equal(a, b)'));

    if (typeof Map == 'function') {
      const m1 = new Map();
      m1.set('x', m1);
      const m2 = new Map();
      m2.set('x', m2);
      eval(TEST('equal(m1, m2)'));
    }

    // clone preserves cycle structure
    const cl = clone(a);
    eval(TEST('cl.self === cl'));
  },
  function test_matchstring_returns_boolean() {
    // matchString.unify must return a strict boolean (not a RegExpExecArray)
    const m = matchString(/\d+/);
    eval(TEST('m.unify("42", [], []) === true'));
    eval(TEST('m.unify("abc", [], []) === false'));
  },
  function test_matchinstanceof_returns_boolean() {
    // matchInstanceOf.unify must return a strict boolean
    const isDate = matchInstanceOf(Date);
    eval(TEST('isDate.unify(new Date(), [], []) === true'));
    eval(TEST('isDate.unify(null, [], []) === false'));
    eval(TEST('isDate.unify(0, [], []) === false'));
    eval(TEST('isDate.unify("", [], []) === false'));
  },
  function test_wrap_object_fallthrough_type_parity() {
    // Wrap.unify falls through to unifyObjects for non-array/Map/Set inputs.
    // An empty pattern ({}) used to trivially match any object whose own
    // enumerable keys are empty (Map, Set, Date, RegExp, Promise, ...) because
    // Object.keys returned [] and the compare loop never ran.
    eval(TEST('!match(new Map(), {})'));
    eval(TEST('!match({}, new Map())'));
    eval(TEST('!match(new Set(), {})'));
    eval(TEST('!match({}, new Set())'));
    eval(TEST('!match(new Date(), {})'));
    eval(TEST('!match({}, new Date())'));
    eval(TEST('!match(/abc/, {})'));
    eval(TEST('!match({}, /abc/)'));
    eval(TEST('!match(Promise.resolve(), {})'));

    // class instances of the same prototype still match when wrapped with open()
    class Foo {
      constructor(a) {
        this.a = a;
      }
    }
    const f1 = new Foo(1),
      f2 = new Foo(1),
      g = new Foo(2);
    eval(TEST('!!unify(open(f1), f2)'));
    eval(TEST('!unify(open(f1), g)'));
    // mixed class vs plain — kinds don't match, reject
    eval(TEST('!unify(open(f1), {a: 1})'));
    eval(TEST('!unify(open({a: 1}), f1)'));
  }
];
