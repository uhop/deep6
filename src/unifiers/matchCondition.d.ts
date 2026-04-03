// Type definitions for deep6 matchCondition unifier
// Generated from src/unifiers/matchCondition.js

import type {Unifier, Env} from '../env.js';

/**
 * Conditional matching unifier
 *
 * Matches values based on a custom predicate function.
 * Provides maximum flexibility for complex matching logic.
 *
 * @example
 * ```ts
 * // Match positive numbers
 * const positiveMatcher = matchCondition((val) => typeof val === 'number' && val > 0);
 *
 * // Match strings with specific length
 * const lengthMatcher = matchCondition((val) => typeof val === 'string' && val.length > 5);
 *
 * // Match objects with specific property
 * const hasIdMatcher = matchCondition((val) => val && typeof val === 'object' && 'id' in val);
 * ```
 */
export declare class MatchCondition extends Unifier {
  /** Predicate function to test values */
  f: (val: unknown, ls: unknown[], rs: unknown[], env: Env) => boolean;

  /**
   * Creates a new conditional matcher
   * @param f - Predicate function that returns true if value matches
   */
  constructor(f: (val: unknown, ls: unknown[], rs: unknown[], env: Env) => boolean);

  /**
   * Attempts to unify a value using the predicate function
   * @param val - Value to test
   * @param ls - Left argument stack
   * @param rs - Right argument stack
   * @param env - Unification environment
   * @returns True if the predicate function returns true
   */
  unify(val: unknown, ls: unknown[], rs: unknown[], env: Env): boolean;
}

/**
 * Creates a conditional pattern matcher
 *
 * @param f - Predicate function that determines if a value matches
 * @returns A new MatchCondition unifier instance
 *
 * @example
 * ```ts
 * // Match even numbers
 * const evenMatcher = matchCondition((val) => typeof val === 'number' && val % 2 === 0);
 *
 * // Match non-empty arrays
 * const nonEmptyArrayMatcher = matchCondition((val) => Array.isArray(val) && val.length > 0);
 *
 * // Match objects with nested structure
 * const nestedMatcher = matchCondition((val) =>
 *   val && typeof val === 'object' &&
 *   'user' in val &&
 *   typeof val.user === 'object' &&
 *   'name' in val.user
 * );
 *
 * // Complex condition with environment access
 * const envMatcher = matchCondition((val, ls, rs, env) => {
 *   // Can access environment for complex logic
 *   return someComplexCondition(val, env);
 * });
 * ```
 */
export declare const matchCondition: (f: (val: unknown, ls: unknown[], rs: unknown[], env: Env) => boolean) => MatchCondition;
export default matchCondition;
