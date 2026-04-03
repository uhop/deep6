// Type definitions for deep6 walk
// Generated from src/traverse/walk.js

/**
 * Context object passed to walk processors
 */
export interface WalkContext {
  /** Processing stack for values to visit */
  stack?: unknown[];
  /** Output stack for processed values */
  stackOut: unknown[];
  /** Map for tracking circular references */
  seen?: Map<unknown, {value?: unknown; actions?: Array<[unknown, unknown]>}>;
  /** Optional wrapper function for Maps */
  wrapMap?: (map: Map<unknown, unknown>) => unknown;
  /** Optional wrapper function for Arrays */
  wrapArray?: (array: unknown[]) => unknown;
  /** Optional wrapper function for Objects */
  wrapObject?: (object: unknown) => unknown;
  /** Handle circular references (default: false) */
  circular?: boolean;
  /** Include symbol properties (default: false) */
  symbols?: boolean;
  /** Include non-enumerable properties (default: false) */
  allProps?: boolean;
  /** Use loose equality for primitives (default: false) */
  loose?: boolean;
  /** Ignore function properties (default: false) */
  ignoreFunctions?: boolean;
  /** Additional context properties */
  [key: string]: unknown;
}

/**
 * Wrapper for circular reference detection during traversal
 */
export declare class Circular {
  /** The value that was already seen */
  value: unknown;

  constructor(value: unknown);
}

/**
 * Command object for deferred processing during traversal
 */
export declare class Command {
  /** Function to execute */
  f: (context: WalkContext) => void;
  /** Left argument */
  l: unknown;
  /** Right argument (optional) */
  r?: unknown;
  /** Environment (optional) */
  e?: unknown;

  constructor(f: (context: WalkContext) => void, l: unknown, r?: unknown, e?: unknown);
}

/**
 * Core walker function for traversing object structures
 *
 * Non-recursive stack-based traversal that handles circular references
 * and supports extensible type registries and filters.
 *
 * @param val - Value to traverse
 * @param context - Traversal context with options and processors
 * @param registry - Array of [Constructor, processor] pairs for type handling
 *
 * @example
 * ```ts
 * const context = {
 *   stackOut: [],
 *   circular: true,
 *   symbols: false
 * };
 *
 * walk(value, context, [
 *   [Date, (val, ctx) => ctx.stackOut.push(new Date(val.getTime()))],
 *   [Array, processArray],
 *   [Object, processObject]
 * ]);
 * ```
 */
export declare const walk: (
  val: unknown,
  context: WalkContext,
  registry: Array<[new (...args: any[]) => unknown, (val: unknown, context: WalkContext) => void]>
) => void;

// Utility processors for building custom walkers

/**
 * Default processor for unknown types - pushes value as-is
 * @param value - Value to process
 * @param context - Walk context
 */
export declare const processOther: (value: unknown, context: WalkContext) => void;

/**
 * Processor for circular references - wraps in Circular object
 * @param value - Value that was already seen
 * @param context - Walk context
 */
export declare const processCircular: (value: unknown, context: WalkContext) => void;

/**
 * Creates a Map processor
 * @param postProcess - Optional post-processing function
 * @param postProcessSeen - Optional post-processing for circular refs
 * @returns Map processor function
 */
export declare const processMap: (
  postProcess?: (context: WalkContext) => void,
  postProcessSeen?: (context: WalkContext) => void
) => (object: Map<unknown, unknown>, context: WalkContext) => void;

/**
 * Handles circular references in Maps
 * @param source - Original Map being processed
 * @param context - Walk context
 */
export declare const postMapCircular: (source: Map<unknown, unknown>, context: WalkContext) => void;

/**
 * Builds a new Map from processed values
 * @param keys - Keys for the new Map
 * @param stackOut - Output stack containing values
 * @param wrap - Optional wrapper function
 */
export declare const buildNewMap: (keys: Iterable<unknown>, stackOut: unknown[], wrap?: (map: Map<unknown, unknown>) => unknown) => void;

/**
 * Creates an Object processor
 * @param postProcess - Optional post-processing function
 * @param postProcessSeen - Optional post-processing for circular refs
 * @returns Object processor function
 */
export declare const processObject: (
  postProcess?: (context: WalkContext) => void,
  postProcessSeen?: (context: WalkContext) => void
) => (object: unknown, context: WalkContext) => void;

/**
 * Handles circular references in Objects
 * @param source - Original object being processed
 * @param descriptors - Property descriptors
 * @param keys - Property keys
 * @param context - Walk context
 */
export declare const postObjectCircular: (
  source: unknown,
  descriptors: Record<string | symbol, PropertyDescriptor>,
  keys: Array<string | symbol>,
  context: WalkContext
) => void;

/**
 * Extracts property descriptors and keys from an object
 * @param source - Object to analyze
 * @param context - Walk context
 * @returns Object with descriptors and keys
 */
export declare const getObjectData: (
  source: unknown,
  context: WalkContext
) => {descriptors: Record<string | symbol, PropertyDescriptor>; keys: Array<string | symbol>};

/**
 * Builds a new object from processed values
 * @param source - Original object (for prototype)
 * @param descriptors - Property descriptors
 * @param keys - Property keys
 * @param stackOut - Output stack containing values
 * @param wrapper - Optional wrapper function
 */
export declare const buildNewObject: (
  source: unknown,
  descriptors: Record<string | symbol, PropertyDescriptor>,
  keys: Array<string | symbol>,
  stackOut: unknown[],
  wrapper?: (object: unknown) => unknown
) => void;

/**
 * Processor for Variable instances - handles variable binding
 * @param value - Variable to process
 * @param context - Walk context
 */
export declare const processVariable: (value: unknown, context: WalkContext) => void;

/**
 * Processor for Command objects - executes deferred commands
 * @param value - Command to execute
 * @param context - Walk context
 */
export declare const processCommand: (value: unknown, context: WalkContext) => void;
