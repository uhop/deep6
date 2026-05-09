// Shared primitives for Env implementations: Unifier, Variable, wildcards.

import type {Env} from './env.js';

/**
 * Method contract every `Env` implementation must satisfy. `Env`
 * (`./env.js`, proto-chain) and `EnvMap` (`./env-map.js`, Map-stack)
 * both declare `implements EnvLike`. Variable / Unifier consumers can
 * type the `env` parameter as `EnvLike` instead of `Env` when they
 * want to accept any conforming implementation.
 *
 * Internal storage (`variables`, `values`, `valuesStack`, etc.) is NOT
 * part of the contract — implementations are free to choose. Callers
 * should only use the methods listed here plus `options`.
 */
export interface EnvLike {
  /** Current stack frame depth */
  depth: number;
  /** Behavioural flags read by `unify()` (openObjects, circular, symbols, etc.) */
  options: Record<string, unknown>;

  push(): void;
  pop(): void;
  revert(depth: number): void;
  bindVar(name1: string | symbol, name2: string | symbol): void;
  bindVal(name: string | symbol, val: unknown): void;
  isBound(name: string | symbol): boolean;
  isAlias(name1: string | symbol, name2: string | symbol): boolean;
  get(name: string | symbol): unknown;
  getAllValues(): Array<{name: string | symbol; value: unknown}>;
}

/**
 * Base class for custom unification behavior.
 *
 * Subclasses must implement the `unify` method. The return value is checked
 * for truthiness by the dispatcher — any truthy value means success, any
 * falsy value means failure. Built-in subclasses narrow the return to
 * `boolean`; user-supplied predicates (e.g., via `matchCondition`) may
 * return whatever they want.
 */
export declare class Unifier {
  unify(val: unknown, ls: unknown[], rs: unknown[], env: Env): unknown;
}

/** Type guard for Unifier instances */
export declare const isUnifier: (x: unknown) => x is Unifier;

/** Wildcard symbol that matches any value during unification */
export declare const any: unique symbol;

/** Alias for `any` */
export declare const _: typeof any;

/**
 * Logical variable for capturing values during unification.
 *
 * Variables can be bound to values, aliased to other variables,
 * and dereferenced through an Env via the method API (`isBound`,
 * `isAlias`, `get`). The Env implementation is duck-typed — any
 * object satisfying the Env method contract works.
 */
export declare class Variable extends Unifier {
  /** Variable identifier */
  name: string | symbol;

  /**
   * @param name - Optional identifier (defaults to a unique Symbol)
   */
  constructor(name?: string | symbol);

  isBound(env: Env): boolean;
  isAlias(name: Variable | string | symbol, env: Env): boolean;
  get(env: Env): unknown;
  unify(val: unknown, ls: unknown[], rs: unknown[], env: Env): boolean;
}

/** Type guard for Variable instances */
export declare const isVariable: (x: unknown) => x is Variable;

/** Creates a new Variable */
export declare const variable: (name?: string | symbol) => Variable;
