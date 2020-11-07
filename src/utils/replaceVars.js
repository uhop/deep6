import {isVariable} from '../env.js';

const replaceVars = env => (strings, ...vars) => {
  let buffer = strings[0];
  for(let i = 0; i < vars.length;) {
    const v = vars[i];
    if (isVariable(v)) {
      buffer += v.get(env);
    } else switch (typeof v) {
      case 'string':
      case 'number':
      case 'symbol':
        buffer += env.values[v];
        break;
      default:
        buffer += v;
        break;
    }
    buffer += strings[++i];
  }
  return buffer;
};

export default replaceVars;
