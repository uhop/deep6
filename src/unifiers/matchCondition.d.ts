// Type definitions for deep6 matchCondition unifier
// Generated from src/unifiers/matchCondition.js

import type {Unifier, Env} from '../env.js';

/**
 * Predicate-based matching unifier
 *
 * Delegates matching to a user-supplied function that receives
 * the full unification context (value, stacks, environment).
 */
export declare class MatchCondition extends Unifier {
  /** Predicate function */
  f: (val: unknown, ls: unknown[], rs: unknown[], env: Env) => boolean;

  /**
   * @param f - Predicate that returns true if the value matches
   */
  constructor(f: (val: unknown, ls: unknown[], rs: unknown[], env: Env) => boolean);

  /**
   * Delegates to the predicate function
   * @param val - Value to test
   * @param ls - Left argument stack
   * @param rs - Right argument stack
   * @param env - Unification environment
   * @returns Result of the predicate
   */
  unify(val: unknown, ls: unknown[], rs: unknown[], env: Env): boolean;
}

/**
 * Creates a predicate matcher
 *
 * @param f - Predicate function `(val, ls, rs, env) => boolean`
 * @returns A new MatchCondition instance
 *
 * @example
 * ```ts
 * const isPositive = matchCondition(val => typeof val === 'number' && val > 0);
 * match({n: 5}, {n: isPositive}); // true
 * ```
 */
export declare const matchCondition: (f: (val: unknown, ls: unknown[], rs: unknown[], env: Env) => boolean) => MatchCondition;
export default matchCondition;
