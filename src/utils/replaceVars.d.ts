// Type definitions for deep6 replaceVars utility
// Generated from src/utils/replaceVars.js

import type {Env, Variable} from '../env.js';

/**
 * Creates a template string function that replaces variables with their bound values
 *
 * Returns a function similar to template literals but with variable substitution.
 * Variables in the template are replaced with their bound values from the environment.
 *
 * @param env - Unification environment containing variable bindings
 * @returns A template string function that performs variable substitution
 *
 * @example
 * ```ts
 * const x = variable('x');
 * const y = variable('y');
 * const env = unify({x: 42, y: 'world'}, {x: x, y: y});
 *
 * const template = replaceVars(env);
 *
 * // Using Variable instances
 * const result1 = template`The answer is ${x} and ${y}!`;
 * // result1 === "The answer is 42 and world!"
 *
 * // Using variable names as strings
 * const result2 = template`Values: ${'x'} and ${'y'}`;
 * // result2 === "Values: 42 and world"
 *
 * // Mixed with literals
 * const result3 = template`Sum: ${x} + ${10} = ${x + 10}`;
 * // result3 === "Sum: 42 + 10 = 52"
 * ```
 */
export declare const replaceVars: (env: Env) => (strings: TemplateStringsArray, ...vars: (Variable | string | number | symbol | unknown)[]) => string;

export default replaceVars;
