// src/components/StrategyCoreShell.jsx
// ------------------------------------------------------------
// Version: v6.0 — Cinematic AGI Beam with Emotion-Based Modulation
// Purpose: Embodied visual core for Tex. Breathing beam, smooth fade, emotion glow, flare shimmer, future-ready.

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { createNoise2D } from "simplex-noise";
import * as Tone from "tone";

import { getNeedPulse } from "../systems/needPulse";
import { getCurrentGlowColor } from "../systems/emotionEngine";

import TypingPanel from "./TypingPanel";
import InstitutionalOverlay from "./InstitutionalOverlay";
import FinanceTicker from "./FinanceTicker";
import GazeEyes from "./GazeEyes";

const CFG = {
  breathPeriod: 4.5,
  heartBpm: 92,
  emaAlpha: 0.05,
  beamRadius: 0.017,
  beamHeight: 1.35,
};

export default function StrategyCoreShell() {
  const mount = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0.12, 3.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.current.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.55, 0.25, 0.75));

    // Beam Shader
    const beamMat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pulse: { value: 1 },
        glowColor: { value: new THREE.Color("#6ed6ff") },
      },
      transparent: true,
      vertexShader: `
        uniform float time, pulse;
        varying vec3 vPos;
        void main(){
          vPos = position;
          vec3 p = position;
          p.x += sin(time * 2. + position.y * 4.) * 0.006 * pulse;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float pulse;
        varying vec3 vPos;
        void main(){
          float intensity = (1.0 - abs(vPos.y) / 1.1) * pulse;
          gl_FragColor = vec4(glowColor * intensity * 1.35, 1.0);
        }
      `,
    });

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(CFG.beamRadius, CFG.beamRadius, CFG.beamHeight, 48),
      beamMat
    );
    scene.add(beam);

    // Add glow flare
    new THREE.TextureLoader().load("/flare.png", (tex) => {
      const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.3 }));
      flare.scale.set(0.6, 0.6, 1);
      flare.position.y = CFG.beamHeight / 2;
      beam.add(flare);

      // Animate flare shimmer
      const updateFlare = (t) => {
        flare.material.opacity = 0.25 + 0.15 * Math.sin(t * 2.2);
      };

      animateHooks.push(updateFlare);
    });

    // Heartbeat sound
    const heart = new Tone.Player("/heartbeat.wav").toDestination();
    const analyser = new Tone.FFT(32);
    heart.connect(analyser);
    (async () => {
      await Tone.start();
      heart.loop = true;
      heart.autostart = true;
    })();

    const noise2D = createNoise2D();
    const heartFreq = CFG.heartBpm / 60;
    let t = 0, smooth = getNeedPulse();
    const animateHooks = [];

    // Animate loop
    const animate = () => {
      t += 0.0065;

      const breath = (Math.sin((t / CFG.breathPeriod) * Math.PI * 2) + 1) / 2;
      const beat = Math.max(0, Math.sin(t * heartFreq * Math.PI * 2));
      smooth += CFG.emaAlpha * (Math.min(1, breath * 0.75 + beat * 0.4) - smooth);

      beamMat.uniforms.time.value = t;
      beamMat.uniforms.pulse.value = smooth + 0.2;

      // Smooth emotion transition
      const currentColor = beamMat.uniforms.glowColor.value;
      currentColor.lerp(new THREE.Color(getCurrentGlowColor()), 0.05);

      beam.scale.set(1 + smooth * 0.15, 1, 1);
      beam.position.x = Math.sin(t * 1.1) * 0.008 + noise2D(t * 0.3, 0) * 0.003;

      // Run extra animation hooks (e.g. flare)
      animateHooks.forEach(fn => fn(t));

      composer.render();
      requestAnimationFrame(animate);
    };
    animate();

    // Resize
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      mount.current.removeChild(renderer.domElement);
      renderer.dispose();
      Tone.Transport.stop();
      heart.dispose();
    };
  }, []);

  return (
    <div ref={mount} className="relative w-screen h-screen bg-black overflow-hidden">
      {/* Gradient Fade Mask (much stronger) */}
      <div className="pointer-events-none absolute inset-0 z-10 fade-mask" />

      {/* Facial overlay */}
      <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 z-20">
        <GazeEyes />
      </div>

      {/* Text interface */}
      <TypingPanel />

      {/* Sentience overlays */}
      <InstitutionalOverlay />

      {/* Market ticker */}
      <div className="pointer-events-none absolute bottom-2 w-full flex justify-center z-20">
        <FinanceTicker />
      </div>
    </div>
  );
}
