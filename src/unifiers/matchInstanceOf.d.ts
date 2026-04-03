// Type definitions for deep6 matchInstanceOf unifier
// Generated from src/unifiers/matchInstanceOf.js

import type {Unifier} from '../env.js';

/**
 * Instanceof-based matching unifier
 *
 * Matches values based on constructor/prototype chain using instanceof.
 * Can match against a single constructor or multiple constructors.
 *
 * @example
 * ```ts
 * // Match Date instances
 * const dateMatcher = matchInstanceOf(Date);
 *
 * // Match Array or Set instances
 * const arrayOrSetMatcher = matchInstanceOf([Array, Set]);
 *
 * // Match custom class instances
 * class MyClass {}
 * const myClassMatcher = matchInstanceOf(MyClass);
 * ```
 */
export declare class MatchInstanceOf extends Unifier {
  /** Array of constructors to match against */
  types: (new (...args: any[]) => unknown)[];

  /**
   * Creates a new instanceof matcher
   * @param types - Constructor(s) to match
   */
  constructor(types: (new (...args: any[]) => unknown) | (new (...args: any[]) => unknown)[]);

  /**
   * Attempts to unify a value with the instanceof constraint
   * @param val - Value to check instanceof against
   * @param ls - Left argument stack (unused)
   * @param rs - Right argument stack (unused)
   * @returns True if value is instance of one of the configured constructors
   */
  unify(val: unknown, ls: unknown[], rs: unknown[]): boolean;
}

/**
 * Creates an instanceof-based pattern matcher
 *
 * @param types - Constructor(s) to match against
 * @returns A new MatchInstanceOf unifier instance
 *
 * @example
 * ```ts
 * // Match built-in types
 * const dateMatcher = matchInstanceOf(Date);
 * const regexMatcher = matchInstanceOf(RegExp);
 *
 * // Match multiple types
 * const collectionMatcher = matchInstanceOf([Array, Set, Map]);
 *
 * // Match custom classes
 * class User {}
 * class Admin {}
 * const userMatcher = matchInstanceOf([User, Admin]);
 * ```
 */
export declare const matchInstanceOf: (types: (new (...args: any[]) => unknown) | (new (...args: any[]) => unknown)[]) => MatchInstanceOf;
export default matchInstanceOf;
