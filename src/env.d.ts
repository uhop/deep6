// Type definitions for deep6 environment
// Generated from src/env.js

/**
 * Unification environment managing variable bindings and stack frames
 *
 * Maintains two parallel prototype-chain structures:
 * - `variables`: maps variable names to their alias groups
 * - `values`: maps variable names/aliases to their bound values
 *
 * Stack frames enable scoped bindings that can be reverted.
 */
export declare class Env {
  /** Map of variable names to their alias groups */
  variables: Record<string | symbol, unknown>;
  /** Map of variable names/aliases to their bound values */
  values: Record<string | symbol, unknown>;
  /** Current stack frame depth */
  depth: number;

  constructor();

  /** Pushes a new stack frame for nested scoping */
  push(): void;

  /**
   * Pops the current stack frame, reverting bindings
   * @throws {Error} If stack is empty
   */
  pop(): void;

  /**
   * Reverts to a specific stack frame depth
   * @param depth - Target depth to revert to
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
   * Binds a variable name (and its aliases) to a value
   * @param name - Variable name to bind
   * @param val - Value to bind
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
   * @returns The bound value, or undefined if unbound
   */
  get(name: string | symbol): unknown;

  /**
   * Returns all variable bindings (for debugging)
   * @returns Array of name/value pairs
   */
  getAllValues(): Array<{name: string | symbol; value: unknown}>;
}

/**
 * Base class for custom unification behavior
 *
 * Subclasses must implement the `unify` method.
 */
export declare class Unifier {
  /**
   * Unifies this unifier with a value
   * @param val - Value to unify with
   * @param ls - Left argument stack
   * @param rs - Right argument stack
   * @param env - Unification environment
   * @returns True if unification succeeds
   */
  unify(val: unknown, ls: unknown[], rs: unknown[], env: Env): boolean;
}

/**
 * Type guard for Unifier instances
 * @param x - Value to check
 * @returns True if x is a Unifier
 */
export declare const isUnifier: (x: unknown) => x is Unifier;

/**
 * Wildcard symbol that matches any value during unification
 */
export declare const any: unique symbol;

/** Alias for `any` */
export declare const _: typeof any;

/**
 * Logical variable for capturing values during unification
 *
 * Variables can be bound to values, aliased to other variables,
 * and dereferenced through an Env.
 */
export declare class Variable extends Unifier {
  /** Variable identifier */
  name: string | symbol;

  /**
   * @param name - Optional identifier (defaults to a unique Symbol)
   */
  constructor(name?: string | symbol);

  /**
   * Checks if this variable is bound in the given environment
   * @param env - Unification environment
   * @returns True if bound
   */
  isBound(env: Env): boolean;

  /**
   * Checks if this variable is aliased to another
   * @param name - Variable name, symbol, or Variable instance
   * @param env - Unification environment
   * @returns True if aliased
   */
  isAlias(name: Variable | string | symbol, env: Env): boolean;

  /**
   * Gets the bound value of this variable
   * @param env - Unification environment
   * @returns The bound value, or undefined if unbound
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
 * Type guard for Variable instances
 * @param x - Value to check
 * @returns True if x is a Variable
 */
export declare const isVariable: (x: unknown) => x is Variable;

/**
 * Creates a new Variable
 * @param name - Optional identifier (defaults to a unique Symbol)
 * @returns A new Variable instance
 */
export declare const variable: (name?: string | symbol) => Variable;
