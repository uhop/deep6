// Type definitions for deep6 matchInstanceOf unifier
// Generated from src/unifiers/matchInstanceOf.js

import type {Unifier} from '../env.js';

/**
 * Instanceof-based matching unifier
 *
 * Matches values by their prototype chain. Rejects falsy values and unbound Variables.
 */
export declare class MatchInstanceOf extends Unifier {
  /** Array of constructors to match against */
  types: (new (...args: any[]) => unknown)[];

  /**
   * @param types - Constructor or array of constructors
   */
  constructor(types: (new (...args: any[]) => unknown) | (new (...args: any[]) => unknown)[]);

  /**
   * Tests if the value is an instance of one of the configured constructors
   * @param val - Value to check
   * @param ls - Left argument stack (unused)
   * @param rs - Right argument stack (unused)
   * @returns True if val is an instance of any configured type
   */
  unify(val: unknown, ls: unknown[], rs: unknown[]): boolean;
}

/**
 * Creates an instanceof matcher
 *
 * @param types - Constructor(s) to match against
 * @returns A new MatchInstanceOf instance
 */
export declare const matchInstanceOf: (types: (new (...args: any[]) => unknown) | (new (...args: any[]) => unknown)[]) => MatchInstanceOf;
export default matchInstanceOf;
