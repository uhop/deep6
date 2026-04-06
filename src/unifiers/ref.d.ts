// Type definitions for deep6 ref unifier
// Generated from src/unifiers/ref.js

import type {Variable, Env} from '../env.js';

/**
 * Reference unifier for cross-pattern variable binding
 *
 * Binds both a variable and a value to the same input during unification.
 * Pushes `(this.value, val)` and `(this.variable, val)` onto the stacks.
 */
export declare class Ref extends Variable {
  /** The variable being referenced */
  variable: Variable;
  /** The value pattern to unify against */
  value: unknown;

  /**
   * @param variable - Variable name (string) or Variable instance
   * @param value - Value pattern to bind alongside the variable
   */
  constructor(variable: string | Variable, value: unknown);

  /**
   * Pushes value and variable bindings onto the stacks
   * @param val - Input value
   * @param ls - Left argument stack
   * @param rs - Right argument stack
   * @param env - Unification environment
   * @returns Always true
   */
  unify(val: unknown, ls: unknown[], rs: unknown[], env: Env): boolean;
}

/**
 * Creates a reference unifier
 *
 * @param variable - Variable name or Variable instance
 * @param value - Value pattern to bind alongside the variable
 * @returns A new Ref instance
 *
 * @example
 * ```ts
 * const r = ref('x', variable('y'));
 * // During unification, both 'x' and 'y' get bound to the matched value
 * ```
 */
export declare const ref: ((variable: string | Variable, value: unknown) => Ref) & {
  Ref: typeof Ref;
};

export default ref;
