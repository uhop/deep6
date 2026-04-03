// Type definitions for deep6 walk
// Generated from src/traverse/walk.js

/**
 * Context for walk traversal
 */
export interface WalkContext {
  /** Stack of values to process */
  stack?: unknown[];
  /** Output stack for processed values */
  stackOut: unknown[];
  /** Map tracking circular references */
  seen?: Map<unknown, {value?: unknown; actions?: Array<[unknown, unknown]>}>;
  /** Wrapper for Maps */
  wrapMap?: (map: Map<unknown, unknown>) => unknown;
  /** Wrapper for Arrays */
  wrapArray?: (array: unknown[]) => unknown;
  /** Wrapper for Objects */
  wrapObject?: (object: unknown) => unknown;
  /** Enable circular reference handling */
  circular?: boolean;
  /** Include symbol properties */
  symbols?: boolean;
  /** Include non-enumerable properties */
  allProps?: boolean;
  /** Additional context properties */
  [key: string]: unknown;
}

/**
 * Options for walk traversal
 */
export interface WalkOptions {
  /** Custom object processor */
  processObject?: (object: unknown, context: WalkContext) => void;
  /** Custom value processor */
  processOther?: (value: unknown, context: WalkContext) => void;
  /** Custom circular reference processor */
  processCircular?: (value: unknown, context: WalkContext) => void;
  /** Registry of type handlers */
  registry?: Array<[new (...args: any[]) => unknown, (val: unknown, context: WalkContext) => void]>;
  /** Filter functions */
  filters?: Array<(val: unknown, context: WalkContext) => boolean>;
  /** Enable circular reference handling */
  circular?: boolean;
  /** Include symbol properties */
  symbols?: boolean;
  /** Include non-enumerable properties */
  allProps?: boolean;
  /** Custom context object */
  context?: Record<string, unknown>;
}

/**
 * Marker for circular references
 */
export declare class Circular {
  /** The already-seen value */
  value: unknown;
  constructor(value: unknown);
}

/**
 * Deferred processing command
 */
export declare class Command {
  /** Function to execute */
  f: (context: WalkContext) => void;
  /** Source object being processed */
  s: unknown;
  constructor(f: (context: WalkContext) => void, s: unknown);
}

/**
 * Walks an object tree non-recursively
 *
 * Traverses values using a stack-based approach with support for
 * circular references, custom type registries, and filters.
 *
 * @param val - Value to traverse
 * @param options - Walk options and processors
 *
 * @example
 * ```ts
 * walk(value, {
 *   processOther: (v, ctx) => ctx.stackOut.push(v),
 *   circular: true
 * });
 * ```
 */
export declare const walk: (val: unknown, options?: WalkOptions) => void;

// Registry and filters

/**
 * Default registry of type handlers
 */
export declare const registry: Array<[new (...args: any[]) => unknown, (val: unknown, context: WalkContext) => void]>;

/**
 * Default filter functions
 */
export declare const filters: Array<(val: unknown, context: WalkContext) => boolean>;

// Utility processors

/** Processor for non-object values */
export declare const processOther: (value: unknown, context: WalkContext) => void;

/** Processor for circular references */
export declare const processCircular: (value: unknown, context: WalkContext) => void;

/**
 * Creates a Map processor
 * @param postProcess - Post-processor for normal flow
 * @param postProcessSeen - Post-processor for circular refs
 */
export declare const processMap: (
  postProcess?: (context: WalkContext) => void,
  postProcessSeen?: (context: WalkContext) => void
) => (object: Map<unknown, unknown>, context: WalkContext) => void;

/** Handles circular references in Maps */
export declare const postMapCircular: (source: Map<unknown, unknown>, context: WalkContext) => void;

/**
 * Builds a new Map from processed values
 * @param keys - Keys for the new Map
 * @param stackOut - Output stack with values
 * @param wrap - Optional wrapper function
 */
export declare const buildNewMap: (keys: Iterable<unknown>, stackOut: unknown[], wrap?: (map: Map<unknown, unknown>) => unknown) => void;

/**
 * Replaces values in stack with an object
 * @param upTo - Number of values to replace
 * @param object - Object to push
 * @param stackOut - Output stack
 */
export declare const replaceObject: (upTo: number, object: unknown, stackOut: unknown[]) => void;

/**
 * Creates an Object processor
 * @param postProcess - Post-processor for normal flow
 * @param postProcessSeen - Post-processor for circular refs
 */
export declare const processObject: (
  postProcess?: (context: WalkContext) => void,
  postProcessSeen?: (context: WalkContext) => void
) => (object: unknown, context: WalkContext) => void;

/**
 * Handles circular references in Objects
 * @param source - Original object
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
 * Extracts property descriptors and keys
 * @param source - Object to analyze
 * @param context - Walk context
 */
export declare const getObjectData: (
  source: unknown,
  context: WalkContext
) => {descriptors: Record<string | symbol, PropertyDescriptor>; keys: Array<string | symbol>};

/**
 * Builds a new object from processed values
 * @param source - Original object
 * @param descriptors - Property descriptors
 * @param keys - Property keys
 * @param stackOut - Output stack
 * @param wrapper - Optional wrapper
 */
export declare const buildNewObject: (
  source: unknown,
  descriptors: Record<string | symbol, PropertyDescriptor>,
  keys: Array<string | symbol>,
  stackOut: unknown[],
  wrapper?: (object: unknown) => unknown
) => void;

/** Processor for Variable instances */
export declare const processVariable: (value: unknown, context: WalkContext) => void;

/** Processor for Command objects */
export declare const processCommand: (value: unknown, context: WalkContext) => void;

/**
 * Sets up circular reference handling
 * @param seen - Seen values map
 * @param source - Source object
 * @param value - Value to set
 */
export declare const setObject: (seen: Map<unknown, {value?: unknown; actions?: Array<[unknown, unknown]>}>, source: unknown, value: unknown) => void;

export default walk;
