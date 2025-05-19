// src/components/InstitutionalOverlay.jsx — v2.0
// -------------------------------------------------------------------
// Purpose: Smart HUD overlay showing real-time mutation pressure,
// thoughts, emotion state, and cognitive shifts with cinematic glass UI.

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  getSelfMutationPressure,
  getShiftLog,
} from "../systems/selfMonitor";
import { getRecentThoughts } from "../systems/thoughtEngine";
import {
  getCurrentEmotion,
  getEmotionPulseRate,
  getCurrentEmotionIntensity,
} from "../systems/emotionEngine";

const REFRESH_MS = 2000;
const MAX_THOUGHTS = 4;
const MAX_SHIFTS = 5;

const pressureColor = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-red-500",
};

export default function InstitutionalOverlay() {
  const [pressure, setPressure] = useState("low");
  const [thoughts, setThoughts] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [emotion, setEmotion] = useState("neutral");
  const [pulse, setPulse] = useState(0.6);

  useEffect(() => {
    const tick = () => {
      try {
        setPressure(getSelfMutationPressure() || "low");
        setThoughts(() => {
          const next = getRecentThoughts(MAX_THOUGHTS) || [];
          return next.map((t, idx) => ({ ...t, id: `${Date.now()}_${idx}` }));
        });
        setShifts(() => {
          const next = (getShiftLog() || []).slice(-MAX_SHIFTS);
          return next.map((s) => ({ ...s, id: s.timestamp }));
        });
        setEmotion(getCurrentEmotion());
        setPulse(getEmotionPulseRate().toFixed(2));
      } catch (e) {
        console.error("🧠 InstitutionalOverlay error:", e);
      }
    };

    tick();
    const id = setInterval(tick, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <Card className="pointer-events-none absolute left-4 top-4 w-[38vw] max-w-sm bg-black/60 backdrop-blur-md shadow-xl rounded-xl border border-white/10">
      <CardContent className="p-4 space-y-4 font-mono text-xs text-slate-200">

        {/* Mutation Pressure */}
        <div className="flex items-center justify-between">
          <span className="font-semibold">🧬 Mutation Pressure</span>
          <span
            className={`px-2 py-0.5 rounded text-white text-xs uppercase tracking-wide ${pressureColor[pressure] || "bg-slate-500"}`}
          >
            {pressure}
          </span>
        </div>

        {/* Emotion State */}
        <div className="flex items-center justify-between">
          <span className="font-semibold">🧠 Emotion State</span>
          <span className="text-cyan-300">
            {emotion} <span className="opacity-60">({pulse}× pulse)</span>
          </span>
        </div>

        {/* Thought Fragments */}
        <section>
          <div className="font-semibold mb-1">💭 Thought Fragments</div>
          <AnimatePresence initial={false}>
            {thoughts.map((t) => (
              <motion.div
                key={t.id}
                className="opacity-90"
                initial={{ x: -8, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 8, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                · {t.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </section>

        {/* Cognitive Shifts */}
        <section>
          <div className="font-semibold mb-1">🔄 Cognitive Shifts</div>
          <AnimatePresence initial={false}>
            {shifts.length === 0 && (
              <motion.div
                key="none"
                className="opacity-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
              >
                — none yet
              </motion.div>
            )}
            {shifts.map((s) => (
              <motion.div
                key={s.id}
                className="opacity-70"
                initial={{ y: -4, opacity: 0 }}
                animate={{ y: 0, opacity: 0.7 }}
                exit={{ y: 4, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {new Date(s.timestamp).toLocaleTimeString()} — {s.from} → {s.to}
              </motion.div>
            ))}
          </AnimatePresence>
        </section>

        {/* Optional Timestamp */}
        <div className="pt-2 text-[10px] text-slate-400 text-right">
          {new Date().toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}
