import unify, {variable as v} from '../src/unify.js';
import walk from '../src/traverse/walk.js';
import clone from '../src/traverse/clone.js';
import assemble from '../src/traverse/assemble.js';
import deref from '../src/traverse/deref.js';
import {submit, TEST} from './harness.js';

export default [
  function test_walk() {
    const result = {};
    walk(
      {
        a: [1, true, [0, NaN, Infinity, Math.sin]],
        b: ['hello!', new Date(), /\d+/, {g: undefined}],
        c: null,
        d: {
          e: [],
          f: {}
        }
      },
      {
        processOther: function (s) {
          const t = typeof s;
          if (typeof result[t] != 'number') {
            result[t] = 0;
          }
          ++result[t];
        }
      }
    );
    const expected = {
      boolean: 1,
      number: 4,
      string: 1,
      function: 1,
      object: 1,
      undefined: 1
    };
    eval(TEST('unify(result, expected)'));
  },
  function test_clone() {
    const s = Symbol(),
      source = {
        a: [1, true, [0, NaN, Infinity, Math.sin]],
        b: ['hello!', new Date(), /\d+/, {g: undefined}],
        c: null,
        d: {
          e: [s],
          f: {},
          [s]: 42
        }
      };
    let result = clone(source);
    eval(TEST('result !== source'));
    eval(TEST('unify(result, source)'));
    eval(TEST('!unify(result, source, {symbols: true})'));
    result = clone(source, {symbols: true});
    eval(TEST('unify(result, source, {symbols: true})'));
    const left = v('left'),
      right = v('right');
    const env = unify(
      {left: left, right: right},
      {
        left: {left: 1, right: 2},
        right: {left: 8, right: 9}
      }
    );
    result = clone(
      {
        left: {
          left: left,
          right: {left: 3, right: 4}
        },
        right: {
          left: {left: 6, right: 7},
          right: right
        }
      },
      env
    );
    const expected = {
      left: {
        left: {left: 1, right: 2},
        right: {left: 3, right: 4}
      },
      right: {
        left: {left: 6, right: 7},
        right: {left: 8, right: 9}
      }
    };
    eval(TEST('unify(result, expected)'));
  },
  function test_clone_circular() {
    const a = {};
    a.a = a;
    const b = clone(a, null, {circular: true});
    eval(TEST('a !== b'));
    eval(TEST('b.a === b'));
    eval(TEST('unify(a, b, null, {circular: true})'));

    const x = {c: null, a: {b: {}}};
    x.c = x.a.b;
    const y = clone(x, null, {circular: true});
    eval(TEST('x !== y'));
    eval(TEST('y.c === y.a.b'));
    eval(TEST('unify(x, y, null, {circular: true})'));

    const z = new Map();
    z.set('a', z);
    const w = clone(z, null, {circular: true});
    eval(TEST('z !== w'));
    eval(TEST('w.get("a") === w'));
    eval(TEST('unify(z, w, null, {circular: true})'));
  },
  function test_clone_allProps() {
    const a = {};
    Object.defineProperties(a, {
      a: {value: 1, enumerable: true},
      b: {value: 2}
    });
    const b = clone(a);
    eval(TEST('b.a === a.a'));
    eval(TEST('b.b !== a.b'));
    const c = clone(a, {allProps: true});
    eval(TEST('c.a === a.a'));
    eval(TEST('c.b === a.b'));
  },
  function test_clone_map() {
    const source = new Map([
      ['a', {x: 1}],
      ['b', [2, 3]],
      ['c', new Date(2024, 0, 1)]
    ]);
    const result = clone(source);
    eval(TEST('result !== source'));
    eval(TEST('result instanceof Map'));
    eval(TEST('result.size === 3'));
    eval(TEST('unify(result.get("a"), {x: 1})'));
    eval(TEST('result.get("a") !== source.get("a")'));
    eval(TEST('unify(result.get("b"), [2, 3])'));
    eval(TEST('result.get("b") !== source.get("b")'));
  },
  function test_clone_set() {
    const source = new Set([1, 'hello', true]);
    const result = clone(source);
    eval(TEST('result !== source'));
    eval(TEST('result instanceof Set'));
    eval(TEST('result.size === 3'));
    eval(TEST('result.has(1)'));
    eval(TEST('result.has("hello")'));
    eval(TEST('result.has(true)'));
  },
  function test_clone_regexp_flags() {
    const source = /abc/gimsu;
    const result = clone(source);
    eval(TEST('result !== source'));
    eval(TEST('result instanceof RegExp'));
    eval(TEST('result.source === source.source'));
    eval(TEST('result.flags === source.flags'));
    eval(TEST('unify(source, result)'));
  },
  function test_clone_prototype() {
    class Foo {
      constructor(x) {
        this.x = x;
      }
    }
    const source = new Foo(42);
    const result = clone(source);
    eval(TEST('result !== source'));
    eval(TEST('result.x === 42'));
    eval(TEST('Object.getPrototypeOf(result) === Foo.prototype'));
  },
  function test_assemble() {
    let s = Symbol(),
      source = {
        a: [1, , null],
        b: {c: 'hey', d: s, [s]: 42}
      };
    let result = assemble(source);
    eval(TEST('result === source'));
    eval(TEST('unify(result, source)'));
    source = {x: [{y: false}]};
    const env = unify(v('x'), source);
    eval(TEST("v('x').isBound(env)"));
    eval(TEST("v('x').get(env) === source"));
    eval(TEST("unify(v('x').get(env), source)"));
    source = {z: v('x')};
    result = assemble(source, env);
    eval(TEST('result !== source'));
    eval(TEST('unify(result, source, env)'));
    eval(TEST('unify(result, {z: {x: [{y: false}]}})'));
    source = {[s]: v('x')};
    result = assemble(source, env, {symbols: true});
    eval(TEST('result !== source'));
    eval(TEST('unify(result, source, env, {symbols: true})'));
    eval(TEST('unify(result, {[s]: {x: [{y: false}]}}, {symbols: true})'));
  },
  function test_assemble_circular() {
    const X = v(),
      a = {},
      env = unify(X, a);
    a.a = X;
    let result = assemble(a, env, {circular: true});
    eval(TEST('result !== a'));
    eval(TEST('result.a === result'));
    const b = {};
    b.b = b;
    result = assemble(b, {circular: true});
    eval(TEST('unify(b, result, {circular: true})'));
  },
  function test_assemble_map() {
    const x = v('x');
    const source = new Map([
      ['a', 1],
      ['b', x]
    ]);
    const env = unify(x, 42);
    const result = assemble(source, env);
    eval(TEST('result instanceof Map'));
    eval(TEST('result.get("a") === 1'));
    eval(TEST('result.get("b") === 42'));
  },
  function test_deref() {
    let source = {
      a: [1, , null],
      b: {c: 'hey'}
    };
    let result = deref(source);
    eval(TEST('result === source'));
    eval(TEST('unify(result, source)'));
    source = {x: [{y: false}]};
    const env = unify(v('x'), source);
    eval(TEST("v('x').isBound(env)"));
    eval(TEST("v('x').get(env) === source"));
    eval(TEST("unify(v('x').get(env), source)"));
    source = {z: v('x')};
    result = deref(source, env);
    eval(TEST('result === source'));
    eval(TEST('unify(result, source, env)'));
    eval(TEST('unify(result, {z: {x: [{y: false}]}})'));
  },
  function test_deref_circular() {
    const a = {};
    a.a = a;
    let result = deref(a, {circular: true});
    eval(TEST('result === a'));
    eval(TEST('unify(result, a, {circular: true})'));
    const X = v(),
      b = {},
      env = unify(b, X);
    b.b = X;
    result = deref(b, env, {circular: true});
    eval(TEST('result === b'));
    eval(TEST('unify(result, b, {circular: true})'));
    eval(TEST('b.b === b'));
  },
  function test_deref_map() {
    const x = v('x');
    const source = new Map([
      ['a', 1],
      ['b', x]
    ]);
    const env = unify(x, 99);
    const result = deref(source, env);
    eval(TEST('result === source'));
    eval(TEST('source.get("a") === 1'));
    eval(TEST('source.get("b") === 99'));
  }
];
