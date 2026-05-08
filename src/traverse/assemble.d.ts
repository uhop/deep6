// Type definitions for deep6 assemble
// Generated from src/traverse/assemble.js

import type {Env} from '../env.js';
import type {WalkContext} from './walk.js';

/**
 * Options for assembly
 */
export interface AssembleOptions {
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
 * Flat array of type-specific assembler pairs: [Constructor, handler, ...]
 *
 * Use `registry.push(Type, handler)` to register a custom assembler.
 */
export declare const registry: unknown[];

/**
 * Filter functions for custom assembly processing
 */
export declare const filters: Array<(val: unknown, context: WalkContext) => boolean>;

/**
 * Replaces variables with their bound values from an environment
 *
 * Creates a new structure only when values differ from the source.
 * Unbound variables are kept as-is. The returned shape mirrors the
 * source shape; the generic preserves it for the caller.
 *
 * @param source - Value containing variables to resolve
 * @param env - Env with bindings, or options object
 * @param options - Assembly options (when env is provided separately)
 * @returns Value with variables replaced (same structural type as source)
 */
export declare const assemble: (<T>(source: T, env?: Env | AssembleOptions | null, options?: AssembleOptions) => T) & {
  registry: unknown[];
  filters: Array<(val: unknown, context: WalkContext) => boolean>;
};

export default assemble;
