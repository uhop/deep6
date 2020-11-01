import {variable} from '../src/unify.js';
import assemble from '../src/utils/assemble.js';
import solve from '../src/yopl.js';

// const printEnv = env => {
//   const list = ['env values:'];
//   env.getAllValues().forEach(pair => list.push(pair.name, '=', pair.value));
//   console.log(...list);
// };

const makeList = (array, rest = null) => {
  if (!array.length) return null;
  const items = array.map(value => ({value}));
  items.forEach((item, index) => (item.next = index + 1 < items.length ? items[index + 1] : rest));
  return items[0];
};

//

const valueVar = variable('value');

const callback = env => {
  if (valueVar.isBound(env)) {
    console.log('value =', assemble(valueVar, env));
  } else {
    console.log('value is not bound');
  }
  // printEnv(env);
};

// const rules = {
//   'one/1': [{varNames: 0, goals: () => [{args: [1]}]}],
//   'notNull/1': [{varNames: 1, goals: X => [{args: [X]}, env => X.isBound(env) && X.get(env) !== null]}],
//   'last/2': [
//     {varNames: 0, goals: () => [{args: [null, undefined]}]},
//     {varNames: 1, goals: X => [{args: [{value: X, next: null}, X]}]},
//     {varNames: 2, goals: (X, Y) => [{args: [{next: X}, Y]}, {name: 'notNull/1', args: [X]}, {name: 'last/2', args: [X, Y]}]}
//   ]
// };

const rules = {
  'one/1': () => [{args: [1]}],
  'notNull/1': X => [{args: [X]}, env => X.isBound(env) && X.get(env) !== null],
  'last/2': [
    () => [{args: [null, undefined]}],
    X => [{args: [{value: X, next: null}, X]}],
    (X, Y) => [{args: [{next: X}, Y]}, {name: 'notNull/1', args: [X]}, {name: 'last/2', args: [X, Y]}]
  ],
  'eq/2': X => [{args: [X, X]}],
  'append/3': [
    Y => [{args: [null, Y, Y]}],
    // (X) => [{args: [X, null, X]}],
    (X, Y, Z, V) => [{args: [{value: V, next: X}, Y, {value: V, next: Z}]}, {name: 'append/3', args: [X, Y, Z]}]
  ],
  'member/2': [(V, X) => [{args: [{value: V, next: X}, V]}], (V, X) => [{args: [{next: X}, V]}, {name: 'member/2', args: [X, V]}]]
};

// solve('one/1', [valueVar], callback);
// solve('last/2', [null, valueVar], callback);
// solve('last/2', [{value: 1, next: null}, valueVar], callback);
// solve('last/2', [{value: 1, next: {value: 2, next: null}}, valueVar], callback);
// solve('last/2', [makeList([1, 2]), valueVar], callback);
// solve('last/2', [makeList([1, 2, 3, 4, 'five']), valueVar], callback);
// solve('append/3', [null, null, valueVar], callback);
// solve('append/3', [null, {value: 1, next: null}, valueVar], callback);
// solve('append/3', [{value: 1, next: null}, null, valueVar], callback);
// solve('append/3', [makeList([1, 2]), makeList([3, 4]), valueVar], callback);
// solve('append/3', [makeList([1, 2]), makeList([3, 4]), makeList([1, 2], valueVar)], callback);
// solve('member/2', [makeList([1, 2, 3]), 2], callback);
// solve('member/2', [makeList([1, valueVar, 3]), 2], callback);
// solve('member/2', [makeList([1, 2, 3]), valueVar], callback);

{
  const X = variable('X'),
    Y = variable('Y');
  solve(rules, 'append/3', [X, Y, makeList([1, 2, 3])], env => {
    console.log('X =', assemble(X, env));
    console.log('Y =', assemble(Y, env));
  });
}
