// Type definitions for deep6 preprocess
// Generated from src/traverse/preprocess.js

import type {Unifier, Variable} from '../env.js';

/**
 * Options for pattern preprocessing
 */
export interface PreprocessOptions {
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
 * Preprocesses a pattern for unification
 *
 * Transforms plain objects into unification-aware structures,
 * handling open/closed matching modes and preparing patterns
 * for the unification algorithm.
 *
 * @param pattern - Pattern to preprocess
 * @param options - Preprocessing options
 * @returns Preprocessed pattern ready for unification
 *
 * @example
 * ```ts
 * // Open matching (default)
 * const openPattern = preprocess({a: 1}, {openObjects: true});
 * // Will match {a: 1, b: 2} (additional properties allowed)
 *
 * // Closed matching
 * const closedPattern = preprocess({a: 1}, {openObjects: false});
 * // Will only match {a: 1} exactly
 *
 * // Complex pattern with options
 * const complexPattern = preprocess({
 *   users: open([{name: 'John'}]),  // Open array
 *   data: soft({key: 'value'})      // Soft object
 * }, {
 *   openObjects: true,
 *   openArrays: true,
 *   circular: true
 * });
 * ```
 */
export declare const preprocess: (pattern: unknown, options?: PreprocessOptions) => unknown;
