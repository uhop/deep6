// Type definitions for deep6 matchTypeOf unifier
// Generated from src/unifiers/matchTypeOf.js

import type {Unifier} from '../env.js';

/**
 * Type-based matching unifier
 *
 * Matches values by their `typeof` result. Rejects unbound Variables.
 */
export declare class MatchTypeOf extends Unifier {
  /** Array of type names to match against */
  types: string[];

  /**
   * @param types - Type name or array of type names
   */
  constructor(types: string | string[]);

  /**
   * Tests if the value's typeof matches one of the configured types
   * @param val - Value to check
   * @param ls - Left argument stack (unused)
   * @param rs - Right argument stack (unused)
   * @returns True if typeof val matches
   */
  unify(val: unknown, ls: unknown[], rs: unknown[]): boolean;
}

/**
 * Creates a typeof matcher
 *
 * @param types - Type name(s) to match against (e.g. 'string', ['number', 'bigint'])
 * @returns A new MatchTypeOf instance
 */
export declare const matchTypeOf: (types: string | string[]) => MatchTypeOf;
export default matchTypeOf;
