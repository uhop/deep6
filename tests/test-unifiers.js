import unify, {_, variable as v, open} from '../src/unify.js';
import matchString from '../src/unifiers/matchString.js';
import matchTypeOf from '../src/unifiers/matchTypeOf.js';
import matchInstanceOf from '../src/unifiers/matchInstanceOf.js';
import matchCondition from '../src/unifiers/matchCondition.js';
import ref from '../src/unifiers/ref.js';
import {submit, TEST} from './harness.js';

export default [
  function test_matchString() {
    let result = unify('12345', matchString(/1(2)3/));
    eval(TEST('result'));
    result = unify('12345', matchString(/1(2)3/, null, {input: '12345', index: 0}));
    eval(TEST('result'));
    result = unify('12345', matchString(/1(2)3/, ['123', '2']));
    eval(TEST('result'));
    //
    const x = v('x'),
      y = v('y');
    result = unify('12345', matchString(/1(2)3/, x, y));
    eval(TEST('result'));
    eval(TEST("unify(x.get(result), ['123', '2'])"));
    eval(TEST("unify(y.get(result), {index: 0, input: '12345'})"));
    eval(TEST('unify(y.get(result), open({index: 0}))'));
    //
    result = unify('12345', matchString(/1(2)3/, [_, x], open({index: y})));
    eval(TEST('result'));
    eval(TEST("x.get(result) === '2'"));
    eval(TEST('y.get(result) === 0'));
  },
  function test_matchString_no_match() {
    let result = unify('hello', matchString(/^world/));
    eval(TEST('!result'));
    result = unify('abc', matchString(/\\d+/));
    eval(TEST('!result'));
  },
  function test_matchTypeOf() {
    let result = unify(1, matchTypeOf('number'));
    eval(TEST('result'));
    result = unify('a', matchTypeOf('string'));
    eval(TEST('result'));
    result = unify(true, matchTypeOf('boolean'));
    eval(TEST('result'));
    result = unify(undefined, matchTypeOf('undefined'));
    eval(TEST('result'));
    result = unify(null, matchTypeOf('object'));
    eval(TEST('result'));
    result = unify([], matchTypeOf('object'));
    eval(TEST('result'));
    result = unify({}, matchTypeOf('object'));
    eval(TEST('result'));
    result = unify(function () {}, matchTypeOf('function'));
    eval(TEST('result'));
    result = unify('a', matchTypeOf(['number', 'string', 'boolean']));
    eval(TEST('result'));
    result = unify(null, matchTypeOf(['function', 'object']));
    eval(TEST('result'));
    result = unify(unify, matchTypeOf(['function', 'object']));
    eval(TEST('result'));

    result = unify([], matchTypeOf(['number', 'string', 'boolean']));
    eval(TEST('!result'));
    result = unify(1, matchTypeOf(['function', 'object']));
    eval(TEST('!result'));
  },
  function test_matchInstanceOf() {
    class A {}
    class B extends A {}
    class C extends B {}
    class D {}
    class E extends D {}

    let result = unify(new A(), matchInstanceOf(Object));
    eval(TEST('result'));
    result = unify(new A(), matchInstanceOf(A));
    eval(TEST('result'));
    result = unify(new A(), matchInstanceOf(B));
    eval(TEST('!result'));
    result = unify(new A(), matchInstanceOf(C));
    eval(TEST('!result'));
    result = unify(new A(), matchInstanceOf(D));
    eval(TEST('!result'));
    result = unify(new A(), matchInstanceOf(E));
    eval(TEST('!result'));

    result = unify(new B(), matchInstanceOf(Object));
    eval(TEST('result'));
    result = unify(new B(), matchInstanceOf(A));
    eval(TEST('result'));
    result = unify(new B(), matchInstanceOf(B));
    eval(TEST('result'));
    result = unify(new B(), matchInstanceOf(C));
    eval(TEST('!result'));
    result = unify(new B(), matchInstanceOf(D));
    eval(TEST('!result'));
    result = unify(new B(), matchInstanceOf(E));
    eval(TEST('!result'));

    result = unify(new C(), matchInstanceOf(Object));
    eval(TEST('result'));
    result = unify(new C(), matchInstanceOf(A));
    eval(TEST('result'));
    result = unify(new C(), matchInstanceOf(B));
    eval(TEST('result'));
    result = unify(new C(), matchInstanceOf(C));
    eval(TEST('result'));
    result = unify(new C(), matchInstanceOf(D));
    eval(TEST('!result'));
    result = unify(new C(), matchInstanceOf(E));
    eval(TEST('!result'));

    result = unify(new D(), matchInstanceOf(Object));
    eval(TEST('result'));
    result = unify(new D(), matchInstanceOf(A));
    eval(TEST('!result'));
    result = unify(new D(), matchInstanceOf(B));
    eval(TEST('!result'));
    result = unify(new D(), matchInstanceOf(C));
    eval(TEST('!result'));
    result = unify(new D(), matchInstanceOf(D));
    eval(TEST('result'));
    result = unify(new D(), matchInstanceOf(E));
    eval(TEST('!result'));

    result = unify(new E(), matchInstanceOf(Object));
    eval(TEST('result'));
    result = unify(new E(), matchInstanceOf(A));
    eval(TEST('!result'));
    result = unify(new E(), matchInstanceOf(B));
    eval(TEST('!result'));
    result = unify(new E(), matchInstanceOf(C));
    eval(TEST('!result'));
    result = unify(new E(), matchInstanceOf(D));
    eval(TEST('result'));
    result = unify(new E(), matchInstanceOf(E));
    eval(TEST('result'));

    result = unify(new Date(), matchInstanceOf(Object));
    eval(TEST('result'));
    result = unify(new Date(), matchInstanceOf(Date));
    eval(TEST('result'));
    result = unify(new Date(), matchInstanceOf(Array));
    eval(TEST('!result'));

    result = unify([], matchInstanceOf(Object));
    eval(TEST('result'));
    result = unify([], matchInstanceOf(Date));
    eval(TEST('!result'));
    result = unify([], matchInstanceOf(Array));
    eval(TEST('result'));

    result = unify({}, matchInstanceOf(Object));
    eval(TEST('result'));
    result = unify({}, matchInstanceOf(Date));
    eval(TEST('!result'));
    result = unify({}, matchInstanceOf(Array));
    eval(TEST('!result'));
  },
  function test_matchInstanceOf_array() {
    let result = unify(new Date(), matchInstanceOf([Date, RegExp]));
    eval(TEST('result'));
    result = unify(/abc/, matchInstanceOf([Date, RegExp]));
    eval(TEST('result'));
    result = unify('hello', matchInstanceOf([Date, RegExp]));
    eval(TEST('!result'));
  },
  function test_matchCondition() {
    const smallNumber = matchCondition(val => typeof val == 'number' && 0 < val && val < 10);

    let result = unify(5, smallNumber);
    eval(TEST('result'));
    result = unify(10, smallNumber);
    eval(TEST('!result'));
    result = unify(0, smallNumber);
    eval(TEST('!result'));
    result = unify('5', smallNumber);
    eval(TEST('!result'));
  },
  function test_matchCondition_env() {
    const x = v('x');
    const checker = matchCondition((val, ls, rs, env) => {
      ls.push(x);
      rs.push(val * 2);
      return typeof val == 'number';
    });
    const result = unify(5, checker);
    eval(TEST('result'));
    eval(TEST('x.isBound(result)'));
    eval(TEST('x.get(result) === 10'));
  },
  function test_ref() {
    const source = {
        left: {left: 1, right: 2},
        right: {left: 3, right: 4}
      },
      pattern = {
        left: ref(v('lnode'), {left: 1, right: v('right')}),
        right: ref('rnode', {left: v('left'), right: 4})
      };
    const env = unify(pattern, source);
    eval(TEST('env'));
    eval(TEST("v('left').isBound(env)"));
    eval(TEST("v('left').get(env) === 3"));
    eval(TEST("v('right').isBound(env)"));
    eval(TEST("v('right').get(env) === 2"));
    eval(TEST("v('lnode').isBound(env)"));
    eval(TEST("unify(v('lnode'), {left: 1, right: 2}, env)"));
    eval(TEST("v('rnode').isBound(env)"));
    eval(TEST("unify(v('rnode'), {left: 3, right: 4}, env)"));
  }
];
