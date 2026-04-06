// Type definitions for deep6 deref
// Generated from src/traverse/deref.js

import type {Env} from '../env.js';
import type {WalkContext} from './walk.js';

/**
 * Options for dereferencing
 */
export interface DerefOptions {
  /** Handle circular references (default: false) */
  circular?: boolean;
  /** Include symbol properties (default: false) */
  symbols?: boolean;
  /** Include non-enumerable properties (default: false) */
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
 * Flat array of type-specific deref pairs: [Constructor, handler, ...]
 *
 * Use `registry.push(Type, handler)` to register a custom handler.
 */
export declare const registry: unknown[];

/**
 * Filter functions for custom deref processing
 */
export declare const filters: Array<(val: unknown, context: WalkContext) => boolean>;

/**
 * Replaces variables with bound values in-place
 *
 * Unlike assemble(), modifies the existing structure directly
 * rather than creating a new one.
 *
 * @param source - Value to dereference (modified in-place)
 * @param env - Env with bindings, or options object
 * @param options - Deref options (when env is provided separately)
 * @returns The same source value with variables replaced
 */
export declare const deref: ((source: unknown, env?: Env | DerefOptions | null, options?: DerefOptions) => unknown) & {
  registry: unknown[];
  filters: Array<(val: unknown, context: WalkContext) => boolean>;
};

export default deref;
