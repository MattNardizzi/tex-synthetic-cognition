// src/components/TypingPanel.jsx

import React, { useEffect, useState } from 'react';
import { generateThought, getRecentThoughts } from '../systems/thoughtEngine';
import { getCurrentEmotion, getCurrentEmotionIntensity } from '../systems/emotionEngine';
import { getPersonaTraits } from '../systems/personaCore';

export default function TypingPanel() {
  const [displayedThoughts, setDisplayedThoughts] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const mood = getCurrentEmotion();
      const intensity = getCurrentEmotionIntensity();

      if (intensity > 0.5) {
        const newThought = generateThought();
        setDisplayedThoughts(prev => {
          const updated = [...prev, { source: 'Tex', text: newThought.text, meta: newThought.meta }];
          return updated.length > 8 ? updated.slice(-8) : updated;
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const persona = getPersonaTraits();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setDisplayedThoughts(prev => [...prev, { source: 'You', text: userText }]);
    setInput('');

    try {
      const res = await fetch('https://your-backend-url.com/api/think', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: userText })
      });
      const data = await res.json();

      setDisplayedThoughts(prev => [...prev, { source: 'Tex', text: data.response }]);
    } catch (err) {
      setDisplayedThoughts(prev => [...prev, { source: 'Tex', text: '⚠️ Connection error. Unable to think right now.' }]);
    }
  };

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
      maxHeight: '35vh',
      overflowY: 'auto',
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '8px' }}>
        {persona.name} [{persona.tone} · {getCurrentEmotion()} · {getRecentThoughts().slice(-1)[0]?.state}]
      </div>
      
      {displayedThoughts.map((t, i) => (
        <div key={i} style={{ marginBottom: '6px', opacity: 0.95 }}>
          <strong>{t.source}:</strong> {t.text} 
          {t.meta && <span style={{ opacity: 0.5 }}> ({t.meta})</span>}
        </div>
      ))}

      <form onSubmit={handleSubmit} style={{ display: 'flex', marginTop: '12px' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your prompt for Tex..."
          style={{
            flexGrow: 1,
            backgroundColor: '#111',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '4px',
            padding: '8px',
            fontFamily: 'monospace'
          }}
        />
        <button
          type="submit"
          style={{
            marginLeft: '8px',
            padding: '8px 12px',
            backgroundColor: '#00c6ff',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
