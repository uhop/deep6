import unify, {Env, variable} from '../unify.js';

let counter = 0;
const generateVariables = count => {
  const t = [];
  for (let i = 0; i < count; ++i) t.push(counter++);
  return t.map(name => variable(Symbol(name)));
};

async function* prove(rules, goals, env) {
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
          vars = generateVariables(rule.length + 1),
          terms = (typeof rule == 'function' ? rule : rule.goals)(...vars);
        env.push();
        if (unify(terms[0].args || [], frame.args, env)) {
          const newGoals = {terms, index: 1, next: frame.goals};
          stack.push(frame, {command: 1}, {goals: newGoals});
          env.bindVal(vars[vars.length - 1].name, frame);
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
    if (!goals){
      yield env;
      continue main;
    }
    let goal = goals.terms[goals.index++];
    if (typeof goal == 'function') {
      env.push();
      let newGoals = await goal(goals, env, stack);
      if (newGoals || newGoals === null) {
        (newGoals && !newGoals.terms) && (newGoals = goals);
        stack.push({command: 1}, {goals: newGoals});
        continue main;
      }
      --goals.index;
      env.pop();
      continue main;
    }
    if (typeof goal == 'string') {
      goal = {name: goal};
    }
    let ruleList = rules[goal.name];
    !Array.isArray(ruleList) && (ruleList = [ruleList]);
    stack.push({command: 2, ruleList, index: 0, goals, args: goal.args || []});
  }
};

async function* generate(rules, name, args) {
  const env = new Env();
  env.openObjects = true;
  const goals = {terms: [{name, args}], index: 0, next: null};
  yield* prove(rules, goals, env);
};

export default generate;
