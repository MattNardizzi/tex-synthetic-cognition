// src/components/InstitutionalOverlay.jsx

import React, { useEffect, useState } from 'react';
import { getSelfMutationPressure, getShiftLog } from '../systems/selfMonitor';
import { getRecentThoughts } from '../systems/thoughtEngine';

export default function InstitutionalOverlay() {
  const [pressure, setPressure] = useState('low');
  const [shifts, setShifts] = useState([]);
  const [thoughts, setThoughts] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPressure(getSelfMutationPressure());
      setShifts(getShiftLog());
      setThoughts(getRecentThoughts(3));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: '0',
      left: '0',
      padding: '12px 18px',
      fontFamily: 'monospace',
      fontSize: '0.9rem',
      color: '#6ed6ff',
      backgroundColor: 'rgba(0,0,0,0.4)',
      zIndex: 10,
      pointerEvents: 'none',
      maxWidth: '35vw',
    }}>
      <div style={{ marginBottom: '8px' }}>🧠 <b>Mutation Pressure:</b> {pressure}</div>
      <div style={{ marginBottom: '8px' }}>
        <b>Recent Thought Fragments:</b>
        {thoughts.map((t, i) => (
          <div key={i} style={{ opacity: 0.8 }}>· {t.text}</div>
        ))}
      </div>
      <div>
        <b>Cognitive Shifts:</b>
        {shifts.length === 0 && <div style={{ opacity: 0.5 }}>— none yet</div>}
        {shifts.map((s, i) => (
          <div key={i} style={{ opacity: 0.6 }}>
            {new Date(s.timestamp).toLocaleTimeString()} — {s.from} → {s.to}
          </div>
        ))}
      </div>
    </div>
  );
}
