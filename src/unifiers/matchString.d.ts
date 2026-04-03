// Type definitions for deep6 matchString unifier
// Generated from src/unifiers/matchString.js

import type {Unifier} from '../env.js';

/**
 * RegExp-based string matching unifier
 *
 * Matches strings against regular expressions and optionally captures
 * match groups and properties for variable binding.
 *
 * @example
 * ```ts
 * // Match email and capture parts
 * const emailMatcher = matchString(
 *   /^(.+)\@(.+)$/,
 *   'matches',  // variable to store full match array
 *   'props'     // variable to store match properties
 * );
 * ```
 */
export declare class MatchString extends Unifier {
  /** Regular expression to match against */
  regexp: RegExp;
  /** Variable name to capture match array (optional) */
  matches?: unknown;
  /** Variable name to capture match properties (optional) */
  props?: unknown;

  /**
   * Creates a new string matcher
   * @param regexp - Regular expression to match
   * @param matches - Variable to store match array (optional)
   * @param props - Variable to store match properties (optional)
   */
  constructor(regexp: RegExp, matches?: unknown, props?: unknown);

  /**
   * Attempts to unify a value with the regex pattern
   * @param val - Value to match (must be string-like)
   * @param ls - Left argument stack for variable bindings
   * @param rs - Right argument stack for values
   * @returns True if value matches the pattern
   */
  unify(val: unknown, ls: unknown[], rs: unknown[]): boolean;
}

/**
 * Creates a string pattern matcher
 *
 * @param regexp - Regular expression to match against
 * @param matches - Variable name to capture full match array (optional)
 * @param props - Variable name to capture match properties (optional)
 * @returns A new MatchString unifier instance
 *
 * @example
 * ```ts
 * // Simple pattern matching
 * const matcher = matchString(/^hello/i);
 *
 * // With capture groups
 * const matcherWithCaptures = matchString(
 *   /^(\w+)\s+(\w+)$/,
 *   'names'  // Will capture ['First', 'Last']
 * );
 * ```
 */
export declare const matchString: (regexp: RegExp, matches?: unknown, props?: unknown) => MatchString;
export default matchString;
