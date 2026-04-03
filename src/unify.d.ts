// Type definitions for deep6 unification
// Generated from src/unify.js

import type {Env, Unifier, Variable} from './env.js';

/**
 * Options for unification
 */
export interface UnifyOptions {
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
  /** Allow open array matching (default: false) */
  openArrays?: boolean;
  /** Allow open Map matching (default: false) */
  openMaps?: boolean;
  /** Allow open Set matching (default: false) */
  openSets?: boolean;
  /** Allow open object matching (default: false) */
  openObjects?: boolean;
}

/**
 * Core unification function
 *
 * Attempts to unify two values, optionally binding variables in the process.
 * Returns an environment with variable bindings if successful, or null if unification fails.
 *
 * @param l - First value to unify
 * @param r - Second value to unify
 * @param env - Optional existing environment for variable bindings
 * @param options - Unification options
 * @returns Environment with bindings if successful, null otherwise
 *
 * @example
 * ```ts
 * import {variable} from 'deep6/env.js';
 *
 * const x = variable('x');
 * const env = unify({a: x}, {a: 42});
 * console.log(x.get(env)); // 42
 * ```
 */
export declare const unify: (l: unknown, r: unknown, env?: Env | null, options?: UnifyOptions) => Env | null;

/**
 * Registry of type-specific unifiers
 *
 * Array of [Constructor, unifierFunction] pairs for custom type handling.
 * Can be extended to add support for additional types.
 */
export declare const registry: Array<[new (...args: any[]) => unknown, (l: unknown, r: unknown, ls: unknown[], rs: unknown[], env: Env) => boolean]>;

/**
 * Array of filter functions for custom processing
 */
export declare const filters: Array<(l: unknown, r: unknown, ls: unknown[], rs: unknown[], env: Env) => boolean>;

/**
 * Creates an open wrapper for pattern matching
 *
 * Open patterns match the structure but allow additional properties.
 *
 * @param o - Object to wrap
 * @returns Open wrapper
 */
export declare const open: <T>(o: T) => T;

/**
 * Creates a soft wrapper for pattern matching
 *
 * Soft patterns are more permissive in matching.
 *
 * @param o - Object to wrap
 * @returns Soft wrapper
 */
export declare const soft: <T>(o: T) => T;

/**
 * Checks if a value is an open wrapper
 * @param o - Value to check
 * @returns True if value is an open wrapper
 */
export declare const isOpen: (o: unknown) => boolean;

/**
 * Checks if a value is a soft wrapper
 * @param o - Value to check
 * @returns True if value is a soft wrapper
 */
export declare const isSoft: (o: unknown) => boolean;

/**
 * Checks if a value is a wrapper (open or soft)
 * @param o - Value to check
 * @returns True if value is a wrapper
 */
export declare const isWrapped: (o: unknown) => boolean;

// Re-exports from env.js

/**
 * Wildcard symbol that matches any value
 * @see any
 */
export declare const _: unique symbol;

/**
 * Wildcard symbol that matches any value
 */
export declare const any: typeof _;

export type {Env} from './env.js';

/**
 * Base class for custom unification behavior
 */
export type {Unifier} from './env.js';

/**
 * Type guard to check if a value is a Unifier instance
 * @param x - Value to check
 * @returns True if x is a Unifier
 */
export declare const isUnifier: (x: unknown) => x is import('./env.js').Unifier;

/**
 * Logical variable for unification
 */
export type {Variable} from './env.js';

/**
 * Type guard to check if a value is a Variable instance
 * @param x - Value to check
 * @returns True if x is a Variable
 */
export declare const isVariable: (x: unknown) => x is import('./env.js').Variable;

/**
 * Factory function to create a new Variable
 * @param name - Optional variable name/identifier
 * @returns A new Variable instance
 */
export declare const variable: (name?: string | symbol) => import('./env.js').Variable;
