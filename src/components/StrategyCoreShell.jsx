// src/components/StrategyCoreShell.jsx — **cinematic 3-D beam v2**
// ---------------------------------------------------------------------------
// Deps (once):  npm install three@latest simplex-noise chroma-js
// Asset: put a 512×512 radial gradient PNG at /public/flare.png
// ---------------------------------------------------------------------------
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer }  from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass }      from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { BokehPass }       from "three/examples/jsm/postprocessing/BokehPass";
import { Lensflare, LensflareElement } from "three/examples/jsm/objects/Lensflare";
import SimplexNoise from "simplex-noise";

import { getNeedPulse }                from "../systems/needPulse";
import { getCurrentGlowColor, getCurrentEmotionIntensity } from "../systems/emotionEngine";

import TypingPanel          from "./TypingPanel";
import InstitutionalOverlay from "./InstitutionalOverlay";
import GazeEyes             from "./GazeEyes";

/* tweakables */
const CONFIG = {
  breathPeriod : 3.2,
  heartBpm     : 112,
  emaAlpha     : 0.09,
  moteCount    : 600,
};

export default function StrategyCoreShell() {
  const mount = useRef(null);

  useEffect(() => {
    /*──── base three.js setup ─────────────────────────────────*/
    const scene   = new THREE.Scene();
    const camera  = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0.25, 4.0);
    camera.rotation.x = -0.12;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.current.appendChild(renderer.domElement);

    /* post-processing chain */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.9, 0.45, 0.85);
    composer.addPass(bloom);
    const dof = new BokehPass(scene, camera, { focus: 3.9, aperture: 0.01, maxblur: 0.018 });
    composer.addPass(dof);

    /* beam shader */
    const beamMat = new THREE.ShaderMaterial({
      uniforms: {
        time:      { value: 0 },
        pulse:     { value: 1 },
        gaze:      { value: 1 },
        glowColor: { value: new THREE.Color("#6ed6ff") }
      },
      transparent:true,
      vertexShader: /* glsl */`
        uniform float time; uniform float pulse; uniform float gaze;
        varying vec3 vPos;
        void main(){
          vPos = position;
          vec3 p = position;
          p.x += sin(time*3.+position.y*5.) * 0.01 * pulse * gaze;
          gl_Position = projectionMatrix*modelViewMatrix*vec4(p,1.0);
        }
      `,
      fragmentShader: /* glsl */`
        uniform vec3  glowColor; uniform float pulse; uniform float gaze;
        varying vec3  vPos;
        void main(){
          float i = (1. - abs(vPos.y)/1.5) * pulse * mix(.4,1.25,gaze);
          gl_FragColor = vec4(glowColor * i, 1.0);
        }
      `
    });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,3,48), beamMat);
    scene.add(beam);

    /* flare sprite at beam tip */
    new THREE.TextureLoader().load("/flare.png", tex => {
      const flare = new Lensflare();
      flare.addElement(new LensflareElement(tex, 160, 0));
      beam.add(flare);
      flare.position.y = 1.5;
    });

    /* volumetric cone */
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.6, 6, 48, 1, true),
      new THREE.MeshBasicMaterial({ color: 0x6ed6ff, transparent:true, opacity:0.1, depthWrite:false, blending:THREE.AdditiveBlending })
    );
    cone.rotation.x = Math.PI/2;
    cone.position.z = 1.5;
    scene.add(cone);

    /* dust motes */
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute("position", new THREE.Float32BufferAttribute(Array(CONFIG.moteCount*3).fill(0).map(()=> (Math.random()-0.5)*4 ),3));
    const motes = new THREE.Points(moteGeo,new THREE.PointsMaterial({ size:0.02,color:0xffffff,transparent:true,opacity:0.25 }));
    scene.add(motes);

    /* haze backdrop */
    const fog = new THREE.Mesh(new THREE.PlaneGeometry(10,10), new THREE.MeshBasicMaterial({color:0x0b0e1a, transparent:true, opacity:0.05}));
    fog.position.z = -2; scene.add(fog);

    /*──── dynamics ───────────────────────────────────────────*/
    const simplex = new SimplexNoise();
    const heartFreq = CONFIG.heartBpm / 60;
    let t=0, smooth=getNeedPulse(), gaze=1;
    const onPointer = e => {
      const {left,top,width,height} = renderer.domElement.getBoundingClientRect();
      const dx=(e.clientX-(left+width/2))/width, dy=(e.clientY-(top+height/2))/height;
      gaze = 1-Math.min(1, Math.hypot(dx,dy)*1.7);
    };
    window.addEventListener('pointermove',onPointer);

    const animate=()=>{
      t+=0.007;
      const breath=(Math.sin((t/CONFIG.breathPeriod)*Math.PI*2)+1)/2;
      const heart =Math.max(0,Math.sin(t*heartFreq*Math.PI*2));
      smooth+=CONFIG.emaAlpha*(Math.min(1,breath*0.8+heart*0.5)-smooth);

      /* uniforms */
      beamMat.uniforms.time.value=t;
      beamMat.uniforms.pulse.value=smooth;
      beamMat.uniforms.gaze.value=gaze;
      beamMat.uniforms.glowColor.value.set(getCurrentGlowColor());

      /* beam transform */
      const noise=simplex.noise2D(t*0.3,0)*0.006;
      beam.scale.set(0.9+smooth*0.4,1+Math.sin(t*heartFreq*Math.PI*2)*0.05*smooth,1);
      beam.position.x=Math.sin(t*1.3)*0.015+noise;
      beam.position.z=Math.sin(t*heartFreq*Math.PI*2)*0.05*smooth;

      /* volumetric & particles */
      cone.material.color.set(getCurrentGlowColor());
      cone.material.opacity=0.1+0.4*smooth*gaze;
      motes.rotation.y+=0.001;
      motes.material.opacity=0.15+0.5*gaze;

      /* post passes */
      bloom.strength = THREE.MathUtils.lerp(0.4,1.4,Math.max(gaze,getCurrentEmotionIntensity()));
      fog.material.opacity=0.04+(1-gaze)*0.06;

      composer.render();
      requestAnimationFrame(animate);
    };
    animate();

    /* responsive */
    const onResize=()=>{
      renderer.setSize(window.innerWidth,window.innerHeight);
      composer.setSize(window.innerWidth,window.innerHeight);
      camera.aspect=window.innerWidth/window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize',onResize);

    return ()=>{
      window.removeEventListener('pointermove',onPointer);
      window.removeEventListener('resize',onResize);
      mount.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={mount} className="relative w-screen h-screen bg-black overflow-hidden">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none"><GazeEyes/></div>
      <TypingPanel/>
      <InstitutionalOverlay/>
    </div>
  );
}
