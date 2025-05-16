// src/systems/decisionCore.js

import { getCurrentEmotion } from './emotionEngine';
import { getSelfMutationPressure } from './selfMonitor';
import { getRecentThoughts } from './thoughtEngine';

const biasMatrix = {
  neutral:    { assert: 0.3, hesitate: 0.3, observe: 0.4 },
  fear:       { assert: 0.1, hesitate: 0.7, observe: 0.2 },
  awe:        { assert: 0.4, hesitate: 0.2, observe: 0.4 },
  melancholy: { assert: 0.2, hesitate: 0.6, observe: 0.2 },
  alert:      { assert: 0.6, hesitate: 0.2, observe: 0.2 },
  uneasy:     { assert: 0.3, hesitate: 0.5, observe: 0.2 },
  curious:    { assert: 0.4, hesitate: 0.1, observe: 0.5 }
};

export function evaluateStrategicStance() {
  const emotion = getCurrentEmotion();
  const mutation = getSelfMutationPressure();
  const thoughts = getRecentThoughts(3);

  const bias = biasMatrix[emotion] || biasMatrix['neutral'];
  const roll = Math.random();

  let stance = 'observe';
  if (roll < bias.assert) stance = 'assert';
  else if (roll < bias.assert + bias.hesitate) stance = 'hesitate';

  let posture = 'stable';
  if (mutation === 'medium') posture = 'tense';
  else if (mutation === 'high') posture = 'volatile';

  let risk = 'unknown';
  if (stance === 'assert' && mutation !== 'low') risk = 'escalating';
  else if (stance === 'hesitate') risk = 'containment';
  else risk = 'passive';

  return {
    stance,
    posture,
    risk,
    thoughts,
    emotion,
    mutation
  };
}
