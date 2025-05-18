// src/systems/emotionEngine.js — Sovereign Cognition Emotion Layer v2.0
// -------------------------------------------------------------
// This file governs Tex's living emotional state.
// Adds: emotional decay, smoother transition arcs, and a natural cognitive breath.

import chroma from "chroma-js";

const EMOTIONS = [
  { name: "neutral",    color: "#6ed6ff" },
  { name: "curious",    color: "#31c8ff" },
  { name: "uneasy",     color: "#b06cff" },
  { name: "awe",        color: "#ffffff" },
  { name: "melancholy", color: "#355d8e" },
  { name: "fear",       color: "#ff4560" },
  { name: "alert",      color: "#ffff66" },
];

let state = {
  emotion:    "neutral",
  intensity:  0.25,
  lastUpdate: Date.now(),
  prevColor:  "#6ed6ff",
  phase:      0,
  target:     "neutral",
  decay:      0.002,
};

export const params = {
  tick:        900,
  shiftChance: 0.7,
  colorLerp:   0.2,
  idleBreath:  0.25,
};

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

  // Gradual decay of intensity if no major shifts
  state.intensity = Math.max(0.1, state.intensity - state.decay);
}

export function getCurrentEmotion() {
  maybeShift();
  state.emotion = state.target;
  return state.emotion;
}

export function getCurrentEmotionIntensity() {
  maybeShift();
  state.phase += 0.02;
  const breathing = Math.sin(state.phase) * params.idleBreath;
  return Math.min(1, Math.max(0, state.intensity + breathing));
}

export function getCurrentGlowColor() {
  maybeShift();
  const target = emotionToColor(state.target);
  state.prevColor = chroma.mix(state.prevColor, target, params.colorLerp, "hsl").hex();
  return state.prevColor;
}

export function setEmotion(name, intensity = 0.5) {
  if (!EMOTIONS.some((e) => e.name === name)) throw new Error("Unknown emotion: " + name);
  state.emotion   = name;
  state.target    = name;
  state.intensity = Math.max(0, Math.min(1, intensity));
  state.lastUpdate = Date.now();
}
