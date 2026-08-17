#!/usr/bin/env node
/**
 * A small cost/latency calculator: same total work, sequential vs parallel,
 * showing that "faster" and "cheaper" are NOT the same variable — and that
 * more agents is not automatically better.
 *
 * Run: node example.js
 */

'use strict';

function costAndLatency({ nodeCount, secondsPerCall, costPerCallUsd, parallel }) {
  const totalCostUsd = nodeCount * costPerCallUsd; // cost doesn't care about ordering
  const latencySeconds = parallel ? secondsPerCall : nodeCount * secondsPerCall;
  return { totalCostUsd, latencySeconds };
}

function report(label, config) {
  const { totalCostUsd, latencySeconds } = costAndLatency(config);
  console.log(
    `${label.padEnd(28)} nodes=${String(config.nodeCount).padEnd(4)} ` +
    `cost=$${totalCostUsd.toFixed(4).padEnd(8)} latency=${latencySeconds}s`
  );
}

function main() {
  const perCallCost = 0.01; // illustrative — check your own provider's real pricing
  const perCallSeconds = 3;

  console.log('--- same 5 nodes, sequential vs parallel ---');
  report('5 nodes, sequential', { nodeCount: 5, secondsPerCall: perCallSeconds, costPerCallUsd: perCallCost, parallel: false });
  report('5 nodes, parallel', { nodeCount: 5, secondsPerCall: perCallSeconds, costPerCallUsd: perCallCost, parallel: true });

  console.log('\n--- scaling node count, parallel each time ---');
  for (const n of [5, 20, 100]) {
    report(`${n} nodes, parallel`, { nodeCount: n, secondsPerCall: perCallSeconds, costPerCallUsd: perCallCost, parallel: true });
  }

  console.log('\nNotice: parallel latency barely moved as node count went up.');
  console.log('Cost scaled LINEARLY with node count regardless of parallel or sequential.');
  console.log('More parallelism buys you latency. It does NOT buy you cost. Those are separate variables.');
}

main();
