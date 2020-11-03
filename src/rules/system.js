export const cut = sys => (env, stack) => {
  const lastFrame = sys[0].get(env);
  for (let i = stack.length - 1; i >= 0; --i) {
    const frame = stack[i]
    if (frame.command === 2) {
      frame.index = Infinity;
    }
    if (frame === lastFrame) break;
  }
  return true;
};

export const fail = () => false;

class Tail {
  constructor(value) {
    this.value = value;
  }
}

export const rest = list => new Tail(list);

export const list = (...args) => {
  if (!args.length) return null;
  let list = null, startFrom = args.length - 1;
  const last = args[startFrom];
  if (last instanceof Tail) {
    --startFrom;
    list = last.value;
  }
  for (let i = startFrom; i >= 0; --i) {
    const value = args[i];
    if (value instanceof Tail) throw new Error(`list cannot contain a tail argument in a middle`);
    list = {value, next: list};
  }
  return list;
};

export const rules = {};
