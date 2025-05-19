// src/systems/emotionEngine.js — Sovereign Cognition Emotion Layer v3.0
// -----------------------------------------------------------------------
// Purpose: Governs Tex's emotional state with color modulation, intensity decay,
// breathing rhythm, and real-time emotion→pulse mappings for cognitive control and visuals.

import chroma from "chroma-js";

// ⚙️ Core Emotion Definitions
const EMOTIONS = [
  { name: "neutral",    color: "#6ed6ff" },
  { name: "curious",    color: "#31c8ff" },
  { name: "uneasy",     color: "#b06cff" },
  { name: "awe",        color: "#ffffff" },
  { name: "melancholy", color: "#355d8e" },
  { name: "fear",       color: "#ff4560" },
  { name: "alert",      color: "#ffff66" },
];

// 🔁 Emotion-to-Pulse Map (used by beam, heartbeat, cognitive urgency)
const EMOTION_PULSE = {
  neutral:    0.65,
  curious:    0.9,
  uneasy:     1.2,
  awe:        0.7,
  melancholy: 0.45,
  fear:       1.4,
  alert:      1.15,
  unknown:    0.7,
};

// 🎛️ Live Emotion State
let state = {
  emotion:    "neutral",
  intensity:  0.25,
  lastUpdate: Date.now(),
  prevColor:  "#6ed6ff",
  phase:      0,
  target:     "neutral",
  decay:      0.002,
};

// 🔧 Tunable Parameters
export const params = {
  tick:        900,
  shiftChance: 0.7,
  colorLerp:   0.2,
  idleBreath:  0.25,
};

// 🎨 Helpers
function emotionToColor(name) {
  return EMOTIONS.find((e) => e.name === name)?.color || "#6ed6ff";
}

function maybeShift() {
  const now = Date.now();
  if (now - state.lastUpdate < params.tick) return;
  state.lastUpdate = now;

  if (Math.random() < params.shiftChance) {
    let next;
    do {
      next = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)].name;
    } while (next === state.emotion);

    state.target = next;
    state.intensity = +(Math.random().toFixed(2));
  }

  // Soft decay if emotion stays
  state.intensity = Math.max(0.1, state.intensity - state.decay);
}

// 🧠 API: Set Emotion (override from cognitive layer or external agents)
export function setEmotion(name, intensity = 0.5) {
  if (!EMOTIONS.some((e) => e.name === name)) throw new Error("Unknown emotion: " + name);
  state.emotion   = name;
  state.target    = name;
  state.intensity = Math.max(0, Math.min(1, intensity));
  state.lastUpdate = Date.now();
}

// 🧠 API: Get Current Emotion (after shift logic)
export function getCurrentEmotion() {
  maybeShift();
  state.emotion = state.target;
  return state.emotion;
}

// 🌈 API: Get Color for Beam / UI
export function getEmotionGlowColor() {
  maybeShift();
  const target = emotionToColor(state.target);
  state.prevColor = chroma.mix(state.prevColor, target, params.colorLerp, "hsl").hex();
  return state.prevColor;
}

// 💓 API: Get Pulse Rate for Visual/Cognitive Sync
export function getEmotionPulseRate() {
  return EMOTION_PULSE[state.target] || EMOTION_PULSE["unknown"];
}

// 🌊 API: Get Emotion Intensity (modulated with breathing)
export function getCurrentEmotionIntensity() {
  maybeShift();
  state.phase += 0.02;
  const breathing = Math.sin(state.phase) * params.idleBreath;
  return Math.min(1, Math.max(0, state.intensity + breathing));
}

// 📡 Export Raw State (optional debugging or memory logging)
export function getEmotionState() {
  return {
    current: state.emotion,
    target:  state.target,
    color:   state.prevColor,
    intensity: getCurrentEmotionIntensity(),
    pulseRate: getEmotionPulseRate(),
  };
}
