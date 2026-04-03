// Type definitions for deep6 assemble
// Generated from src/traverse/assemble.js

import type {Env} from '../env.js';

/**
 * Context object passed to assemble processors
 */
export interface AssembleContext {
  /** Output stack for assembled values */
  stackOut: unknown[];
  /** Processing stack for values to visit */
  stack?: unknown[];
  /** Map for tracking circular references */
  seen?: Map<unknown, {value?: unknown; actions?: Array<[unknown, unknown]>}>;
  /** Handle circular references (default: false) */
  circular?: boolean;
  /** Include symbol properties (default: false) */
  symbols?: boolean;
  /** Include non-enumerable properties (default: false) */
  allProps?: boolean;
  /** Use loose equality for primitives (default: false) */
  loose?: boolean;
  /** Ignore function properties (default: false) */
  ignoreFunctions?: boolean;
  /** Additional context properties */
  [key: string]: unknown;
}

/**
 * Assembles a value from an environment with variable bindings
 *
 * Traverses a structure and replaces variables with their bound values
 * from the environment. Creates a new structure with all variables resolved.
 *
 * @param env - Environment containing variable bindings
 * @param val - Value to assemble (may contain variables)
 * @param context - Optional assembly context
 * @returns New value with all variables replaced by their bound values
 *
 * @example
 * ```ts
 * const x = variable('x');
 * const y = variable('y');
 * const env = unify({x: 42, y: 'hello'}, {x, y});
 *
 * const pattern = {a: x, b: [y, x]};
 * const assembled = assemble(env, pattern);
 * // assembled === {a: 42, b: ['hello', 42]}
 * ```
 */
export declare const assemble: (env: Env, val: unknown, context?: AssembleContext) => unknown;
