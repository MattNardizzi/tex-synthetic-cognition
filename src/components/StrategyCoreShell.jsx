// StrategyCoreShell.jsx — Tex visual core layer v5.0
// ------------------------------------------------------------
// Purpose: Cinematic AGI beam with perfect-black background and live emotion pulse

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { createNoise2D } from "simplex-noise";
import * as Tone from "tone";

import { getNeedPulse } from "../systems/needPulse";
import { getCurrentGlowColor, getCurrentEmotionIntensity } from "../systems/emotionEngine";

import TypingPanel from "./TypingPanel";
import InstitutionalOverlay from "./InstitutionalOverlay";
import FinanceTicker from "./FinanceTicker";
import GazeEyes from "./GazeEyes";

const CFG = {
  breathPeriod: 3.0,
  heartBpm: 110,
  emaAlpha: 0.08,
  beamRadius: 0.008,
  beamHeight: 2.2,
};

export default function StrategyCoreShell() {
  const mount = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // pure black

    const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0.15, 3.6);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.current.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.65, 0.3, 0.8));

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
          p.x += sin(time * 3. + position.y * 5.) * 0.008 * pulse;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float pulse;
        varying vec3 vPos;
        void main(){
          float i = (1. - abs(vPos.y) / ${CFG.beamHeight / 2}.0) * pulse;
          gl_FragColor = vec4(glowColor * i * 1.6, 1.0); // boosted intensity
        }
      `,
    });

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(CFG.beamRadius, CFG.beamRadius, CFG.beamHeight, 48),
      beamMat
    );
    scene.add(beam);

    new THREE.TextureLoader().load("/flare.png", (tex) => {
      const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0.4 }));
      flare.scale.set(0.8, 0.8, 1);
      flare.position.y = CFG.beamHeight / 2;
      beam.add(flare);
    });

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
    let t = 0,
      smooth = getNeedPulse();

    const animate = () => {
      t += 0.007;
      const breath = (Math.sin((t / CFG.breathPeriod) * Math.PI * 2) + 1) / 2;
      const beat = Math.max(0, Math.sin(t * heartFreq * Math.PI * 2));
      smooth += CFG.emaAlpha * (Math.min(1, breath * 0.8 + beat * 0.5) - smooth);
      const bassBin = analyser.getValue()[1];
      const audioAmp = THREE.MathUtils.clamp((bassBin + 90) / 50, 0, 1);

      beamMat.uniforms.time.value = t;
      beamMat.uniforms.pulse.value = smooth + audioAmp * 0.4;
      beamMat.uniforms.glowColor.value.set(getCurrentGlowColor());

      const width = 0.75 + smooth * 0.28 + audioAmp * 0.3;
      beam.scale.set(width, 1 + audioAmp * 0.04, 1);
      beam.position.x = Math.sin(t * 1.3) * 0.011 + noise2D(t * 0.25, 0) * 0.004;

      composer.render();
      requestAnimationFrame(animate);
    };
    animate();

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
      <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2">
        <GazeEyes />
      </div>
      <TypingPanel />
      <InstitutionalOverlay />
      <div className="pointer-events-none absolute bottom-2 w-full flex justify-center">
        <FinanceTicker />
      </div>
    </div>
  );
}
