// A real test: it asserts on the return value, so it would FAIL if hello() was wrong.
const { hello } = require('./hello');
const out = hello('World');
if (!out.includes('World')) {
  throw new Error(`expected greeting to include "World", got: ${out}`);
}
console.log('ok:', out);
