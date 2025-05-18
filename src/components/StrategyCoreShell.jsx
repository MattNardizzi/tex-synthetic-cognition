// src/components/StrategyCoreShell.jsx
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass }     from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import SimplexNoise from "simplex-noise";

import { getNeedPulse }        from "../systems/needPulse";
import { getCurrentGlowColor } from "../systems/emotionEngine";

import TypingPanel          from "./TypingPanel";
import InstitutionalOverlay from "./InstitutionalOverlay";
import GazeEyes             from "./GazeEyes";      // 👀 pupils overlay

export default function StrategyCoreShell() {
  const mountRef = useRef(null);

  useEffect(() => {
    /* ─── scene / camera ─────────────────────────────────────────── */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    /* ─── renderer ──────────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    /* ─── bloom composer (ghost-glow) ───────────────────────────── */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.6,  // strength
        0.4,  // radius
        0.85  // threshold
      )
    );

    /* ─── vertical beam geometry ───────────────────────────────── */
    const geometry = new THREE.CylinderGeometry(0.02, 0.02, 3, 32);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time:      { value: 0 },
        pulse:     { value: 1.0 },
        glowColor: { value: new THREE.Color("#6ed6ff") },
      },
      vertexShader: `
        uniform float time;
        uniform float pulse;
        varying vec3 vPosition;
        void main() {
          vPosition = position;
          vec3 pos = position;

          /* subtle sway + width scale injected from JS (noise) */
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3  glowColor;
        uniform float pulse;
        varying vec3  vPosition;
        void main() {
          float intensity = (1.0 - abs(vPosition.y) / 1.5) * pulse;
          gl_FragColor   = vec4(glowColor * intensity, 1.0);
        }
      `,
      transparent: true,
    });
    const beam = new THREE.Mesh(geometry, material);
    scene.add(beam);

    /* ─── faint fog plane ─────────────────────────────────────── */
    const fog = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshBasicMaterial({ color: 0x0b0e1a, transparent: true, opacity: 0.05 })
    );
    fog.position.z = -2;
    scene.add(fog);

    /* ─── animation loop ──────────────────────────────────────── */
    const simplex   = new SimplexNoise();
    let   t         = 0;
    let   smooth    = getNeedPulse();     // EMA seed
    const ALPHA     = 0.08;               // smoothing factor

    const BREATH_PERIOD = 5.0;            // seconds
    const HEART_BPM     = 120;
    const HEART_FREQ    = HEART_BPM / 60; // 2 beats/sec

    const animate = () => {
      t += 0.005;

      /* composite need: breath + heartbeat ---------------------- */
      const breath = (Math.sin((t / BREATH_PERIOD) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
      const heart  = Math.max(0, Math.sin(t * HEART_FREQ * Math.PI * 2));
      const target = Math.min(1, breath * 0.8 + heart * 0.4);

      smooth = smooth + ALPHA * (target - smooth);     // EMA

      /* feed uniforms ------------------------------------------- */
      material.uniforms.time.value  = t;
      material.uniforms.pulse.value = smooth;
      material.uniforms.glowColor.value.set(getCurrentGlowColor());

      /* inject sway & width scale via vertex displacement --------
         (done in JS because ShaderMaterial needs dynamic geometry) */
      const sway = Math.sin(t * 1.2) * 0.005;           // left-right sway
      const noise = simplex.noise2D(t * 0.2, 0) * 0.004; // organic jitter
      beam.scale.set(0.9 + smooth * 0.2, 1, 1);         // widen with pulse
      beam.position.x = sway + noise;

      /* render */
      composer.render();
      requestAnimationFrame(animate);
    };
    animate();

    /* ─── responsive canvas ───────────────────────────────────── */
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    /* ─── cleanup ─────────────────────────────────────────────── */
    return () => {
      window.removeEventListener("resize", onResize);
      mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  /* ─── JSX shell (eyes + UI overlays) ────────────────────────── */
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
      {/* eyes */}
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

      {/* operator layers */}
      <TypingPanel />
      <InstitutionalOverlay />
    </div>
  );
}
