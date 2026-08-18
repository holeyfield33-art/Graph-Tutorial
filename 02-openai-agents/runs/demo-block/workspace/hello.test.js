// Intentionally weak test (the demo-block bug): it CALLS hello() but asserts
// nothing, so it would pass even if hello() returned garbage. The verifier
// catches this and the gate returns BLOCK.
const { hello } = require('./hello');
hello('World'); // no assertion — this is the defect
console.log('ran');
