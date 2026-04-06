// Type definitions for deep6 matchString unifier
// Generated from src/unifiers/matchString.js

import type {Unifier} from '../env.js';

/**
 * RegExp-based string matching unifier
 *
 * Matches values against a regular expression. Optionally captures
 * the match array and match properties (index, input) for variable binding.
 */
export declare class MatchString extends Unifier {
  /** Regular expression to match against */
  regexp: RegExp;
  /** Pattern to unify with the match result array (optional) */
  matches?: unknown;
  /** Pattern to unify with match properties {index, input} (optional) */
  props?: unknown;

  /**
   * @param regexp - Regular expression to match
   * @param matches - Pattern to unify with match array (optional)
   * @param props - Pattern to unify with {index, input} (optional)
   */
  constructor(regexp: RegExp, matches?: unknown, props?: unknown);

  /**
   * Tests a value against the regex and pushes capture bindings
   * @param val - Value to match (coerced to string)
   * @param ls - Left argument stack
   * @param rs - Right argument stack
   * @returns Truthy if the regex matches
   */
  unify(val: unknown, ls: unknown[], rs: unknown[]): boolean;
}

/**
 * Creates a regex string matcher
 *
 * @param regexp - Regular expression to match against
 * @param matches - Pattern to unify with the full match array (optional)
 * @param props - Pattern to unify with {index, input} (optional)
 * @returns A new MatchString instance
 *
 * @example
 * ```ts
 * // Simple matching
 * matchString(/^hello/i);
 *
 * // With captures bound to a variable array
 * const names = [any, variable('first'), variable('last')];
 * matchString(/^(\w+)\s+(\w+)$/, names);
 * ```
 */
export declare const matchString: (regexp: RegExp, matches?: unknown, props?: unknown) => MatchString;
export default matchString;
