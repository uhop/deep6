import {Env, Variable, variable as v} from '../src/env.js';
import {submit, TEST} from './harness.js';

export default [
  function test_env() {
    const env = new Env(),
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

    env.bindVar(x.name, y.name);

    eval(TEST('!x.isBound(env)'));
    eval(TEST('!y.isBound(env)'));
    eval(TEST('!z.isBound(env)'));
    eval(TEST('x.get(env) === undefined'));
    eval(TEST('y.get(env) === undefined'));
    eval(TEST('z.get(env) === undefined'));
    eval(TEST('x.isAlias(y, env)'));
    eval(TEST('!x.isAlias(z, env)'));
    eval(TEST('y.isAlias(x, env)'));
    eval(TEST('!y.isAlias(z, env)'));
    eval(TEST('!z.isAlias(x, env)'));
    eval(TEST('!z.isAlias(y, env)'));

    env.push();

    eval(TEST('!x.isBound(env)'));
    eval(TEST('!y.isBound(env)'));
    eval(TEST('!z.isBound(env)'));
    eval(TEST('x.get(env) === undefined'));
    eval(TEST('y.get(env) === undefined'));
    eval(TEST('z.get(env) === undefined'));
    eval(TEST('x.isAlias(y, env)'));
    eval(TEST('!x.isAlias(z, env)'));
    eval(TEST('y.isAlias(x, env)'));
    eval(TEST('!y.isAlias(z, env)'));
    eval(TEST('!z.isAlias(x, env)'));
    eval(TEST('!z.isAlias(y, env)'));

    env.bindVal(z.name, 'z');

    eval(TEST('!x.isBound(env)'));
    eval(TEST('!y.isBound(env)'));
    eval(TEST('z.isBound(env)'));
    eval(TEST('x.get(env) === undefined'));
    eval(TEST('y.get(env) === undefined'));
    eval(TEST('z.get(env) === "z"'));
    eval(TEST('x.isAlias(y, env)'));
    eval(TEST('!x.isAlias(z, env)'));
    eval(TEST('y.isAlias(x, env)'));
    eval(TEST('!y.isAlias(z, env)'));
    eval(TEST('!z.isAlias(x, env)'));
    eval(TEST('!z.isAlias(y, env)'));

    env.push();

    eval(TEST('!x.isBound(env)'));
    eval(TEST('!y.isBound(env)'));
    eval(TEST('z.isBound(env)'));
    eval(TEST('x.get(env) === undefined'));
    eval(TEST('y.get(env) === undefined'));
    eval(TEST('z.get(env) === "z"'));
    eval(TEST('x.isAlias(y, env)'));
    eval(TEST('!x.isAlias(z, env)'));
    eval(TEST('y.isAlias(x, env)'));
    eval(TEST('!y.isAlias(z, env)'));
    eval(TEST('!z.isAlias(x, env)'));
    eval(TEST('!z.isAlias(y, env)'));

    env.bindVal(y.name, 'y');

    eval(TEST('x.isBound(env)'));
    eval(TEST('y.isBound(env)'));
    eval(TEST('z.isBound(env)'));
    eval(TEST('x.get(env) === "y"'));
    eval(TEST('y.get(env) === "y"'));
    eval(TEST('z.get(env) === "z"'));
    eval(TEST('!x.isAlias(y, env)'));
    eval(TEST('!x.isAlias(z, env)'));
    eval(TEST('!y.isAlias(x, env)'));
    eval(TEST('!y.isAlias(z, env)'));
    eval(TEST('!z.isAlias(x, env)'));
    eval(TEST('!z.isAlias(y, env)'));

    env.pop();

    eval(TEST('!x.isBound(env)'));
    eval(TEST('!y.isBound(env)'));
    eval(TEST('z.isBound(env)'));
    eval(TEST('x.get(env) === undefined'));
    eval(TEST('y.get(env) === undefined'));
    eval(TEST('z.get(env) === "z"'));
    eval(TEST('x.isAlias(y, env)'));
    eval(TEST('!x.isAlias(z, env)'));
    eval(TEST('y.isAlias(x, env)'));
    eval(TEST('!y.isAlias(z, env)'));
    eval(TEST('!z.isAlias(x, env)'));
    eval(TEST('!z.isAlias(y, env)'));

    env.pop();

    eval(TEST('!x.isBound(env)'));
    eval(TEST('!y.isBound(env)'));
    eval(TEST('!z.isBound(env)'));
    eval(TEST('x.get(env) === undefined'));
    eval(TEST('y.get(env) === undefined'));
    eval(TEST('z.get(env) === undefined'));
    eval(TEST('x.isAlias(y, env)'));
    eval(TEST('!x.isAlias(z, env)'));
    eval(TEST('y.isAlias(x, env)'));
    eval(TEST('!y.isAlias(z, env)'));
    eval(TEST('!z.isAlias(x, env)'));
    eval(TEST('!z.isAlias(y, env)'));

    env.pop();

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
  },
  function test_env_revert() {
    const env = new Env(),
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
  function test_env_getAllValues() {
    const env = new Env(),
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
  function test_env_errors() {
    const env = new Env();
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
  function test_variable_isAlias_with_variable() {
    const env = new Env(),
      x = v(),
      y = v();

    env.push();
    env.bindVar(x.name, y.name);

    eval(TEST('x.isAlias(y, env)'));
    eval(TEST('y.isAlias(x, env)'));
  }
];
