// src/components/SpinePulse.jsx
import { useEffect, useState } from "react";

/**
 * Props:
 *   amplitude  Number 0-1  (e.g. needPulse.getAmp())
 */
export default function SpinePulse({ amplitude = 0 }) {
  return (
    <div
      className="w-px mx-auto"
      style={{
        height: "100%",
        background:
          "linear-gradient(180deg, transparent 0%, #00d9ff 50%, transparent 100%)",
        transform: `scaleY(${1 + amplitude * 0.5})`,
        boxShadow: `0 0 ${20 + amplitude * 60}px rgba(0,217,255,${
          0.3 + amplitude * 0.5
        })`,
        transition: "transform 80ms linear, box-shadow 80ms linear",
      }}
    />
  );
}
