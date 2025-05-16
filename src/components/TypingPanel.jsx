// src/components/TypingPanel.jsx

import React, { useEffect, useState } from 'react';
import { generateThought, getRecentThoughts } from '../systems/thoughtEngine';
import { getCurrentEmotion, getCurrentEmotionIntensity } from '../systems/emotionEngine';
import { getPersonaTraits } from '../systems/personaCore';

export default function TypingPanel() {
  const [displayedThoughts, setDisplayedThoughts] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const mood = getCurrentEmotion();
      const intensity = getCurrentEmotionIntensity();

      // Only display if emotion is intense enough
      if (intensity > 0.5) {
        const newThought = generateThought();
        setDisplayedThoughts(prev => {
          const updated = [...prev, newThought];
          return updated.length > 5 ? updated.slice(-5) : updated;
        });
      }
    }, 4000); // every 4 seconds, maybe express

    return () => clearInterval(interval);
  }, []);

  const persona = getPersonaTraits();

  return (
    <div style={{
      position: 'absolute',
      bottom: '5vh',
      left: '5vw',
      width: '90vw',
      fontFamily: 'monospace',
      fontSize: '1rem',
      color: '#cfdcff',
      background: 'rgba(10,10,10,0.6)',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 0 14px rgba(110, 214, 255, 0.2)',
      maxHeight: '30vh',
      overflowY: 'auto',
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '8px' }}>
        {persona.name} [{persona.tone} · {getCurrentEmotion()} · {getRecentThoughts().slice(-1)[0]?.state}]
      </div>
      {displayedThoughts.map((t, i) => (
        <div key={i} style={{ marginBottom: '4px', opacity: 0.95 }}>
          {t.text} <span style={{ opacity: 0.5 }}>({t.meta})</span>
        </div>
      ))}
    </div>
  );
}
