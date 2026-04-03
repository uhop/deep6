// Type definitions for deep6 preprocess
// Generated from src/traverse/preprocess.js

import type {Unifier, Variable} from '../env.js';

/**
 * Options for pattern preprocessing
 */
export interface PreprocessOptions {
  /** Allow open object matching */
  openObjects?: boolean;
  /** Allow open array matching */
  openArrays?: boolean;
  /** Allow open Map matching */
  openMaps?: boolean;
  /** Allow open Set matching */
  openSets?: boolean;
  /** Handle circular references */
  circular?: boolean;
  /** Include symbol properties */
  symbols?: boolean;
  /** Include non-enumerable properties */
  allProps?: boolean;
  /** Custom context object */
  context?: Record<string, unknown>;
  /** Custom object processor */
  processObject?: (object: unknown, context: unknown) => void;
  /** Custom value processor */
  processOther?: (value: unknown, context: unknown) => void;
  /** Custom circular reference processor */
  processCircular?: (value: unknown, context: unknown) => void;
  /** Registry of type handlers */
  registry?: Array<[new (...args: any[]) => unknown, (val: unknown, context: unknown) => void]>;
  /** Filter functions */
  filters?: Array<(val: unknown, context: unknown) => boolean>;
}

/**
 * Registry of type-specific preprocessors
 */
export declare const registry: Array<[new (...args: any[]) => unknown, (val: unknown, context: unknown) => void]>;

/**
 * Filter functions for custom processing
 */
export declare const filters: Array<(val: unknown, context: unknown) => boolean>;

/**
 * Preprocesses a pattern for unification
 *
 * Wraps objects, arrays, Maps and Sets with open/soft markers
 * based on options. Used internally by match().
 *
 * @param pattern - Pattern to preprocess
 * @param options - Preprocessing options
 * @returns Preprocessed pattern ready for unification
 *
 * @example
 * ```ts
 * // Open matching (default)
 * const openPattern = preprocess({a: 1}, {openObjects: true});
 *
 * // Closed matching
 * const closedPattern = preprocess({a: 1}, {openObjects: false});
 * ```
 */
export declare const preprocess: (pattern: unknown, options?: PreprocessOptions) => unknown;

export default preprocess;
