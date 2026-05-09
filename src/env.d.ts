// Type definitions for deep6 environment (proto-chain implementation).

import type {EnvLike} from './env-shared.js';

/**
 * Unification environment managing variable bindings and stack frames.
 *
 * Maintains two parallel prototype-chain structures internally; external
 * code interacts via the method API (see {@link EnvLike}). `EnvMap`
 * (`./env-map.js`) is a sibling implementation that conforms to the
 * same contract.
 */
export declare class Env implements EnvLike {
  /** Current stack frame depth */
  depth: number;
  /** Behavioural flags read by `unify()` (openObjects, circular, symbols, etc.) */
  options: Record<string, unknown>;

  constructor();

  /** Pushes a new stack frame for nested scoping */
  push(): void;

  /**
   * Pops the current stack frame, reverting bindings.
   * @throws {Error} If stack is empty
   */
  pop(): void;

  /**
   * Reverts to a specific stack frame depth.
   * @throws {Error} If depth is higher than current depth
   */
  revert(depth: number): void;

  /** Creates an alias between two variable names */
  bindVar(name1: string | symbol, name2: string | symbol): void;

  /** Binds a variable name (and its aliases) to a value */
  bindVal(name: string | symbol, val: unknown): void;

  /** Checks if a variable is bound to a value */
  isBound(name: string | symbol): boolean;

  /** Checks if two variable names are aliases */
  isAlias(name1: string | symbol, name2: string | symbol): boolean;

  /** Gets the value bound to a variable, or `undefined` if unbound */
  get(name: string | symbol): unknown;

  /** Returns all variable bindings (for debugging) */
  getAllValues(): Array<{name: string | symbol; value: unknown}>;
}

export {Unifier, isUnifier, Variable, variable, isVariable, _, any, EnvLike} from './env-shared.js';
