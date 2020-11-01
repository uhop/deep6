import unify, {Env, variable} from './unify.js';

let counter = 0;
const generateVariables = count => {
  const t = [];
  for (let i = 0; i < count; ++i) t.push(counter++);
  return t.map(name => variable(Symbol(name)));
};

const prove = (rules, goals, env) => {
  const stack = [{goals}];
  main: while (stack.length) {
    const frame = stack.pop();
    if (frame.command) {
      if (frame.command === 1) {
        env.pop();
        continue main;
      }
      while (frame.index < frame.ruleList.length) {
        const rule = frame.ruleList[frame.index++],
          terms = (typeof rule == 'function' ? rule : rule.goals)(...generateVariables(rule.length));
        env.push();
        if (unify(terms[0].args, frame.args, env)) {
          const newGoals = {terms, index: 1, next: frame.goals};
          stack.push(frame, {command: 1}, {goals: newGoals});
          continue main;
        }
        env.pop();
      }
      continue main;
    }
    let goals = frame.goals;
    while (goals && goals.index >= goals.terms.length) {
      goals = goals.next;
    }
    if (!goals) continue main;
    const goal = goals.terms[goals.index++];
    if (typeof goal == 'function') {
      env.push();
      if (goal(env)) {
        stack.push({command: 1}, {goals});
        continue main;
      }
      --goals.index;
      env.pop();
      continue main;
    }
    let ruleList = rules[goal.name];
    !Array.isArray(ruleList) && (ruleList = [ruleList]);
    stack.push({command: 42, ruleList, index: 0, goals, args: goal.args});
  }
};

const solve = (rules, name, args, callback) => {
  const env = new Env();
  env.openObjects = true;
  const goals = {terms: [{name, args}, env => (callback(env), false)], index: 0, next: null};
  prove(rules, goals, env);
};

export default solve;
