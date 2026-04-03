// Type definitions for deep6 deref
// Generated from src/traverse/deref.js

import type {Env} from '../env.js';

/**
 * Context object passed to deref processors
 */
export interface DerefContext {
  /** Output stack for dereferenced values */
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
 * Dereferences variables in a value using environment bindings
 *
 * Traverses a structure and replaces variables with their bound values
 * directly in the original structure (in-place modification). Unlike
 * assemble which creates a new structure, deref modifies the existing one.
 *
 * @param env - Environment containing variable bindings
 * @param val - Value to dereference (will be modified in-place)
 * @param context - Optional deref context
 * @returns The same value with variables replaced by their bound values
 *
 * @example
 * ```ts
 * const x = variable('x');
 * const y = variable('y');
 * const env = unify({x: 42, y: 'hello'}, {x, y});
 *
 * const obj = {a: x, b: [y, x]};
 * deref(env, obj);  // Modifies obj in place
 * // obj === {a: 42, b: ['hello', 42]}
 * ```
 */
export declare const deref: (env: Env, val: unknown, context?: DerefContext) => unknown;
