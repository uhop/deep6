// Type definitions for deep6 matchCondition unifier
// Generated from src/unifiers/matchCondition.js

import type {Unifier, Env} from '../env.js';

/**
 * Predicate-based matching unifier
 *
 * Delegates matching to a user-supplied function that receives
 * the full unification context (value, stacks, environment). The
 * predicate may return any value — the unify dispatcher uses a
 * truthy check, not strict equality with `true`.
 */
export declare class MatchCondition extends Unifier {
  /** Predicate function — return value is checked for truthiness */
  f: (val: unknown, ls: unknown[], rs: unknown[], env: Env) => unknown;

  /**
   * @param f - Predicate that returns a truthy value when the value matches
   */
  constructor(f: (val: unknown, ls: unknown[], rs: unknown[], env: Env) => unknown);

  /**
   * Delegates to the predicate function
   * @param val - Value to test
   * @param ls - Left argument stack
   * @param rs - Right argument stack
   * @param env - Unification environment
   * @returns Whatever the predicate returned (truthy = match)
   */
  unify(val: unknown, ls: unknown[], rs: unknown[], env: Env): unknown;
}

/**
 * Creates a predicate matcher
 *
 * @param f - Predicate function `(val, ls, rs, env) => unknown` (truthy = match)
 * @returns A new MatchCondition instance
 *
 * @example
 * ```ts
 * const isPositive = matchCondition(val => typeof val === 'number' && val > 0);
 * match({n: 5}, {n: isPositive}); // true
 * ```
 */
export declare const matchCondition: (f: (val: unknown, ls: unknown[], rs: unknown[], env: Env) => unknown) => MatchCondition;
export default matchCondition;
