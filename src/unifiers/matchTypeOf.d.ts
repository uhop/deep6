// Type definitions for deep6 matchTypeOf unifier
// Generated from src/unifiers/matchTypeOf.js

import type {Unifier} from '../env.js';

/**
 * Type-based matching unifier
 *
 * Matches values based on their JavaScript type (typeof result).
 * Can match against a single type or multiple types.
 *
 * @example
 * ```ts
 * // Match strings only
 * const stringMatcher = matchTypeOf('string');
 *
 * // Match numbers or strings
 * const numberOrStringMatcher = matchTypeOf(['number', 'string']);
 *
 * // Match functions
 * const functionMatcher = matchTypeOf('function');
 * ```
 */
export declare class MatchTypeOf extends Unifier {
  /** Array of type names to match against */
  types: string[];

  /**
   * Creates a new type matcher
   * @param types - Type name(s) to match
   */
  constructor(types: string | string[]);

  /**
   * Attempts to unify a value with the type constraint
   * @param val - Value to check type of
   * @param ls - Left argument stack (unused)
   * @param rs - Right argument stack (unused)
   * @returns True if value's type matches one of the configured types
   */
  unify(val: unknown, ls: unknown[], rs: unknown[]): boolean;
}

/**
 * Creates a type-based pattern matcher
 *
 * @param types - Type name(s) to match against
 * @returns A new MatchTypeOf unifier instance
 *
 * @example
 * ```ts
 * // Match primitive types
 * const primitiveMatcher = matchTypeOf(['string', 'number', 'boolean']);
 *
 * // Match object types
 * const objectMatcher = matchTypeOf('object');
 *
 * // Match multiple types
 * const multiMatcher = matchTypeOf(['string', 'number', 'object']);
 * ```
 */
export declare const matchTypeOf: (types: string | string[]) => MatchTypeOf;
export default matchTypeOf;
