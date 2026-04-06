// Type definitions for deep6 preprocess
// Generated from src/traverse/preprocess.js

import type {WalkContext} from './walk.js';

/**
 * Options for pattern preprocessing
 */
export interface PreprocessOptions {
  /** Wrap plain objects with open() (default: false) */
  openObjects?: boolean;
  /** Wrap arrays with open() (default: false) */
  openArrays?: boolean;
  /** Wrap Maps with open() (default: false) */
  openMaps?: boolean;
  /** Wrap Sets with open() (default: false) */
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
  processObject?: (object: unknown, context: WalkContext) => void;
  /** Custom non-object value processor */
  processOther?: (value: unknown, context: WalkContext) => void;
  /** Custom circular reference processor */
  processCircular?: (value: unknown, context: WalkContext) => void;
  /** Custom type handler registry (flat array of [Constructor, handler] pairs) */
  registry?: unknown[];
  /** Custom filter functions */
  filters?: Array<(val: unknown, context: WalkContext) => boolean>;
}

/**
 * Flat array of type-specific preprocessor pairs: [Constructor, handler, ...]
 *
 * Use `registry.push(Type, handler)` to register a custom preprocessor.
 */
export declare const registry: unknown[];

/**
 * Filter functions for custom preprocessing
 */
export declare const filters: Array<(val: unknown, context: WalkContext) => boolean>;

/**
 * Preprocesses a pattern for unification
 *
 * Wraps objects, arrays, Maps, and Sets with open/soft markers
 * based on options. Used internally by match().
 *
 * @param source - Pattern to preprocess
 * @param options - Preprocessing options
 * @returns Preprocessed pattern ready for unification
 */
export declare const preprocess: ((source: unknown, options?: PreprocessOptions) => unknown) & {
  registry: unknown[];
  filters: Array<(val: unknown, context: WalkContext) => boolean>;
};

export default preprocess;
