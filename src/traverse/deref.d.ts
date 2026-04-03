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
 * directly in-place. Unlike assemble which creates a new structure,
 * deref modifies the existing one.
 *
 * @param val - Value to dereference (modified in-place)
 * @param env - Environment with bindings, or options
 * @param options - Optional dereference options
 * @returns Same value with variables replaced
 *
 * @example
 * ```ts
 * const x = variable('x');
 * const y = variable('y');
 * const env = unify({x: 42, y: 'hello'}, {x, y});
 *
 * const obj = {a: x, b: [y, x]};
 * deref(obj, env);  // Modifies obj in place
 * // obj === {a: 42, b: ['hello', 42]}
 * ```
 */
export declare const deref: (val: unknown, env?: Env | DerefContext, options?: DerefContext) => unknown;

export default deref;
