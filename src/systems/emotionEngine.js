// src/systems/emotionEngine.js

const EMOTIONS = ['neutral', 'curious', 'uneasy', 'awe', 'melancholy', 'fear', 'alert'];

let currentEmotion = 'neutral';
let emotionIntensity = 0.2; // 0.0 to 1.0
let lastShift = Date.now();

function randomShift() {
  const now = Date.now();
  const delta = now - lastShift;

  if (delta > 5000) { // Every 5 seconds, chance of shift
    const shift = Math.random();
    if (shift > 0.6) {
      const newEmotion = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)];
      currentEmotion = newEmotion;
      emotionIntensity = parseFloat((Math.random() * 1.0).toFixed(2));
      lastShift = now;
    }
  }
}

export function getCurrentEmotion() {
  randomShift(); // Mutate if time
  return currentEmotion;
}

export function getCurrentEmotionIntensity() {
  randomShift();
  return emotionIntensity;
}

export function getCurrentGlowColor() {
  switch (currentEmotion) {
    case 'curious': return '#6ed6ff';
    case 'uneasy': return '#a86efc';
    case 'awe': return '#ffffff';
    case 'melancholy': return '#305878';
    case 'fear': return '#ff4560';
    case 'alert': return '#ffff66';
    default: return '#6ed6ff'; // neutral
  }
}
