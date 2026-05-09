// Type definitions for EnvMap — Map-stack Env sibling.

import type {EnvLike} from './env-shared.js';

/**
 * Map-stack-based unification environment. Sibling of `Env`
 * (`./env.js`); both conform to {@link EnvLike}.
 *
 * Internally maintains parallel `Map`-of-name→value and
 * `Map`-of-name→aliasSet stacks (one entry per stack depth, lazily
 * allocated on first write at that depth). Identity-hashed lookup via
 * `Map` avoids the dict-mode-deopt pressure that hits the proto-chain
 * `Env` on accumulating-symbol workloads.
 *
 * Construct an `EnvMap` and pass it as the third argument to `unify()`
 * to opt into this implementation. Default remains `Env`.
 */
export declare class EnvMap implements EnvLike {
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
