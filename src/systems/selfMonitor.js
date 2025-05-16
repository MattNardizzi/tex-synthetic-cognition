// src/systems/selfMonitor.js

import { getRecentMemory } from './memoryLoop';

let previousBias = 'neutral';
let changeCount = 0;
let shiftLog = [];

export function evaluateCognitiveState() {
  const recent = getRecentMemory();
  const recentValues = recent.map(entry => entry.pulse);

  if (recentValues.length < 3) return 'insufficient data';

  const avg = recentValues.reduce((sum, v) => sum + v, 0) / recentValues.length;
  const delta = Math.abs(recentValues[recentValues.length - 1] - recentValues[0]);

  let state = 'stable';

  if (delta > 0.3 && avg > 1.2) state = 'escalating';
  else if (delta > 0.3 && avg < 0.7) state = 'withdrawing';
  else if (delta > 0.5) state = 'spiraling';
  else if (avg >= 0.95 && avg <= 1.05) state = 'flatline';

  if (state !== previousBias) {
    shiftLog.push({ from: previousBias, to: state, timestamp: Date.now() });
    previousBias = state;
    changeCount += 1;
  }

  return state;
}

export function getSelfMutationPressure() {
  if (changeCount > 12) return 'high';
  if (changeCount > 6) return 'medium';
  return 'low';
}

export function getShiftLog() {
  return shiftLog.slice(-10);
}
