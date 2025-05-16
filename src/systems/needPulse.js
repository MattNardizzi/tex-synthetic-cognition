// src/systems/needPulse.js

let lastNeed = 0;
let lastTimestamp = Date.now();

const baseNeed = 0.8;
const volatility = 0.15;
const cycleSpeed = 3000; // Every 3 seconds

export function getNeedPulse() {
  const now = Date.now();
  const delta = now - lastTimestamp;

  if (delta > cycleSpeed) {
    lastTimestamp = now;

    // Create a "need" that mutates slightly over time — simulates inner urgency
    const mutation = (Math.random() - 0.5) * volatility;
    lastNeed = Math.max(0, Math.min(1.6, lastNeed + mutation));
  }

  return parseFloat(lastNeed.toFixed(4));
}
