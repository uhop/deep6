// Type definitions for deep6 clone
// Generated from src/traverse/clone.js

import type {Env} from '../env.js';

/**
 * Options for deep cloning
 */
export interface CloneOptions {
  /** Handle circular references (default: true) */
  circular?: boolean;
  /** Include symbol properties (default: false) */
  symbols?: boolean;
  /** Include non-enumerable properties (default: false) */
  allProps?: boolean;
  /** Use loose equality for primitives (default: false) */
  loose?: boolean;
  /** Ignore function properties (default: false) */
  ignoreFunctions?: boolean;
  /** Custom context object for cloning */
  context?: Record<string, unknown>;
  /** Custom object processor */
  processObject?: (object: unknown, context: CloneContext) => void;
  /** Custom value processor */
  processOther?: (value: unknown, context: CloneContext) => void;
  /** Custom circular reference processor */
  processCircular?: (value: unknown, context: CloneContext) => void;
}

/**
 * Context object passed to clone processors
 */
export interface CloneContext {
  /** Output stack for cloned values */
  stackOut: unknown[];
  /** Optional environment for variable handling */
  env?: Env | null;
  /** Additional context properties */
  [key: string]: unknown;
}

/**
 * Registry of type-specific cloners
 *
 * Array of [Constructor, clonerFunction] pairs for custom type handling.
 * Can be extended to add support for additional types.
 */
export declare const registry: Array<[new (...args: any[]) => unknown, (val: unknown, context: CloneContext) => void]>;

/**
 * Array of filter functions for custom processing
 */
export declare const filters: Array<(val: unknown, context: CloneContext) => void>;

/**
 * Creates a deep clone of a value
 *
 * Clones objects, arrays, and all supported types while handling
 * circular references correctly. Can clone with custom options.
 *
 * @param a - Value to clone
 * @param contextOrEnv - Optional environment or context (deprecated)
 * @param options - Cloning options
 * @returns Deep clone of the value
 *
 * @example
 * ```ts
 * const original = {a: 1, b: {c: 2}};
 * const cloned = clone(original);
 * cloned.b.c = 3;
 * console.log(original.b.c); // 2 (unchanged)
 *
 * // With options
 * const clonedWithSymbols = clone(original, {symbols: true});
 * ```
 */
export declare const clone: <T>(a: T, contextOrEnv?: Env | CloneOptions, options?: CloneOptions) => T;
