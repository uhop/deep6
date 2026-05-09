import {runAllTests} from './harness.js';

import envTests from './test-env.js';
import envMapTests from './test-env-map.js';
import unifyTests from './test-unify.js';
import matchTests from './test-match.js';
import registryTests from './test-registry.js';
import unifierTests from './test-unifiers.js';
import traverseTests from './test-traverse.js';
import indexTests from './test-index.js';
import edgeCaseTests from './test-edge-cases.js';

runAllTests([...envTests, ...envMapTests, ...unifyTests, ...matchTests, ...registryTests, ...unifierTests, ...traverseTests, ...indexTests, ...edgeCaseTests]);
