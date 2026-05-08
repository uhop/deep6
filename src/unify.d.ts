// Type definitions for deep6 unification
// Generated from src/unify.js

import {Env} from './env.js';

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
 * `unify.registry` is a flat array of type-specific unifier pairs:
 * `[Constructor, handler, Constructor, handler, ...]`. Push pairs to
 * register custom type handlers; handler signature is
 * `(l, r, ls, rs, env) => boolean`.
 *
 * `unify.filters` is a flat array of filter pairs:
 * `[predicate, handler, predicate, handler, ...]`. Push pairs to register
 * a custom filter.
 *
 * @param l - Left value
 * @param r - Right value
 * @param env - Existing environment, options object, or null
 * @param options - Unification options (when env is provided separately)
 * @returns Environment with bindings, or null on failure
 */
export declare const unify: ((l: unknown, r: unknown, env?: Env | UnifyOptions | null, options?: UnifyOptions) => Env | null) & {
  registry: unknown[];
  filters: unknown[];
};

declare const wrapBrand: unique symbol;

/**
 * A value transformed by `open()` or `soft()`. Carries a phantom brand so
 * the type system distinguishes wrapped values from the original — `open(x)`
 * is **not** assignable to `typeof x` and vice-versa, preventing the
 * silent-no-op trap of `equal(a, open(a))`.
 *
 * The brand is purely type-level; at runtime a `Wrapped<T>` is a `Wrap`
 * instance (an internal subclass of `Unifier`), not a `T`.
 */
export type Wrapped<T> = T & {readonly [wrapBrand]: 'open' | 'soft'};

/**
 * Wraps a value for open matching (target may have extra properties).
 * Only meaningful for plain objects, arrays, Maps, Sets, and typed arrays —
 * wrapping atomic types (Date, RegExp, etc.) is rejected at unify time.
 *
 * @param o - Value to wrap
 * @returns Branded `Wrapped<T>` (type-level: distinct from `T`; runtime: a `Wrap`)
 */
export declare const open: <T>(o: T) => Wrapped<T>;

/**
 * Wraps a value for soft matching (bidirectional open, updates both sides).
 * Same kind constraints as `open()`.
 *
 * @param o - Value to wrap
 * @returns Branded `Wrapped<T>` (type-level: distinct from `T`; runtime: a `Wrap`)
 */
export declare const soft: <T>(o: T) => Wrapped<T>;

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
