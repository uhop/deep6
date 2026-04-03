// Type definitions for deep6 ref unifier
// Generated from src/unifiers/ref.js

import type {Variable, Env} from '../env.js';

/**
 * Reference variable unifier for cross-pattern matching
 *
 * Ref allows you to reference a variable in one pattern and
 * bind it to a specific value in another pattern. This is useful
 * for creating constraints between different parts of a pattern.
 *
 * @example
 * ```ts
 * // Ensure two properties have the same value
 * const pattern = {
 *   user: ref('name', 'John'),  // References variable 'name' with value 'John'
 *   name: variable('name')      // The actual variable
 * };
 *
 * // Match object where user and name must both be 'John'
 * match({user: 'John', name: 'John'}, pattern); // true
 * match({user: 'John', name: 'Jane'}, pattern); // false
 * ```
 */
export declare class Ref extends Variable {
  /** The variable being referenced */
  variable: Variable;
  /** The value to bind to the variable */
  value: unknown;

  /**
   * Creates a new reference unifier
   * @param variable - Variable name or Variable instance to reference
   * @param value - Value to bind to the variable
   */
  constructor(variable: string | Variable, value: unknown);

  /**
   * Unifies by binding the referenced variable to both the value and the input
   * @param val - Value being unified
   * @param ls - Left argument stack for variable bindings
   * @param rs - Right argument stack for values
   * @param env - Unification environment
   * @returns Always returns true (reference unifiers always succeed)
   */
  unify(val: unknown, ls: unknown[], rs: unknown[], env: Env): boolean;
}

/**
 * Creates a reference variable for cross-pattern matching
 *
 * @param variable - Variable name or Variable instance to reference
 * @param value - Value to bind to the variable
 * @returns A new Ref unifier instance
 *
 * @example
 * ```ts
 * // Simple reference
 * const nameRef = ref('userName', 'Alice');
 *
 * // Using with Variable instance
 * const ageVar = variable('age');
 * const ageRef = ref(ageVar, 25);
 *
 * // Complex pattern with references
 * const userPattern = {
 *   firstName: ref('name', 'John'),
 *   lastName: ref('name', 'John'),  // Same name must appear
 *   age: ref('userAge', 30),
 *   profile: {
 *     name: variable('name'),       // Captures the actual name
 *     age: variable('userAge')      // Captures the actual age
 *   }
 * };
 *
 * // This will match and bind name='John', userAge=30
 * match({
 *   firstName: 'John',
 *   lastName: 'John',
 *   age: 30,
 *   profile: {name: 'John', age: 30}
 * }, userPattern);
 * ```
 */
export declare const ref: ((variable: string | Variable, value: unknown) => Ref) & {
  Ref: typeof Ref;
};

export default ref;
