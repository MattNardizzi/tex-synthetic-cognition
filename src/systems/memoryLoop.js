// src/systems/memoryLoop.js

const MAX_MEMORY = 100;

let memory = [];

export function recordPulse(value) {
  const entry = {
    timestamp: Date.now(),
    pulse: value,
    tone: Math.random() < 0.5 ? 'doubt' : 'drive'
  };

  memory.push(entry);

  // Limit memory size (simulate forgetting)
  if (memory.length > MAX_MEMORY) {
    memory.shift();
  }
}

export function getRecentMemory() {
  return memory.slice(-5);
}

export function getCognitiveBias() {
  const recent = getRecentMemory();
  const doubtCount = recent.filter(entry => entry.tone === 'doubt').length;
  const driveCount = recent.filter(entry => entry.tone === 'drive').length;

  // Shift reaction based on tone bias
  if (doubtCount > driveCount) return 'hesitate';
  if (driveCount > doubtCount) return 'assert';
  return 'neutral';
}
