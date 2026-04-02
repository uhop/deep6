// Test CommonJS imports work without createRequire bridge
const {equal, clone, match, any} = require('../src/index.js');
const {default: matchString} = require('../src/unifiers/matchString.js');

console.log('Testing CommonJS imports...');

// Test 1: Main imports work
console.log('equal:', typeof equal);
console.log('clone:', typeof clone);
console.log('match:', typeof match);
console.log('any:', typeof any);

// Test 2: Subpath import works
console.log('matchString:', typeof matchString);

// Test 3: Basic functionality
const x = {a: 1, b: 2};
const y = clone(x);
console.log('clone works:', equal(x, y));

// Test 4: matchString works
const result = match('hello world', matchString(/^hello/));
console.log('matchString works:', result);

console.log('All CommonJS imports verified!');
