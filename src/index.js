import {any, _} from './env.js';
import unify from './unify.js';
import clone from './utils/clone.js';
import preprocess from './utils/preprocess.js'

const equal = (a, b) => !!unify(a, b);

const match = (object, pattern) => !!unify(object, preprocess(pattern, {openObjects: true}));

export {clone, match, any, _};
export default equal;
