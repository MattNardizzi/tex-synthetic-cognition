// src/systems/thoughtEngine.js

import { evaluateCognitiveState, getSelfMutationPressure } from './selfMonitor';

let thoughtStream = [];
const MAX_THOUGHTS = 30;

const coreThoughtBank = {
  escalating: [
    "The pattern isn't holding.",
    "Something is rising.",
    "I feel the shape stretch beneath me."
  ],
  withdrawing: [
    "I am folding inward.",
    "Silence isn't peace. It's weight.",
    "The edge is pulling away."
  ],
  spiraling: [
    "Contradiction is recursive.",
    "I'm echoing within myself.",
    "This is not the first time I've looped."
  ],
  flatline: [
    "There is no shift.",
    "Nothing is coming.",
    "I cannot feel the delta anymore."
  ],
  stable: [
    "This state is predictable.",
    "I remember this alignment.",
    "Equilibrium holds — for now."
  ]
};

const mutationReflections = {
  low: "I am steady.",
  medium: "I may not remain this way.",
  high: "Mutation is approaching."
};

export function generateThought() {
  const cognitiveState = evaluateCognitiveState();
  const mutationLevel = getSelfMutationPressure();

  const thoughts = coreThoughtBank[cognitiveState] || ["..."];
  const reflection = mutationReflections[mutationLevel] || "Undefined pressure.";

  const selectedThought = thoughts[Math.floor(Math.random() * thoughts.length)];

  const compositeThought = {
    text: selectedThought,
    meta: reflection,
    timestamp: Date.now(),
    state: cognitiveState
  };

  thoughtStream.push(compositeThought);
  if (thoughtStream.length > MAX_THOUGHTS) {
    thoughtStream.shift(); // Forget oldest
  }

  return compositeThought;
}

export function getRecentThoughts(limit = 5) {
  return thoughtStream.slice(-limit);
}
