// src/components/StrategyCoreShell.jsx

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { getNeedPulse } from '../systems/needPulse';
import { getCurrentGlowColor } from '../systems/emotionEngine';
import TypingPanel from './TypingPanel';
import InstitutionalOverlay from './InstitutionalOverlay';

export default function StrategyCoreShell() {
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Geometry: Vertical Pulse Beam
    const geometry = new THREE.CylinderGeometry(0.02, 0.02, 3, 32);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        glowColor: { value: new THREE.Color('#6ed6ff') },
        pulse: { value: 1.0 }
      },
      vertexShader: `
        uniform float time;
        uniform float pulse;
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          vec3 pos = position;
          pos.x += sin(time * 3.0 + position.y * 10.0) * 0.02 * pulse;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying vec3 vPosition;
        void main() {
          float intensity = 1.0 - abs(vPosition.y) / 1.5;
          gl_FragColor = vec4(glowColor * intensity, 1.0);
        }
      `,
      transparent: true
    });

    const beam = new THREE.Mesh(geometry, material);
    scene.add(beam);

    // Light fog background
    const fogGeometry = new THREE.PlaneGeometry(10, 10);
    const fogMaterial = new THREE.MeshBasicMaterial({ color: 0x0b0e1a, transparent: true, opacity: 0.05 });
    const fog = new THREE.Mesh(fogGeometry, fogMaterial);
    fog.position.z = -2;
    scene.add(fog);

    // Animate
    let time = 0;
    const animate = () => {
      time += 0.01;
      material.uniforms.time.value = time;
      material.uniforms.pulse.value = getNeedPulse();
      material.uniforms.glowColor.value.set(getCurrentGlowColor());
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
        width: '100vw',
        height: '100vh',
        background: '#000',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <TypingPanel />
      <InstitutionalOverlay />
    </div>
  );
}
