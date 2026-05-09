import {EnvMap, Variable, variable as v} from '../src/env-map.js';
import unify from '../src/unify.js';
import {submit, TEST} from './harness.js';

export default [
  function test_env_map() {
    const env = new EnvMap(),
      x = v(),
      y = v(),
      z = v();

    eval(TEST('!x.isBound(env)'));
    eval(TEST('!y.isBound(env)'));
    eval(TEST('!z.isBound(env)'));
    eval(TEST('x.get(env) === undefined'));
    eval(TEST('y.get(env) === undefined'));
    eval(TEST('z.get(env) === undefined'));
    eval(TEST('!x.isAlias(y, env)'));
    eval(TEST('!x.isAlias(z, env)'));
    eval(TEST('!y.isAlias(x, env)'));
    eval(TEST('!y.isAlias(z, env)'));
    eval(TEST('!z.isAlias(x, env)'));
    eval(TEST('!z.isAlias(y, env)'));

    env.push();

    env.bindVar(x.name, y.name);

    eval(TEST('!x.isBound(env)'));
    eval(TEST('!y.isBound(env)'));
    eval(TEST('x.isAlias(y, env)'));
    eval(TEST('y.isAlias(x, env)'));
    eval(TEST('!z.isAlias(x, env)'));

    env.push();

    env.bindVal(z.name, 'z');

    eval(TEST('!x.isBound(env)'));
    eval(TEST('!y.isBound(env)'));
    eval(TEST('z.isBound(env)'));
    eval(TEST('z.get(env) === "z"'));
    eval(TEST('x.isAlias(y, env)'));

    env.push();

    env.bindVal(y.name, 'y');

    eval(TEST('x.isBound(env)'));
    eval(TEST('y.isBound(env)'));
    eval(TEST('z.isBound(env)'));
    eval(TEST('x.get(env) === "y"'));
    eval(TEST('y.get(env) === "y"'));
    eval(TEST('z.get(env) === "z"'));

    env.pop();

    eval(TEST('!x.isBound(env)'));
    eval(TEST('!y.isBound(env)'));
    eval(TEST('z.isBound(env)'));
    eval(TEST('z.get(env) === "z"'));
    eval(TEST('x.isAlias(y, env)'));

    env.pop();

    eval(TEST('!x.isBound(env)'));
    eval(TEST('!z.isBound(env)'));
    eval(TEST('x.isAlias(y, env)'));

    env.pop();

    eval(TEST('!x.isAlias(y, env)'));
    eval(TEST('!x.isBound(env)'));
  },
  function test_env_map_revert() {
    const env = new EnvMap(),
      x = v(),
      y = v();

    env.push();
    env.bindVal(x.name, 1);
    eval(TEST('x.isBound(env)'));
    eval(TEST('x.get(env) === 1'));

    env.push();
    env.bindVal(y.name, 2);
    eval(TEST('y.isBound(env)'));
    eval(TEST('env.depth === 2'));

    env.revert(0);
    eval(TEST('env.depth === 0'));
    eval(TEST('!x.isBound(env)'));
    eval(TEST('!y.isBound(env)'));
  },
  function test_env_map_getAllValues() {
    const env = new EnvMap(),
      x = v('x'),
      y = v('y');

    env.push();
    env.bindVal(x.name, 42);
    env.bindVal(y.name, 'hello');

    const all = env.getAllValues();
    eval(TEST('all.length === 2'));
    eval(TEST('all.some(e => e.value === 42)'));
    eval(TEST('all.some(e => e.value === "hello")'));
  },
  function test_env_map_errors() {
    const env = new EnvMap();
    let caught = false;
    try {
      env.pop();
    } catch (e) {
      caught = true;
    }
    eval(TEST('caught'));

    caught = false;
    try {
      env.revert(1);
    } catch (e) {
      caught = true;
    }
    eval(TEST('caught'));
  },
  function test_unify_with_env_map() {
    const env = new EnvMap(),
      x = v('x'),
      y = v('y');

    const result = unify({a: x, b: y}, {a: 1, b: 2}, env);
    eval(TEST('result === env'));
    eval(TEST('x.get(env) === 1'));
    eval(TEST('y.get(env) === 2'));
  },
  function test_unify_with_env_map_options() {
    const env = new EnvMap(),
      x = v('x');

    const result = unify({a: x}, {a: 1, b: 2}, env, {openObjects: true});
    eval(TEST('result === env'));
    eval(TEST('x.get(env) === 1'));
    eval(TEST('env.options.openObjects === true'));
  },
  function test_unify_env_map_alias_then_bind() {
    const env = new EnvMap(),
      x = v('x'),
      y = v('y');

    const result = unify([x, y, x], [y, 42, 42], env);
    eval(TEST('result === env'));
    eval(TEST('x.get(env) === 42'));
    eval(TEST('y.get(env) === 42'));
  },
  function test_unify_env_map_failure() {
    const env = new EnvMap();
    const result = unify({a: 1}, {a: 2}, env);
    eval(TEST('result === null'));
  }
];
