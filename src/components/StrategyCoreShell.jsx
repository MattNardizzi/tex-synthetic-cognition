// src/components/StrategyCoreShell.jsx  –  cinematic spine w/ gaze-responsive bloom
// -----------------------------------------------------------------------------
// Requirements (already in repo after previous steps):
//   npm install three simplex-noise chroma-js
// -----------------------------------------------------------------------------
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import SimplexNoise from "simplex-noise";

import { getNeedPulse } from "../systems/needPulse";
import { getCurrentGlowColor, getCurrentEmotionIntensity } from "../systems/emotionEngine";

import TypingPanel from "./TypingPanel";
import InstitutionalOverlay from "./InstitutionalOverlay";
import GazeEyes from "./GazeEyes";

const BREATH_PERIOD = 3.5;                 // s (faster, cinematic)
const HEART_BPM     = 110;                 // beats / min
const HEART_FREQ    = HEART_BPM / 60;      // Hz
const SMOOTH_ALPHA  = 0.08;                // EMA factor

export default function StrategyCoreShell() {
  const mountRef = useRef(null);

  useEffect(() => {
    // ─────────────────── scene bootstrap ──────────────────────
    const scene   = new THREE.Scene();
    const camera  = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Post-processing bloom
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.8, 0.45, 0.85);
    composer.addPass(bloomPass);

    // Beam geometry & shader
    const beamMat = new THREE.ShaderMaterial({
      uniforms: {
        time:      { value: 0 },
        pulse:     { value: 1 },
        glowColor: { value: new THREE.Color("#6ed6ff") },
        gaze:      { value: 1 },
      },
      transparent: true,
      vertexShader: /* glsl */ `
        uniform float time;
        uniform float pulse;
        uniform float gaze;
        varying vec3  vPos;
        void main() {
          vPos = position;
          vec3 p = position;
          // tiny tremor reacts to gaze (stronger when stared at)
          p.x += sin(time * 3. + position.y * 7.) * 0.01 * pulse * gaze;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3  glowColor;
        uniform float pulse;
        uniform float gaze;
        varying vec3  vPos;
        void main() {
          float intensity = (1.0 - abs(vPos.y) / 1.5) * pulse;
          intensity *= mix(0.4, 1.25, gaze); // dim when averted
          gl_FragColor = vec4(glowColor * intensity, 1.0);
        }
      `,
    });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 3, 48), beamMat);
    scene.add(beam);

    // Background haze panel (dim with gaze)
    const fogMat = new THREE.MeshBasicMaterial({ color: 0x0b0e1a, transparent: true, opacity: 0.06 });
    const fog    = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), fogMat);
    fog.position.z = -2;
    scene.add(fog);

    // ─────────────────── dynamic state ────────────────────────
    const simplex  = new SimplexNoise();
    let   t        = 0;
    let   smooth   = getNeedPulse();
    let   gazeFact = 1;            // 0-1 (pointer distance)

    /* pointer-based gaze fallback */
    const updateGaze = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      const dist = Math.min(1, Math.sqrt(dx*dx + dy*dy) * 1.7); // 0 centre → 1 edge
      gazeFact = 1 - dist; // 1 when pointer near centre
    };
    window.addEventListener("pointermove", updateGaze);

    /* main loop */
    const animate = () => {
      t += 0.007; // faster timeline

      // rhythmic composite
      const breath = (Math.sin((t / BREATH_PERIOD) * Math.PI * 2) + 1) / 2;
      const heart  = Math.max(0, Math.sin(t * HEART_FREQ * Math.PI * 2));
      const target = Math.min(1, breath * 0.8 + heart * 0.5);
      smooth += SMOOTH_ALPHA * (target - smooth);

      // uniforms
      beamMat.uniforms.time.value      = t;
      beamMat.uniforms.pulse.value     = smooth;
      beamMat.uniforms.gaze.value      = gazeFact;
      beamMat.uniforms.glowColor.value.set(getCurrentGlowColor());

      // position & width
      const noise  = simplex.noise2D(t * 0.3, 0) * 0.006;
      beam.scale.set(0.9 + smooth * 0.4, 1, 1);
      beam.position.x = Math.sin(t * 1.4) * 0.015 + noise;

      // bloom strength reacts to gaze + emotion intensity
      const emotionAmp = getCurrentEmotionIntensity(); // 0-1
      bloomPass.strength = THREE.MathUtils.lerp(0.35, 1.3, Math.max(gazeFact, emotionAmp));

      fogMat.opacity = 0.04 + (1 - gazeFact) * 0.06; // darker when not watched

      composer.render();
      requestAnimationFrame(animate);
    };
    animate();

    // ─────────────────── cleanup ───────────────────────────────
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("pointermove", updateGaze);
      window.removeEventListener("resize", onResize);
      mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // ─────────────────── JSX shell ───────────────────────────────
  return (
    <div
      ref={mountRef}
      className="relative w-screen h-screen bg-black overflow-hidden"
    >
      {/* pupils overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <GazeEyes />
      </div>

      {/* operator HUD & typing */}
      <TypingPanel />
      <InstitutionalOverlay />
    </div>
  );
}
