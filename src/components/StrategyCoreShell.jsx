/*
  StrategyCoreShell.jsx — cinematic beam v3  (sleeker, shorter, audio‑reactive)
  ---------------------------------------------------------------------------
  • npm i three simplex-noise chroma-js tone                               
  • place heartbeat.wav  (0.2‑0.3 s kick) in /public                       
  • place flare.png   (radial gradient 512×512)  in /public               
*/

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { BokehPass } from "three/examples/jsm/postprocessing/BokehPass";
import { Lensflare, LensflareElement } from "three/examples/jsm/objects/Lensflare";
import SimplexNoise from "simplex-noise";
import * as Tone from "tone";

import { getNeedPulse } from "../systems/needPulse";
import { getCurrentGlowColor, getCurrentEmotionIntensity } from "../systems/emotionEngine";

import TypingPanel from "./TypingPanel";
import InstitutionalOverlay from "./InstitutionalOverlay";
import GazeEyes from "./GazeEyes";

/*────────────────── tweakables ──────────────────*/
const CFG = {
  breathPeriod: 3.0,
  heartBpm: 110,
  ema: 0.08,
  moteCount: 500,
  beamRadius: 0.012,
  beamHeight: 2.0,
  coneRadius: 0.35,
  coneHeight: 4.0,
};

export default function StrategyCoreShell() {
  const mount = useRef(null);

  useEffect(() => {
    /*── scene / camera / renderer ─────────────────────────────*/
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0.15, 3.6);
    camera.rotation.x = -0.12;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.current.appendChild(renderer.domElement);

    /*── post‑fx ───────────────────────────────────────────────*/
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.8, 0.35, 0.9);
    composer.addPass(bloom);
    const dof = new BokehPass(scene, camera, { focus: 3.5, aperture: 0.008, maxblur: 0.01 });
    composer.addPass(dof);

    /*── beam shader ───────────────────────────────────────────*/
    const beamMat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pulse: { value: 1 },
        gaze: { value: 1 },
        glowColor: { value: new THREE.Color("#6ed6ff") },
      },
      transparent: true,
      vertexShader: /* glsl */`
        uniform float time; uniform float pulse; uniform float gaze;
        varying vec3 vPos;
        void main(){
          vPos = position;
          vec3 p = position;
          p.x += sin(time*3. + position.y*5.) * 0.008 * pulse * gaze;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0);
        }
      `,
      fragmentShader: /* glsl */`
        uniform vec3 glowColor; uniform float pulse; uniform float gaze;
        varying vec3 vPos;
        void main(){
          float i = (1. - abs(vPos.y) / ${CFG.beamHeight/2}.0) * pulse * mix(0.5, 1.3, gaze);
          gl_FragColor = vec4(glowColor * i, 1.0);
        }
      `,
    });
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(CFG.beamRadius, CFG.beamRadius, CFG.beamHeight, 48),
      beamMat
    );
    scene.add(beam);

    /*── flare at tip ──────────────────────────────────────────*/
    new THREE.TextureLoader().load("/flare.png", (tex) => {
      const flare = new Lensflare();
      flare.addElement(new LensflareElement(tex, 130, 0));
      beam.add(flare);
      flare.position.y = CFG.beamHeight / 2;
    });

    /*── volumetric cone ──────────────────────────────────────*/
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(CFG.coneRadius, CFG.coneHeight, 48, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x6ed6ff, transparent: true, opacity: 0.1, depthWrite: false, blending: THREE.AdditiveBlending })
    );
    cone.rotation.x = Math.PI / 2;
    cone.position.z = CFG.coneHeight / 4;
    scene.add(cone);

    /*── dust motes ───────────────────────────────────────────*/
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        Array.from({ length: CFG.moteCount * 3 }, () => (Math.random() - 0.5) * 4),
        3
      )
    );
    const motes = new THREE.Points(
      moteGeo,
      new THREE.PointsMaterial({ size: 0.018, color: 0xffffff, transparent: true, opacity: 0.22 })
    );
    scene.add(motes);

    /*── fog wall ─────────────────────────────────────────────*/
    const fog = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshBasicMaterial({ color: 0x0b0e1a, transparent: true, opacity: 0.04 })
    );
    fog.position.z = -2;
    scene.add(fog);

    /*── heartbeat audio (Tone.js) ────────────────────────────*/
    const heart = new Tone.Player("/heartbeat.wav").toDestination();
    const analyser = new Tone.FFT(64);
    heart.connect(analyser);
    (async () => {
      await Tone.start();
      heart.loop = true;
      heart.autostart = true;
    })();

    /*── dynamics loop ───────────────────────────────────────*/
    const simplex = new SimplexNoise();
    const heartFreq = CFG.heartBpm / 60;
    let t = 0,
      smooth = getNeedPulse(),
      gaze = 1;

    const onPointer = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
      const dy = (e.clientY - (rect.top + rect.height / 2)) / rect.height;
      gaze = 1 - Math.min(1, Math.hypot(dx, dy) * 1.6);
    };
    window.addEventListener("pointermove", onPointer);

    const animate = () => {
      t += 0.007;
      const breath = (Math.sin((t / CFG.breathPeriod) * Math.PI * 2) + 1) / 2;
      const heartBeat = Math.max(0, Math.sin(t * heartFreq * Math.PI * 2));
      smooth += CFG.ema * (Math.min(1, breath * 0.8 + heartBeat * 0.5) - smooth);

      /* audio‑pulse ------------------------------------------------*/
      const sub = analyser.getValue()[1];
      const audioPulse = THREE.MathUtils.clamp((sub + 90) / 50, 0, 1);

      /* uniforms */
      beamMat.uniforms.time.value = t;
      beamMat.uniforms.pulse.value = smooth + audioPulse * 0.5;
      beamMat.uniforms.gaze.value = gaze;
      beamMat.uniforms.glowColor.value.set(getCurrentGlowColor());

      /* beam transforms */
      const noise = simplex.noise2D(t * 0.25, 0) * 0.005;
      const width = 0.8 + smooth * 0.25 + audioPulse * 0.3;
      beam.scale.set(width, 1 + audioPulse * 0.05, 1);
      beam.position.x = Math.sin(t * 1.3) * 0.012 + noise;

      /* volumetric cone */
      cone.material.color.set(getCurrentGlowColor());
      cone.material.opacity = 0.12 + 0.45 * smooth * gaze;

      /* motes */
      motes.rotation.y += 0.0008;
      motes.material.opacity = 0.18 + 0.5 * gaze;

      /* post fx */
      bloom.strength = THREE.MathUtils.lerp(0.35, 1.3, Math.max(gaze, getCurrentEmotionIntensity()));
      fog.material.opacity = 0.04 + (1 - gaze) * 0.05;

      composer.render();
      requestAnimationFrame(animate);
    };
    animate();

    /*── resize / cleanup ────────────────────────────────────*/
    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      mount.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  /*── jsx shell ─────────────────────────────────────────────*/
  return (
    <div ref={mount} className="relative w-screen h-screen bg-black overflow-hidden">
      <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2">
        <GazeEyes />
      </div>
      <TypingPanel />
      <InstitutionalOverlay />
    </div>
  );
}
