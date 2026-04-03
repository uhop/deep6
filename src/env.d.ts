// Type definitions for deep6 environment
// Generated from src/env.js

/**
 * Internal symbol used for tracking stack frame depth
 * @internal
 */
export declare const keyDepth: unique symbol;

/**
 * Unification environment managing variable bindings and stack frames
 *
 * The environment maintains two parallel structures:
 * - `variables`: Maps variable names to their alias groups
 * - `values`: Maps variable names/aliases to their bound values
 *
 * Stack frames allow for scoping - variables can be bound in nested
 * contexts and later reverted to previous states.
 */
export declare class Env {
  /** Map of variable names to their alias groups */
  variables: Record<string | symbol, unknown>;
  /** Map of variable names/aliases to their bound values */
  values: Record<string | symbol, unknown>;
  /** Current stack frame depth */
  depth: number;

  /**
   * Creates a new unification environment
   */
  constructor();

  /**
   * Creates a new stack frame for nested scoping
   */
  push(): void;

  /**
   * Pops the current stack frame, reverting to previous state
   * @throws {Error} If attempting to pop with empty stack
   */
  pop(): void;

  /**
   * Reverts to a specific stack frame depth
   * @param depth - The depth to revert to
   * @throws {Error} If depth is higher than current depth
   */
  revert(depth: number): void;

  /**
   * Creates an alias between two variable names
   * @param name1 - First variable name
   * @param name2 - Second variable name
   */
  bindVar(name1: string | symbol, name2: string | symbol): void;

  /**
   * Binds a variable name to a value
   * @param name - Variable name to bind
   * @param val - Value to bind to the variable
   */
  bindVal(name: string | symbol, val: unknown): void;

  /**
   * Checks if a variable is bound to a value
   * @param name - Variable name to check
   * @returns True if variable has a bound value
   */
  isBound(name: string | symbol): boolean;

  /**
   * Checks if two variable names are aliases
   * @param name1 - First variable name
   * @param name2 - Second variable name
   * @returns True if variables are aliases
   */
  isAlias(name1: string | symbol, name2: string | symbol): boolean;

  /**
   * Gets the value bound to a variable
   * @param name - Variable name
   * @returns The bound value or undefined
   */
  get(name: string | symbol): unknown;

  /**
   * Gets all variable bindings for debugging
   * @returns Array of variable name/value pairs
   */
  getAllValues(): Array<{name: string | symbol; value: unknown}>;
}

/**
 * Base class for custom unification behavior
 *
 * Extend this class to create custom pattern matching logic.
 * Subclasses must implement the `unify` method.
 */
export declare class Unifier {}

/**
 * Type guard to check if a value is a Unifier instance
 * @param x - Value to check
 * @returns True if x is a Unifier
 */
export declare const isUnifier: (x: unknown) => x is Unifier;

/**
 * Wildcard symbol that matches any value in unification
 * Can be used as `any` or `_` interchangeably
 */
export declare const any: unique symbol;
export declare const _: typeof any;

/**
 * Logical variable for unification
 *
 * Variables can be bound to values during unification and
 * later dereferenced. They support aliasing with other variables.
 */
export declare class Variable extends Unifier {
  /** Variable identifier (string or symbol) */
  name: string | symbol;

  /**
   * Creates a new logical variable
   * @param name - Optional variable name/identifier
   */
  constructor(name?: string | symbol);

  /**
   * Checks if this variable is bound to a value
   * @param env - Unification environment
   * @returns True if variable has a bound value
   */
  isBound(env: Env): boolean;

  /**
   * Checks if this variable is an alias of another variable
   * @param name - Other variable name to check
   * @param env - Unification environment
   * @returns True if variables are aliases
   */
  isAlias(name: string | symbol, env: Env): boolean;

  /**
   * Gets the value bound to this variable
   * @param env - Unification environment
   * @returns The bound value or undefined
   */
  get(env: Env): unknown;

  /**
   * Unifies this variable with a value
   * @param val - Value to unify with
   * @param ls - Left argument stack
   * @param rs - Right argument stack
   * @param env - Unification environment
   * @returns True if unification succeeds
   */
  unify(val: unknown, ls: unknown[], rs: unknown[], env: Env): boolean;
}

/**
 * Type guard to check if a value is a Variable instance
 * @param x - Value to check
 * @returns True if x is a Variable
 */
export declare const isVariable: (x: unknown) => x is Variable;

/**
 * Factory function to create a new Variable
 * @param name - Optional variable name/identifier
 * @returns A new Variable instance
 */
export declare const variable: (name?: string | symbol) => Variable;
