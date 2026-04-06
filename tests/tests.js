import {runAllTests} from './harness.js';

import envTests from './test-env.js';
import unifyTests from './test-unify.js';
import matchTests from './test-match.js';
import registryTests from './test-registry.js';
import unifierTests from './test-unifiers.js';
import traverseTests from './test-traverse.js';
import indexTests from './test-index.js';

runAllTests([...envTests, ...unifyTests, ...matchTests, ...registryTests, ...unifierTests, ...traverseTests, ...indexTests]);
