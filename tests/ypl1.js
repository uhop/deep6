import unify from '../src/unify.js';
import assemble from '../src/utils/assemble.js';

const {Env, _, variable} = unify;

let rules;

//

const proveGoals = (goals, env) => {
  if (!goals.length) return;
  const goal = goals[0];
  if (typeof goal == 'function') {
    env.push();
    if (goal(env)) {
      proveGoals(goals.slice(1), env);
    }
    env.pop();
    return;
  }
  const rest = goals.slice(1);
  let ruleList = rules[goal.name];
  !Array.isArray(ruleList) && (ruleList = [ruleList]);
  for (const rule of ruleList) {
    const terms = (typeof rule == 'function' ? rule : rule.goals)(...generateVariables(rule.length));
    env.push();
    if (unify(terms[0].args, goal.args, env)) {
      proveGoals(terms.slice(1).concat(rest), env);
    }
    env.pop();
  }
};

const solve = (name, args, callback) => {
  const env = new Env();
  env.openObjects = true;
  const goals = [{name, args}, env => (callback(env), false)];
  proveGoals(goals, env);
};

let counter = 0;
const generateVariables = varNames => {
  if (typeof varNames == 'number') {
    const t = [];
    for (let i = 0; i < varNames; ++i) t.push(counter++);
    varNames = t;
  } else if (typeof varNames == 'string') {
    varNames = varNames.split(/\s*,\s*/).filter(x => x);
  }
  return varNames.map(name => variable(Symbol(name)));
};

//

const printEnv = env => {
  const list = ['env values:'];
  env.getAllValues().forEach(pair => list.push(pair.name, '=', pair.value));
  console.log(...list);
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

const makeList = (array, rest = null) => {
  if (!array.length) return null;
  const items = array.map(value => ({value}));
  items.forEach((item, index) => (item.next = index + 1 < items.length ? items[index + 1] : rest));
  return items[0];
};

// rules = {
//   'one/1': [{varNames: 0, goals: () => [{args: [1]}]}],
//   'notNull/1': [{varNames: 1, goals: X => [{args: [X]}, env => X.isBound(env) && X.get(env) !== null]}],
//   'last/2': [
//     {varNames: 0, goals: () => [{args: [null, undefined]}]},
//     {varNames: 1, goals: X => [{args: [{value: X, next: null}, X]}]},
//     {varNames: 2, goals: (X, Y) => [{args: [{next: X}, Y]}, {name: 'notNull/1', args: [X]}, {name: 'last/2', args: [X, Y]}]}
//   ]
// };

rules = {
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
  'member/2': [
    (V, X) => [{args: [{value: V, next: X}, V]}],
    (V, X) => [{args: [{next: X}, V]}, {name: 'member/2', args: [X, V]}]
  ]
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
  const X = variable('X'), Y = variable('Y');
  solve('append/3', [X, Y, makeList([1, 2, 3])], env => {
    console.log('X =', assemble(X, env));
    console.log('Y =', assemble(Y, env));
  });
}
