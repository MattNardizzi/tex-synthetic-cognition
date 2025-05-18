// src/components/GazeEyes.jsx
import { useEffect, useRef } from "react";

export default function GazeEyes() {
  const eyes = useRef([]);

  useEffect(() => {
    const onMove = (e) => {
      eyes.current.forEach((eye) => {
        const rect = eye.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const angle = Math.atan2(dy, dx);
        const r = 4; // pupil travel radius
        eye.style.transform = `translate(${r * Math.cos(angle)}px,${
          r * Math.sin(angle)
        }px)`;
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div className="flex justify-center gap-5 mb-2">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center"
        >
          <div
            ref={(el) => (eyes.current[i] = el)}
            className="w-2 h-2 rounded-full bg-cyan-200 transition-transform duration-150"
          />
        </div>
      ))}
    </div>
  );
}
