// src/components/StrategyCoreShell.jsx
import React, { useRef, useEffect } from "react";
import * as THREE from "three";

import { getNeedPulse } from "../systems/needPulse";
import { getCurrentGlowColor } from "../systems/emotionEngine";

import TypingPanel from "./TypingPanel";
import InstitutionalOverlay from "./InstitutionalOverlay";
import GazeEyes from "./GazeEyes";            // 👀 pupils overlay

export default function StrategyCoreShell() {
  const mountRef = useRef(null);

  /* ────────────────────────────────────────────────────────────────
   *  Three-JS scene
   * ──────────────────────────────────────────────────────────────── */
  useEffect(() => {
    /* scene & camera */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    /* renderer */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    /* vertical pulse beam */
    const geometry = new THREE.CylinderGeometry(0.02, 0.02, 3, 32);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time:      { value: 0 },
        glowColor: { value: new THREE.Color("#6ed6ff") },
        pulse:     { value: 1.0 },
      },
      vertexShader: `
        uniform float time;
        uniform float pulse;
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          vec3 pos = position;

          /* subtle breathing sway + width scale */
          pos.x  += sin(time * 1.2) * 0.005;   // ≤0.5 cm left-right
          pos.xy *= 0.9 + pulse * 0.2;         // widen with need

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float pulse;
        varying vec3 vPosition;
        void main() {
          float intensity = (1.0 - abs(vPosition.y) / 1.5) * pulse;
          gl_FragColor   = vec4(glowColor * intensity, 1.0);
        }
      `,
      transparent: true,
    });
    const beam = new THREE.Mesh(geometry, material);
    scene.add(beam);

    /* faint fog background */
    const fog = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshBasicMaterial({
        color: 0x0b0e1a,
        transparent: true,
        opacity: 0.05,
      })
    );
    fog.position.z = -2;
    scene.add(fog);

    /* animate */
    let t = 0;
    let smoothNeed = getNeedPulse();   // EMA seed
    const ALPHA = 0.08;               // smoothing factor (lower = smoother)

    const animate = () => {
      t += 0.005;                     // slower time step
      material.uniforms.time.value = t;

      /* Exponential moving average for smooth pulse */
      const rawNeed   = getNeedPulse();
      smoothNeed      = smoothNeed + ALPHA * (rawNeed - smoothNeed);
      material.uniforms.pulse.value = Math.min(1.0, smoothNeed);

      /* color shift by emotion */
      material.uniforms.glowColor.value.set(getCurrentGlowColor());

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    /* responsive canvas */
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    /* cleanup */
    return () => {
      window.removeEventListener("resize", onResize);
      mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  /* ────────────────────────────────────────────────────────────────
   *  JSX shell
   * ──────────────────────────────────────────────────────────────── */
  return (
    <div
      ref={mountRef}
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* 👀 gaze overlay */}
      <div
        style={{
          position: "absolute",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "none",
        }}
      >
        <GazeEyes />
      </div>

      {/* operator UI layers */}
      <TypingPanel />
      <InstitutionalOverlay />
    </div>
  );
}
