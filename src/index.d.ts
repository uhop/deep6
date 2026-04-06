// Type definitions for deep6
// Generated from src/index.js

/**
 * Options for deep equality comparison
 */
export interface EqualOptions {
  /** Handle circular references (default: true) */
  circular?: boolean;
  /** Include symbol properties (default: false) */
  symbols?: boolean;
  /** Use loose equality for primitives (default: false) */
  loose?: boolean;
  /** Ignore function properties (default: false) */
  ignoreFunctions?: boolean;
  /** Distinguish +0 from -0 (default: false) */
  signedZero?: boolean;
}

/**
 * Options for pattern matching
 */
export interface MatchOptions {
  /** Allow extra keys on target objects (default: true) */
  openObjects?: boolean;
  /** Allow extra entries in target Maps (default: true) */
  openMaps?: boolean;
  /** Allow extra entries in target Sets (default: true) */
  openSets?: boolean;
  /** Allow extra elements in target arrays (default: false) */
  openArrays?: boolean;
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
 * Options for deep cloning via the main API
 */
export interface CloneOptions {
  /** Handle circular references (default: true) */
  circular?: boolean;
  /** Clone symbol properties (default: false) */
  symbols?: boolean;
  /** Clone non-enumerable properties (default: false) */
  allProps?: boolean;
}

/**
 * Deep equality check using unification
 * @param a - First value
 * @param b - Second value
 * @param options - Comparison options
 * @returns True if values are deeply equal
 */
export declare const equal: (a: unknown, b: unknown, options?: EqualOptions) => boolean;

/**
 * Deep clone of a value
 * @param a - Value to clone
 * @param options - Cloning options
 * @returns Deep copy of the value
 */
export declare const clone: <T>(a: T, options?: CloneOptions) => T;

/**
 * Pattern matching with wildcards
 * @param object - Value to test
 * @param pattern - Pattern to match against
 * @param options - Matching options
 * @returns True if object matches the pattern
 */
export declare const match: (object: unknown, pattern: unknown, options?: MatchOptions) => boolean;

/** Alias for `match` */
export declare const isShape: typeof match;

export {any, _} from './env.js';

/** Default export — deep equality function */
export default equal;
