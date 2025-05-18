// src/systems/needPulse.js
let lastNeed = 0.8;
let lastTimestamp = Date.now();

const volatility  = 0.15;   // mutation range
const cycleSpeed  = 3000;   // ms between mutations

export function getNeedPulse() {
  const now = Date.now();
  const delta = now - lastTimestamp;

  if (delta > cycleSpeed) {
    lastTimestamp = now;
    const mutation = (Math.random() - 0.5) * volatility;
    lastNeed = Math.max(0, Math.min(1.0, lastNeed + mutation)); // clamp 0-1
  }
  return parseFloat(lastNeed.toFixed(4));
}

/* ---------- NEW: React hook ---------- */
import { useEffect, useState } from "react";

export function useNeedPulse(fps = 30) {
  const [amp, setAmp] = useState(getNeedPulse());   // initial value
  useEffect(() => {
    const id = setInterval(() => setAmp(getNeedPulse()), 1000 / fps);
    return () => clearInterval(id);
  }, [fps]);
  return amp;          // 0-1 float ready for <SpinePulse amplitude={amp} />
}
