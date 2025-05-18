// src/systems/needPulse.js — Sovereign Pulse Engine v2.0
// -------------------------------------------------------------
// Simulates cognitive pulse intensity based on emotion, thought, and synthetic respiration.
// Replaces random mutation with emotional feedback and smooth modulation.

import { getCurrentEmotionIntensity } from "./emotionEngine";

let pulseState = {
  base: 0.75,
  target: 0.75,
  value: 0.75,
  lastUpdate: Date.now(),
  inertia: 0.04,
};

const CYCLE_MS = 3500; // time between shifts in ms
const JITTER    = 0.05; // how far the base pulse can shift
const EMA_ALPHA = 0.08; // smoothing factor

export function getNeedPulse() {
  const now = Date.now();
  const delta = now - pulseState.lastUpdate;

  if (delta > CYCLE_MS) {
    pulseState.lastUpdate = now;
    const emotionalFactor = getCurrentEmotionIntensity();
    pulseState.target = pulseState.base + (Math.random() - 0.5) * JITTER + emotionalFactor * 0.2;
    pulseState.target = Math.min(1.0, Math.max(0.1, pulseState.target));
  }

  // Smoothly approach the new target
  pulseState.value += EMA_ALPHA * (pulseState.target - pulseState.value);

  return parseFloat(pulseState.value.toFixed(4));
}

/* ---------- Live React Hook for Components ---------- */
import { useEffect, useState } from "react";

export function useNeedPulse(fps = 30) {
  const [amp, setAmp] = useState(getNeedPulse());
  useEffect(() => {
    const id = setInterval(() => setAmp(getNeedPulse()), 1000 / fps);
    return () => clearInterval(id);
  }, [fps]);
  return amp; // float 0–1 for visual/audio motion
}
