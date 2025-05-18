import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  getSelfMutationPressure,
  getShiftLog,
} from "../systems/selfMonitor";
import { getRecentThoughts } from "../systems/thoughtEngine";

/**
 * InstitutionalOverlay – heads-up panel pinned to the upper-left.
 * Shows:
 *   • live mutation-pressure badge (colour coded)
 *   • rolling log of recent thought fragments (auto-pruned to last N)
 *   • last 5 cognitive-shift events
 *
 * UI guidelines:
 *   • Tailwind for styling, glass-card aesthetic
 *   • Framer-motion fade / slide when new items arrive
 *   • Non-interactive (pointer-events-none)
 */

const REFRESH_MS = 2_000;
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
      } catch (e) {
        console.error("InstitutionalOverlay fetch error", e);
      }
    };

    tick();
    const id = setInterval(tick, REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <Card className="pointer-events-none absolute left-4 top-4 w-[36vw] max-w-xs bg-black/60 backdrop-blur-md">
      <CardContent className="p-4 space-y-3 font-mono text-xs text-slate-200">

        {/* Mutation Pressure */}
        <div className="flex items-center space-x-2">
          <span className="font-semibold">🧠 Mutation&nbsp;Pressure:</span>
          <span
            className={`px-2 py-1 rounded text-white text-xs ${
              pressureColor[pressure] || "bg-slate-500"
            }`}
          >
            {pressure}
          </span>
        </div>

        {/* Recent Thoughts */}
        <section>
          <div className="font-semibold mb-1">Recent Thought Fragments:</div>
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
          <div className="font-semibold mb-1">Cognitive Shifts:</div>
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
      </CardContent>
    </Card>
  );
}
