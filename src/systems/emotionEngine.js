// src/systems/emotionEngine.js — turbo‑lively version
// -------------------------------------------------------------
// npm install chroma-js  (if you haven't already)
//
// Changes vs. previous draft
//   • checks every 0.8 s (params.tick)
//   • 85 % chance to jump emotion each tick (params.shiftChance)
//   • colour slides 25 % per frame (params.colorLerp)  ⇒ visible hue flow
//   • intensity itself now *breathes* with a slow sine‑wave so the
//     beam never sits perfectly still, even between emotion shifts.
//   • exported params remain live‑tweakable

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
  intensity:  0.2,      // 0‑1
  lastUpdate: Date.now(),
  prevColor:  "#6ed6ff",
  phase:      0,        // for idle breathing
};

export const params = {
  tick:        800,   // ms between shift attempts (faster)
  shiftChance: 0.85,  // 85 % probability each tick
  colorLerp:   0.25,  // slide 25 % toward target hue per frame
  idleBreath:  0.35,  // amplitude of sine‑wave idle modulation
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

    state.emotion   = next;
    state.intensity = +(Math.random().toFixed(2));
  }
}

/*────────────────── public API ─────────────────*/
export function getCurrentEmotion() {
  maybeShift();
  return state.emotion;
}

export function getCurrentEmotionIntensity() {
  maybeShift();
  // idle breathing modulation (slow 5‑s cycle)
  state.phase += 0.02;
  const breathing = Math.sin(state.phase) * params.idleBreath; // ±amp
  return Math.min(1, Math.max(0, state.intensity + breathing));
}

export function getCurrentGlowColor() {
  maybeShift();
  const target = emotionToColor(state.emotion);
  state.prevColor = chroma.mix(state.prevColor, target, params.colorLerp, "hsl").hex();
  return state.prevColor;
}

export function setEmotion(name, intensity = 0.5) {
  if (!EMOTIONS.some((e) => e.name === name)) throw new Error("Unknown emotion: " + name);
  state.emotion   = name;
  state.intensity = Math.max(0, Math.min(1, intensity));
  state.lastUpdate = Date.now();
}
