// Type definitions for deep6 unification
// Generated from src/unify.js

import {Env, Unifier, Variable} from './env.js';

/**
 * Options for unification
 */
export interface UnifyOptions {
  /** Handle circular references (default: false) */
  circular?: boolean;
  /** Include symbol properties (default: false) */
  symbols?: boolean;
  /** Use loose equality for primitives (default: false) */
  loose?: boolean;
  /** Ignore function properties (default: false) */
  ignoreFunctions?: boolean;
  /** Distinguish +0 from -0 (default: false) */
  signedZero?: boolean;
  /** Allow extra keys on target objects (default: false) */
  openObjects?: boolean;
  /** Allow extra elements in target arrays (default: false) */
  openArrays?: boolean;
  /** Allow extra entries in target Maps (default: false) */
  openMaps?: boolean;
  /** Allow extra entries in target Sets (default: false) */
  openSets?: boolean;
}

/**
 * Core unification algorithm
 *
 * Attempts to unify two values, optionally binding variables.
 * Returns an Env with bindings on success, or null on failure.
 *
 * @param l - Left value
 * @param r - Right value
 * @param env - Existing environment, options object, or null
 * @param options - Unification options (when env is provided separately)
 * @returns Environment with bindings, or null on failure
 */
export declare const unify: (l: unknown, r: unknown, env?: Env | UnifyOptions | null, options?: UnifyOptions) => Env | null;

/**
 * Flat array of type-specific unifier pairs: [Constructor, handler, Constructor, handler, ...]
 *
 * Use `registry.push(Type, handler)` to register a custom type handler.
 * Handler signature: `(l, r, ls, rs, env) => boolean`
 */
export declare const registry: unknown[];

/**
 * Flat array of filter pairs: [predicate, handler, predicate, handler, ...]
 *
 * Use `filters.push(predicate, handler)` to register a custom filter.
 */
export declare const filters: unknown[];

/**
 * Wraps a value for open matching (target may have extra properties)
 * @param o - Value to wrap
 * @returns Open-wrapped value
 */
export declare const open: <T>(o: T) => T;

/**
 * Wraps a value for soft matching (bidirectional open, updates both sides)
 * @param o - Value to wrap
 * @returns Soft-wrapped value
 */
export declare const soft: <T>(o: T) => T;

/**
 * Checks if a value is open-wrapped
 * @param o - Value to check
 */
export declare const isOpen: (o: unknown) => boolean;

/**
 * Checks if a value is soft-wrapped
 * @param o - Value to check
 */
export declare const isSoft: (o: unknown) => boolean;

/**
 * Checks if a value is wrapped (open or soft)
 * @param o - Value to check
 */
export declare const isWrapped: (o: unknown) => boolean;

// Re-exports from env.js (value exports, usable as constructors)
export {Env, Unifier, Variable} from './env.js';
export {_, any, isUnifier, isVariable, variable} from './env.js';

export default unify;
