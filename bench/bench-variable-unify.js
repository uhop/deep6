import unify, {variable} from '../src/unify.js';

const x = variable('x'),
  y = variable('y'),
  z = variable('z');

const driveUnbound = n => {
  let env;
  for (let i = 0; i < n; ++i) {
    env = unify(x, i);
  }
  return env;
};

const driveBound = n => {
  let env;
  for (let i = 0; i < n; ++i) {
    env = unify([x, x], [i, i]);
  }
  return env;
};

const driveVarVar = n => {
  let env;
  for (let i = 0; i < n; ++i) {
    env = unify([x, y], [i, i]);
  }
  return env;
};

const driveBoundVar = n => {
  let env;
  for (let i = 0; i < n; ++i) {
    env = unify([x, y, x], [i, i, y]);
  }
  return env;
};

const driveTriple = n => {
  let env;
  for (let i = 0; i < n; ++i) {
    env = unify([x, y, z, x, y, z], [i, i + 1, i + 2, x, y, z]);
  }
  return env;
};

export default {
  unbound: driveUnbound,
  bound: driveBound,
  varvar: driveVarVar,
  boundvar: driveBoundVar,
  triple: driveTriple
};
