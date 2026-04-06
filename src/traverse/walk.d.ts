// Type definitions for deep6 walk
// Generated from src/traverse/walk.js

/**
 * Context object available during walk traversal
 */
export interface WalkContext {
  /** Stack of values to process */
  stack: unknown[];
  /** Output stack for processed values */
  stackOut: unknown[];
  /** Map tracking circular references (present when circular: true) */
  seen: Map<unknown, {value?: unknown; actions?: Array<[unknown, unknown]>}> | null;
  /** Include symbol properties */
  symbols?: boolean;
  /** Include non-enumerable properties */
  allProps?: boolean;
  /** Optional environment for variable handling */
  env?: unknown;
  /** Wrapper for Maps (set by preprocess) */
  wrapMap?: (map: Map<unknown, unknown>) => unknown;
  /** Wrapper for Arrays (set by preprocess) */
  wrapArray?: (array: unknown[]) => unknown;
  /** Wrapper for Objects (set by preprocess) */
  wrapObject?: (object: unknown) => unknown;
  /** Wrapper for Sets (set by preprocess) */
  wrapSet?: (set: Set<unknown>) => unknown;
  /** Additional context properties */
  [key: string]: unknown;
}

/**
 * Options for walk traversal
 */
export interface WalkOptions {
  /** Custom object processor */
  processObject?: (object: unknown, context: WalkContext) => void;
  /** Custom non-object value processor */
  processOther?: (value: unknown, context: WalkContext) => void;
  /** Custom circular reference processor */
  processCircular?: (value: unknown, context: WalkContext) => void;
  /**
   * Flat array of type handler pairs: [Constructor, handler, Constructor, handler, ...]
   *
   * Each pair maps a constructor to a processing function.
   */
  registry?: unknown[];
  /** Array of filter functions — return true to indicate value was handled */
  filters?: Array<(val: unknown, context: WalkContext) => boolean>;
  /** Enable circular reference detection */
  circular?: boolean;
  /** Include symbol properties */
  symbols?: boolean;
  /** Include non-enumerable properties */
  allProps?: boolean;
  /** Custom context object (properties are merged into WalkContext) */
  context?: Record<string, unknown>;
}

/**
 * Marker for values that were already seen (circular references)
 */
export declare class Circular {
  /** The already-seen value */
  value: unknown;
  constructor(value: unknown);
}

/**
 * Deferred processing command pushed onto the walk stack
 */
export declare class Command {
  /** Function to execute during post-processing */
  f: (context: WalkContext) => void;
  /** Source object being processed */
  s: unknown;
  constructor(f: (context: WalkContext) => void, s: unknown);
}

/**
 * Non-recursive stack-based object tree walker
 *
 * Traverses values using an explicit stack with support for
 * circular references, type registries, and filters.
 *
 * @param o - Value to traverse
 * @param options - Walk options and processors
 */
export declare const walk: ((o: unknown, options?: WalkOptions) => void) & {
  Command: typeof Command;
};

/**
 * Default type handler registry (flat array of [Constructor, handler] pairs)
 */
export declare const registry: unknown[];

/**
 * Default filter functions
 */
export declare const filters: Array<(val: unknown, context: WalkContext) => boolean>;

// Utility processors

/** Pushes value to stackOut unchanged */
export declare const processOther: (value: unknown, context: WalkContext) => void;

/** Pushes a Circular marker to stackOut */
export declare const processCircular: (value: unknown, context: WalkContext) => void;

/**
 * Creates a Map processor with optional post-processing
 * @param postProcess - Post-processor for normal flow
 * @param postProcessSeen - Post-processor when circular refs are tracked
 * @returns Map processing function
 */
export declare const processMap: (
  postProcess?: (context: WalkContext) => void,
  postProcessSeen?: (context: WalkContext) => void
) => (object: Map<unknown, unknown>, context: WalkContext) => void;

/**
 * Post-processes a Map with circular reference resolution
 * @param source - Original Map
 * @param context - Walk context
 */
export declare const postMapCircular: (source: Map<unknown, unknown>, context: WalkContext) => void;

/**
 * Builds a new Map from processed values on stackOut
 * @param keys - Keys for the new Map
 * @param stackOut - Output stack with values
 * @param wrap - Optional wrapper function
 */
export declare const buildNewMap: (keys: Iterable<unknown>, stackOut: unknown[], wrap?: (map: Map<unknown, unknown>) => unknown) => void;

/**
 * Replaces stackOut entries from upTo to end with a single object
 * @param upTo - Index offset from end
 * @param object - Object to push
 * @param stackOut - Output stack
 */
export declare const replaceObject: (upTo: number, object: unknown, stackOut: unknown[]) => void;

/**
 * Creates an Object processor with optional post-processing
 * @param postProcess - Post-processor for normal flow
 * @param postProcessSeen - Post-processor when circular refs are tracked
 * @returns Object processing function
 */
export declare const processObject: (
  postProcess?: (context: WalkContext) => void,
  postProcessSeen?: (context: WalkContext) => void
) => (object: unknown, context: WalkContext) => void;

/**
 * Post-processes an Object with circular reference resolution
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
 * Extracts property descriptors and keys from an object
 * @param object - Object to analyze
 * @param context - Walk context (uses symbols and allProps flags)
 * @returns Descriptors and keys
 */
export declare const getObjectData: (
  object: unknown,
  context: WalkContext
) => {descriptors: Record<string | symbol, PropertyDescriptor>; keys: Array<string | symbol>};

/**
 * Builds a new object from processed values on stackOut
 * @param source - Original object (used for prototype and array detection)
 * @param descriptors - Property descriptors
 * @param keys - Property keys
 * @param stackOut - Output stack with values
 * @param wrap - Optional wrapper function
 */
export declare const buildNewObject: (
  source: unknown,
  descriptors: Record<string | symbol, PropertyDescriptor>,
  keys: Array<string | symbol>,
  stackOut: unknown[],
  wrap?: (object: unknown) => unknown
) => void;

/**
 * Resolves a Variable to its bound value and pushes to the stack
 * @param val - Variable instance
 * @param context - Walk context (uses context.env)
 */
export declare const processVariable: (val: unknown, context: WalkContext) => void;

/**
 * Executes a Command's function
 * @param val - Command instance
 * @param context - Walk context
 */
export declare const processCommand: (val: unknown, context: WalkContext) => void;

/**
 * Resolves circular reference actions for a seen object
 * @param seen - Map of seen objects
 * @param source - Source object
 * @param value - Resolved value
 */
export declare const setObject: (seen: Map<unknown, {value?: unknown; actions?: Array<[unknown, unknown]>}>, source: unknown, value: unknown) => void;

export default walk;
