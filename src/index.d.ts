// Type definitions for deep6
// Generated from src/index.js

import type {Env} from './env.js';

/**
 * Options for deep equality comparison
 */
export interface EqualOptions {
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
}

/**
 * Options for pattern matching
 */
export interface MatchOptions {
  /** Allow open object matching (default: true) */
  openObjects?: boolean;
  /** Allow open Map matching (default: true) */
  openMaps?: boolean;
  /** Allow open Set matching (default: true) */
  openSets?: boolean;
  /** Handle circular references (default: true) */
  circular?: boolean;
  /** Include symbol properties (default: false) */
  symbols?: boolean;
  /** Use loose equality for primitives (default: false) */
  loose?: boolean;
  /** Ignore function properties (default: false) */
  ignoreFunctions?: boolean;
}

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
}

/**
 * Tests deep equality between two values
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @param options - Comparison options
 * @returns True if values are deeply equal
 *
 * @example
 * ```ts
 * equal({a: 1, b: [2, 3]}, {b: [2, 3], a: 1}); // true
 * equal([1, 2, 3], [1, 2]); // false
 * ```
 */
export declare const equal: <T>(a: T, b: unknown, options?: EqualOptions) => boolean;

/**
 * Creates a deep clone of a value
 *
 * @param a - Value to clone
 * @param options - Cloning options
 * @returns Deep clone of the value
 *
 * @example
 * ```ts
 * const original = {a: 1, b: {c: 2}};
 * const cloned = clone(original);
 * cloned.b.c = 3;
 * console.log(original.b.c); // 2 (unchanged)
 * ```
 */
export declare const clone: <T>(a: T, options?: CloneOptions) => T;

/**
 * Tests if an object matches a pattern
 *
 * @param object - Object to test
 * @param pattern - Pattern to match against
 * @param options - Matching options
 * @returns True if object matches the pattern
 *
 * @example
 * ```ts
 * match({a: 1, b: 2}, {a: 1}); // true (open match)
 * match({a: 1, b: 2}, {a: 1, b: any}); // true
 * match({a: 1}, {a: 1, b: any}); // false
 * ```
 */
export declare const match: (object: unknown, pattern: unknown, options?: MatchOptions) => boolean;

/**
 * Alias for match function
 * @see match
 */
export declare const isShape: typeof match;

/**
 * Wildcard symbol that matches any value in unification
 * Can be used as `any` or `_` interchangeably
 */
export declare const any: unique symbol;
export declare const _: typeof any;

/**
 * Default export - deep equality function
 * @see equal
 */
export default equal;
