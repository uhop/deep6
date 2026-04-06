// TypeScript typings test for deep6
// Run with: npx tsc --noEmit tests/test-types.ts
// No runtime tests — only type checking

import equal, {clone, match, isShape, any, _} from '../src/index.js';
import type {EqualOptions, MatchOptions, CloneOptions} from '../src/index.js';
import matchString from '../src/unifiers/matchString.js';
import matchTypeOf from '../src/unifiers/matchTypeOf.js';
import matchInstanceOf from '../src/unifiers/matchInstanceOf.js';
import matchCondition from '../src/unifiers/matchCondition.js';
import ref from '../src/unifiers/ref.js';
import {Env, Variable, Unifier, variable, isVariable, isUnifier} from '../src/env.js';
import unify, {open, soft, isOpen, isSoft, isWrapped} from '../src/unify.js';
import type {UnifyOptions} from '../src/unify.js';
import walk from '../src/traverse/walk.js';
import type {WalkOptions, WalkContext} from '../src/traverse/walk.js';
import {Circular, Command} from '../src/traverse/walk.js';
import cloneFull from '../src/traverse/clone.js';
import type {CloneOptions as FullCloneOptions} from '../src/traverse/clone.js';
import preprocess from '../src/traverse/preprocess.js';
import type {PreprocessOptions} from '../src/traverse/preprocess.js';
import assemble from '../src/traverse/assemble.js';
import type {AssembleOptions} from '../src/traverse/assemble.js';
import deref from '../src/traverse/deref.js';
import type {DerefOptions} from '../src/traverse/deref.js';
import replaceVars from '../src/utils/replaceVars.js';

// --- index.js types ---

const eq: boolean = equal({a: 1}, {a: 1});
const eqOpts: boolean = equal(1, 2, {circular: true, symbols: true, loose: true, ignoreFunctions: true, signedZero: true});
const cl: {a: number} = clone({a: 1});
const clOpts: number[] = clone([1, 2], {circular: true, symbols: true, allProps: true});
const mt: boolean = match({a: 1}, {a: 1});
const mtOpts: boolean = match({a: 1}, {}, {openObjects: true, openMaps: true, openSets: true, openArrays: true, circular: true});
const sh: boolean = isShape({a: 1}, {a: 1});
const w1: typeof any = _;
const w2: typeof any = any;

// --- env.js types ---

const env = new Env();
env.push();
env.pop();
env.revert(0);
env.bindVar('a', 'b');
env.bindVal('a', 42);
const bound: boolean = env.isBound('a');
const alias: boolean = env.isAlias('a', 'b');
const val: unknown = env.get('a');
const all: Array<{name: string | symbol; value: unknown}> = env.getAllValues();

const v1 = variable('x');
const v2 = new Variable();
const vBound: boolean = v1.isBound(env);
const vAlias: boolean = v1.isAlias('y', env);
const vAliasVar: boolean = v1.isAlias(v2, env);
const vGet: unknown = v1.get(env);
const vUnify: boolean = v1.unify(42, [], [], env);

const isVar: boolean = isVariable(v1);
const isUni: boolean = isUnifier(v1);

class CustomUnifier extends Unifier {
  unify(val: unknown, ls: unknown[], rs: unknown[], env: Env): boolean {
    return true;
  }
}

// --- unify.js types ---

const r1: Env | null = unify({a: 1}, {a: 1});
const r2: Env | null = unify({a: 1}, {a: 1}, env);
const r3: Env | null = unify({a: 1}, {a: 1}, null, {circular: true});
const r4: Env | null = unify({a: 1}, {a: 1}, {circular: true, signedZero: true, openObjects: true});

const wrapped = open({a: 1});
const softWrapped = soft({a: 1});
const isO: boolean = isOpen(wrapped);
const isS: boolean = isSoft(softWrapped);
const isW: boolean = isWrapped(wrapped);

// re-exports are usable as constructors
const envFromUnify = new Env();
const varFromUnify = new Variable('test');

// --- traverse/walk.js types ---

walk({a: 1}, {
  processObject: (obj: unknown, ctx: WalkContext) => {},
  processOther: (val: unknown, ctx: WalkContext) => {},
  processCircular: (val: unknown, ctx: WalkContext) => {},
  circular: true,
  symbols: true,
  allProps: true
});

const circ = new Circular({});
const cmd = new Command(() => {}, {});

// --- traverse/clone.js types ---

const cloned = cloneFull({a: 1});
const clonedEnv = cloneFull({a: 1}, env);
const clonedOpts = cloneFull({a: 1}, null, {circular: true, symbols: true, allProps: true});
const clonedOptsOnly = cloneFull({a: 1}, {circular: true});
cloneFull.registry.push(Date, (val: unknown, ctx: unknown) => {});
cloneFull.filters;

// --- traverse/preprocess.js types ---

const pp = preprocess({a: 1}, {openObjects: true, openArrays: true, openMaps: true, openSets: true});
preprocess.registry;
preprocess.filters;

// --- traverse/assemble.js types ---

const asm = assemble({a: v1}, env);
const asmOpts = assemble({a: v1}, env, {circular: true, symbols: true});
const asmOptsOnly = assemble({a: v1}, {circular: true});
assemble.registry;
assemble.filters;

// --- traverse/deref.js types ---

const dr = deref({a: v1}, env);
const drOpts = deref({a: v1}, env, {circular: true});
const drOptsOnly = deref({a: v1}, {circular: true});
deref.registry;
deref.filters;

// --- unifiers types ---

const ms = matchString(/^hello/, [], {});
const mt2 = matchTypeOf('string');
const mt3 = matchTypeOf(['string', 'number']);
const mi = matchInstanceOf(Date);
const mi2 = matchInstanceOf([Date, RegExp]);
const mc = matchCondition((val, ls, rs, env) => true);
const rf = ref('name', 42);
const rf2 = ref(v1, 42);
ref.Ref;

// --- utils types ---

const tmpl = replaceVars(env);
const str: string = tmpl`hello ${v1}`;

console.log('TypeScript typings test passed');
