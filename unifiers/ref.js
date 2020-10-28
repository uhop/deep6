import unify from '../main.js';

class Ref extends unify.Variable {
  constructor(variable, value) {
    const v = typeof variable == 'string' ? new unify.Variable(variable) : variable;
    super(v.name);
    this.variable = v;
    this.value = value;
  }

  unify(val, ls, rs, env) {
    ls.push(this.value, this.variable);
    rs.push(val, val);
    return true;
  }
}

const ref = (variable, value) => new Ref(variable, value);
ref.Ref = Ref;

export default ref;
