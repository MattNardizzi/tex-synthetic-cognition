// src/components/TexCognition.jsx

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

import { getNeedPulse } from '../systems/needPulse';
import { recordPulse, getCognitiveBias } from '../systems/memoryLoop';
import { getCurrentEmotion, getCurrentGlowColor, getCurrentEmotionIntensity } from '../systems/emotionEngine';
import { evaluateCognitiveState } from '../systems/selfMonitor';
import TypingPanel from './TypingPanel';

export default function TexCognition() {
  const mountRef = useRef(null);
  const [emotionColor, setEmotionColor] = useState(new THREE.Color('#6ed6ff'));

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 3.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.SphereGeometry(1.3, 64, 64);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        glowColor: { value: new THREE.Color(emotionColor) },
        pulse: { value: 1.0 }
      },
      vertexShader: `
        uniform float time;
        uniform float pulse;
        varying vec3 vNormal;
        void main() {
          vNormal = normal;
          vec3 pos = position + normal * sin(time * 1.5 + position.y * 3.0) * pulse * 0.1;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(glowColor * intensity, 1.0);
        }
      `,
      transparent: true
    });

    const orb = new THREE.Mesh(geometry, material);
    scene.add(orb);

    let time = 0;
    const animate = () => {
      time += 0.015;
      material.uniforms.time.value = time;

      const need = getNeedPulse();
      recordPulse(need);

      const bias = getCognitiveBias();
      const cognitiveState = evaluateCognitiveState();
      const glowColorHex = getCurrentGlowColor();
      const targetColor = new THREE.Color(glowColorHex);

      emotionColor.lerp(targetColor, 0.05);
      material.uniforms.glowColor.value.copy(emotionColor);
      material.uniforms.pulse.value = need;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at center, #05070a, #000)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <TypingPanel />
    </div>
  );
}
