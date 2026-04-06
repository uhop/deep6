// Type definitions for deep6 clone
// Generated from src/traverse/clone.js

import type {Env} from '../env.js';
import type {WalkContext} from './walk.js';

/**
 * Options for deep cloning
 */
export interface CloneOptions {
  /** Handle circular references (default: true in main API) */
  circular?: boolean;
  /** Clone symbol properties (default: false) */
  symbols?: boolean;
  /** Clone non-enumerable properties (default: false) */
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
  /** Custom filter functions — return true to indicate value was handled */
  filters?: Array<(val: unknown, context: WalkContext) => boolean>;
}

/**
 * Flat array of type-specific cloner pairs: [Constructor, handler, Constructor, handler, ...]
 *
 * Use `registry.push(Type, handler)` to register a custom type cloner.
 * Handler signature: `(val, context) => void` (push result to context.stackOut)
 */
export declare const registry: unknown[];

/**
 * Filter functions for custom clone processing — return true to indicate value was handled
 */
export declare const filters: Array<(val: unknown, context: WalkContext) => boolean>;

/**
 * Deep clones a value with circular reference handling
 *
 * @param source - Value to clone
 * @param env - Optional Env for variable resolution, or options object
 * @param options - Cloning options (when env is provided separately)
 * @returns Deep copy of the value
 */
export declare const clone: (<T>(source: T, env?: Env | CloneOptions | null, options?: CloneOptions) => T) & {
  registry: unknown[];
  filters: Array<(val: unknown, context: WalkContext) => boolean>;
};

export default clone;
