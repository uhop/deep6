import {any, _} from './env.js';
import unify from './unify.js';
import originalClone from './traverse/clone.js';
import preprocess from './traverse/preprocess.js';

const defaultOptions = {circular: true};
const equal = (a, b) => !!unify(a, b, null, defaultOptions);

const defaultMatchOptions = {openObjects: true, openMaps: true, openSets: true, circular: true};
const match = (object, pattern, options = defaultMatchOptions) => !!unify(object, preprocess(pattern, options), null, {circular: options.circular});

const clone = a => originalClone(a, null, defaultOptions);

export {clone, match, match as isShape, any, _};
export default equal;
