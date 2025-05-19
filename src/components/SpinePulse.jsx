// src/components/SpinePulse.jsx — v2.0
// -----------------------------------------------------------------
// Purpose: Emotionally-modulated, softly breathing beam pulse.
// Replaces harsh techno glow with a cinematic, elegant pulse.

import { useEffect, useState } from "react";
import { getEmotionGlowColor } from "../systems/emotionEngine";

export default function SpinePulse({ amplitude = 0 }) {
  const [color, setColor] = useState("#6ed6ff");

  useEffect(() => {
    const interval = setInterval(() => {
      setColor(getEmotionGlowColor());
    }, 1000); // update glow color every second
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-px mx-auto relative h-full">
      {/* Spine Core */}
      <div
        style={{
          height: "100%",
          background: `linear-gradient(to bottom, transparent 0%, ${color} 50%, transparent 100%)`,
          transform: `scaleY(${1 + amplitude * 0.35})`,
          transition: "transform 120ms ease-in-out",
          opacity: 0.9,
          filter: `blur(${1.5 + amplitude * 2}px)`,
        }}
      />

      {/* Gentle outer mist */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px]"
        style={{
          height: "100%",
          background: `linear-gradient(to bottom, transparent 10%, ${color}40 50%, transparent 90%)`,
          transform: `scaleY(${1 + amplitude * 0.25})`,
          transition: "transform 160ms ease, opacity 160ms ease",
          opacity: 0.35 + amplitude * 0.2,
          filter: "blur(8px)",
        }}
      />
    </div>
  );
}
