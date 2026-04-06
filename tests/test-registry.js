import unify, {_, open} from '../src/unify.js';
import {submit, TEST} from './harness.js';

export default [
  function test_regexes() {
    eval(TEST('unify(/\\b\\w+\\b/, /\\b\\w+\\b/)'));
    eval(TEST('!unify(/\\b\\w+\\b/m, /\\b\\w+\\b/)'));
    eval(TEST('!unify(/\\b\\w+\\b/m, /\\b\\w+\\b/g)'));
    eval(TEST('!unify(/\\b\\w+\\b/, /\\b\\w+\\b/i)'));
    eval(TEST('!unify(/\\b\\w+\\b/, 1)'));
    eval(TEST("unify(/\\b\\w+\\b/, new RegExp('\\\\b\\\\w+\\\\b'))"));
  },
  function test_regex_flags() {
    eval(TEST('unify(/abc/s, /abc/s)'));
    eval(TEST('!unify(/abc/s, /abc/)'));
    eval(TEST('unify(/abc/u, /abc/u)'));
    eval(TEST('!unify(/abc/u, /abc/)'));
    eval(TEST('unify(/abc/y, /abc/y)'));
    eval(TEST('!unify(/abc/y, /abc/)'));
    eval(TEST('unify(/abc/gi, /abc/gi)'));
    eval(TEST('!unify(/abc/gi, /abc/g)'));
    eval(TEST('unify(/abc/gimsuy, /abc/gimsuy)'));
    eval(TEST('!unify(/abc/gims, /abc/gim)'));
  },
  function test_dates() {
    eval(TEST('unify(new Date(2013, 6, 4), new Date(2013, 6, 4))'));
    eval(TEST('!unify(new Date(2013, 6, 4), new Date(2012, 6, 4))'));
    eval(TEST('!unify(new Date(2013, 6, 4), new Date(2013, 6, 4, 6))'));
    eval(TEST('unify(new Date(2013, 6, 4, 6), new Date(2013, 6, 4, 6))'));
  },
  function test_typed_arrays() {
    if (typeof ArrayBuffer != 'function' || typeof DataView != 'function') return;
    const buffer = new ArrayBuffer(256),
      view = new DataView(buffer);

    const pattern = [1, -1, 42, 1, -1];
    const testTypedArray = (Type, name, conversion = Number) => {
      for (let i = 0; i < pattern.length; ++i) {
        view['set' + name](i * Type.BYTES_PER_ELEMENT, conversion(pattern[i]));
      }
      eval(TEST(`unify(new ${Type.name}(buffer, ${0 * Type.BYTES_PER_ELEMENT}, 2), open(new ${Type.name}(buffer, ${3 * Type.BYTES_PER_ELEMENT}, 2)))`));
      eval(TEST(`!unify(new ${Type.name}(buffer, ${0 * Type.BYTES_PER_ELEMENT}, 2), open(new ${Type.name}(buffer, ${2 * Type.BYTES_PER_ELEMENT}, 2)))`));
    };

    typeof Int8Array == 'function' && testTypedArray(Int8Array, 'Int8');
    typeof Uint8Array == 'function' && testTypedArray(Uint8Array, 'Uint8');
    typeof Uint8ClampedArray == 'function' && testTypedArray(Uint8ClampedArray, 'Uint8');
    typeof Int16Array == 'function' && testTypedArray(Int16Array, 'Int16');
    typeof Uint16Array == 'function' && testTypedArray(Uint16Array, 'Uint16');
    typeof Int32Array == 'function' && testTypedArray(Int32Array, 'Int32');
    typeof Uint32Array == 'function' && testTypedArray(Uint32Array, 'Uint32');
    typeof Float32Array == 'function' && testTypedArray(Float32Array, 'Float32');
    typeof Float64Array == 'function' && testTypedArray(Float64Array, 'Float64');
    typeof BigInt == 'function' && typeof BigInt64Array == 'function' && testTypedArray(BigInt64Array, 'BigInt64', BigInt);
    typeof BigInt == 'function' && typeof BigUint64Array == 'function' && testTypedArray(BigUint64Array, 'BigUint64', BigInt);

    const view2 = new DataView(buffer);
    eval(TEST(`unify(view, view)`));
    eval(TEST(`unify(view, view2)`));

    const buffer2 = buffer.slice(0);
    eval(TEST(`unify(buffer, buffer)`));
    eval(TEST(`unify(buffer, buffer2)`));
  },
  function test_sets() {
    if (typeof Set != 'function') return;
    const set1 = new Set(),
      set2 = new Set();

    eval(TEST('unify(set1, set1)'));
    eval(TEST('unify(set2, set2)'));

    set1.add(1).add(2).add(3);
    set2.add(1).add(2);

    eval(TEST('!unify(set1, set2)'));

    set2.add(3);

    eval(TEST('unify(set1, set2)'));
    eval(TEST('unify(set2, set1)'));
  },
  function test_maps() {
    if (typeof Map != 'function') return;
    const map1 = new Map(),
      map2 = new Map();

    eval(TEST('unify(map1, map1)'));
    eval(TEST('unify(map2, map2)'));

    map1.set(1, {value: 42}).set(2, [42]).set(3, null);
    map2.set(1, {value: 42}).set(2, [42]);

    eval(TEST('!unify(map1, map2)'));

    map2.set(3, null);

    eval(TEST('unify(map1, map2)'));
    eval(TEST('unify(map2, map1)'));

    eval(TEST('unify({a: 1}, {a: 1})'));
    eval(TEST('!unify({a: 2}, {a: 1})'));
  },
  function test_urls() {
    if (typeof URL != 'function') return;
    eval(TEST("unify(new URL('https://example.com/'), new URL('https://example.com/'))"));
    eval(TEST("!unify(new URL('https://example.com/'), new URL('https://other.com/'))"));
    eval(TEST("!unify(new URL('https://example.com/?a=1&b=2'), new URL('https://example.com/?b=2&a=1'))"));
    eval(TEST("unify(new URL('https://example.com/?a=1&b=2'), new URL('https://example.com/?a=1&b=2'))"));
    eval(TEST("!unify(new URL('https://example.com/'), 'https://example.com/')"));
    eval(TEST("unify(new URL('https://EXAMPLE.COM/'), new URL('https://example.com/'))"));
    eval(TEST("!unify(new URL('https://example.com/path'), new URL('https://example.com/PATH'))"));
  },
  function test_filters() {
    let counter = 0;
    function Foo(name) {
      this.counter = ++counter;
      this.name = name;
      this.flag = true;
    }
    const l = {x: new Foo('Sam'), y: new Foo('Mary')},
      r = {x: new Foo('Sam'), y: new Foo('Mary')};
    eval(TEST('counter === 4'));
    // delayed filter
    unify.filters.push(
      function test(l, r) {
        return l.flag || r.flag;
      },
      function unify(l, r, ls, rs, env) {
        if (!l.flag || !r.flag) {
          return false;
        }
        ls.push(l.name);
        rs.push(r.name);
        return true;
      }
    );
    eval(TEST('unify(l, r)'));
    unify.filters.pop();
    unify.filters.pop();
    // immediate filter
    unify.filters.push(
      function test(l, r) {
        return l.flag || r.flag;
      },
      function unify(l, r, ls, rs, env) {
        if (!l.flag || !r.flag) {
          return false;
        }
        return l.name === r.name;
      }
    );
    eval(TEST('unify(l, r)'));
    unify.filters.pop();
    unify.filters.pop();
    // no custom filters
    eval(TEST('!unify(l, r)'));
    // instanceof-based custom unifier
    unify.registry.push(Foo, function unify(l, r, ls, rs, env) {
      if (typeof r == 'string') {
        ls.push(l.name);
        rs.push(r);
        return true;
      }
      if (!r.flag) {
        return false;
      }
      ls.push(l.name);
      rs.push(r.name);
      return true;
    });
    eval(TEST('unify(l, r)'));
    unify.registry.pop();
    unify.registry.pop();
  }
];
