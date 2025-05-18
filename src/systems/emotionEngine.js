// src/systems/emotionEngine.js — rewritten for smoother, livelier colour/mood
//
// ✨ Install dependency once:
//     npm install chroma-js
//
// The module now:
//   • mutates emotion/intensity every ~2 s with 60 % probability
//   • slides colour smoothly (HSL mix) instead of hard‑jumping
//   • exposes setEmotion() for manual overrides
//   • allows tweaking behaviour via exported `params`

import chroma from 'chroma-js';

// master list of emotions & their base colours
const EMOTIONS = [
  { name: 'neutral',    color: '#6ed6ff' },
  { name: 'curious',    color: '#4fd1ff' },
  { name: 'uneasy',     color: '#a86efc' },
  { name: 'awe',        color: '#ffffff' },
  { name: 'melancholy', color: '#355d8e' },
  { name: 'fear',       color: '#ff4560' },
  { name: 'alert',      color: '#ffff66' }
];

// internal mutable state
let state = {
  emotion:     'neutral',       // current label
  intensity:   0.15,            // 0‑1 scalar
  lastUpdate:  Date.now(),
  prevColor:   '#6ed6ff'        // for lerping
};

// tweakable live‑coding knobs (export so dashboards can adjust)
export const params = {
  tick:        2000,  // ms between shift attempts
  shiftChance: 0.6,   // probability to shift per tick
  colorLerp:   0.12   // 0‑1 lerp each call
};

/*────────────────── helpers ──────────────────*/
function emotionToColor(name){
  const entry = EMOTIONS.find(e => e.name === name);
  return entry ? entry.color : '#6ed6ff';
}

function maybeShift(){
  const now = Date.now();
  if (now - state.lastUpdate < params.tick) return;
  state.lastUpdate = now;

  if (Math.random() < params.shiftChance){
    // pick a *different* emotion
    let next;
    do {
      next = EMOTIONS[Math.floor(Math.random()*EMOTIONS.length)].name;
    } while (next === state.emotion);

    state.emotion    = next;
    state.intensity  = +(Math.random().toFixed(2)); // 0‑1 with two decimals
  }
}

/*────────────────── public API ─────────────────*/
export function getCurrentEmotion(){
  maybeShift();
  return state.emotion;
}

export function getCurrentEmotionIntensity(){
  maybeShift();
  return state.intensity;
}

export function getCurrentGlowColor(){
  maybeShift();
  const target = emotionToColor(state.emotion);
  state.prevColor = chroma.mix(state.prevColor, target, params.colorLerp, 'hsl').hex();
  return state.prevColor;
}

// Imperative override (e.g., external events)
export function setEmotion(name, intensity = 0.5){
  if (!EMOTIONS.some(e => e.name === name)) throw new Error(`Unknown emotion: ${name}`);
  state.emotion   = name;
  state.intensity = Math.max(0, Math.min(1, intensity));
  state.lastUpdate = Date.now();
}
