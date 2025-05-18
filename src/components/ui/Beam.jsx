'use client';

import { motion } from 'framer-motion';

/**
 * Beam.jsx  – animated vertical beam for the hero scene
 *
 * Drop this component where the static line currently sits.
 * It renders:
 *   • a faint static beam (bg-white/40)
 *   • a travelling highlight that slides top → bottom endlessly
 */
export default function Beam({ className = '' }) {
  return (
    <div className={`relative h-full flex justify-center ${className}`}>
      {/* static beam */}
      <div className="w-px bg-white/40 h-full" />

      {/* travelling highlight */}
      <motion.span
        className="absolute left-1/2 w-px h-16 bg-white"
        style={{ translateX: '-50%' }}
        animate={{ y: ['-100%', '100%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}
