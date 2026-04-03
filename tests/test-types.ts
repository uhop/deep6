// TypeScript test file for deep6 typings
// This file tests that all TypeScript typings work correctly
// No actual functionality tests here - those are in tests.js

import equal, {clone, match, any, _} from '../src/index.js';
import matchString from '../src/unifiers/matchString.js';
import matchTypeOf from '../src/unifiers/matchTypeOf.js';
import matchInstanceOf from '../src/unifiers/matchInstanceOf.js';
import matchCondition from '../src/unifiers/matchCondition.js';
import ref from '../src/unifiers/ref.js';
import {Env, Variable, variable} from '../src/env.js';
import {unify} from '../src/unify.js';

// Test basic types
const x: {a: number; b: string} = {a: 1, b: 'hello'};
const y: typeof x = clone(x);

// Test equal function
const isEqual: boolean = equal(x, y);
const isEqualWithOptions: boolean = equal(x, y, {circular: true});

// Test match function
const isMatch: boolean = match(x, {a: 1});
const isMatchWithOptions: boolean = match(x, {a: 1}, {openObjects: true});

// Test unifiers
const stringMatcher = matchString(/^hello/);
const typeMatcher = matchTypeOf('string');
const instanceMatcher = matchInstanceOf(Date);
const conditionMatcher = matchCondition((val: any) => val > 0);
const refMatcher = ref('var', 'value');

// Test environment
const env = new Env();
const v = variable('test');

// Test unify
const result: Env | null = unify(x, y);
const resultWithEnv: Env | null = unify(x, y, env);

// Test wildcard
const wildcard: typeof any = _;
const wildcard2: typeof any = any;

// Test imports work
console.log('TypeScript typings test passed');
