// Type definitions for deep6 replaceVars utility
// Generated from src/utils/replaceVars.js

import type {Env, Variable} from '../env.js';

/**
 * Creates a tagged template function that substitutes variables from an environment
 *
 * Template interpolations can be Variable instances (resolved via `.get(env)`),
 * strings/numbers/symbols (looked up in `env.values`), or other values (coerced to string).
 *
 * @param env - Unification environment with variable bindings
 * @returns A tagged template literal function
 *
 * @example
 * ```ts
 * const x = variable('x');
 * const env = unify({a: x}, {a: 42});
 * const t = replaceVars(env);
 * t`The answer is ${x}!`; // "The answer is 42!"
 * ```
 */
export declare const replaceVars: (env: Env) => (strings: TemplateStringsArray, ...vars: unknown[]) => string;

export default replaceVars;
