import {any, _} from './env.js';
import unify from './unify.js';
import clone from './utils/clone.js';
import preprocess from './utils/preprocess.js';

const equal = (a, b) => !!unify(a, b);

const defaultMatchOptions = {openObjects: true, openMaps: true, openSets: true};
const match = (object, pattern, options = defaultMatchOptions) => !!unify(object, preprocess(pattern, options));

export {clone, match, match as isShape, any, _};
export default equal;
