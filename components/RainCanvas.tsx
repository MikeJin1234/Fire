
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { RainMode } from '../types';
import { RAIN_COUNT, BOUNDS, COLORS, PHYSICS, LERP_FACTOR } from '../constants';

const vertexShader = `
  attribute float isTail;
  attribute float randomSeed;
  attribute float individualSpeed;
  
  uniform float uTime;
  uniform float uSpeed;
  uniform float uDrift;
  uniform float uStretch;

  varying float vIsTail;
  varying float vOpacity;

  void main() {
    vIsTail = isTail;
    vec3 pos = position;

    // Movement Physics
    // Apply collective speed + individual variation
    float movement = uSpeed * individualSpeed;
    
    // Stretch logic: Tail is pulled further back relative to movement direction
    if (isTail > 0.5) {
      pos.y -= movement * uStretch;
    }

    // Drift effect (Brownian-ish motion for suspension)
    float driftX = sin(uTime * 2.0 + randomSeed * 10.0) * uDrift;
    float driftZ = cos(uTime * 1.5 + randomSeed * 12.0) * uDrift;
    pos.x += driftX;
    pos.z += driftZ;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Calculate opacity based on speed (more transparent when fast, solid when hovering)
    vOpacity = mix(0.4, 0.9, 1.0 - abs(uSpeed * 0.5));
  }
`;

const fragmentShader = `
  varying float vIsTail;
  varying float vOpacity;
  uniform vec3 uColor;

  void main() {
    // Gradient fade from head to tail
    float alpha = vOpacity * (1.0 - vIsTail * 0.7);
    gl_FragColor = vec4(uColor, alpha);
  }
`;

interface RainCanvasProps {
  modeRef: React.MutableRefObject<RainMode>;
}

const RainCanvas: React.FC<RainCanvasProps> = ({ modeRef }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const frameIdRef = useRef<number>(0);

  // State values for lerping in the animation loop
  const lerpState = useRef({
    speed: PHYSICS[RainMode.NORMAL].speed,
    drift: PHYSICS[RainMode.NORMAL].drift,
    color: COLORS[RainMode.NORMAL].clone()
  });

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Setup Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Geometry creation
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(RAIN_COUNT * 2 * 3);
    const isTails = new Float32Array(RAIN_COUNT * 2);
    const randomSeeds = new Float32Array(RAIN_COUNT * 2);
    const individualSpeeds = new Float32Array(RAIN_COUNT * 2);

    for (let i = 0; i < RAIN_COUNT; i++) {
      const x = (Math.random() - 0.5) * BOUNDS.width;
      const y = (Math.random() - 0.5) * BOUNDS.height;
      const z = (Math.random() - 0.5) * BOUNDS.depth;
      const seed = Math.random();
      const variantSpeed = 0.8 + Math.random() * 0.4;

      // Head
      positions[i * 6] = x;
      positions[i * 6 + 1] = y;
      positions[i * 6 + 2] = z;
      isTails[i * 2] = 0.0;
      randomSeeds[i * 2] = seed;
      individualSpeeds[i * 2] = variantSpeed;

      // Tail (initially same as head, shader will stretch it)
      positions[i * 6 + 3] = x;
      positions[i * 6 + 4] = y;
      positions[i * 6 + 5] = z;
      isTails[i * 2 + 1] = 1.0;
      randomSeeds[i * 2 + 1] = seed;
      individualSpeeds[i * 2 + 1] = variantSpeed;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('isTail', new THREE.BufferAttribute(isTails, 1));
    geometry.setAttribute('randomSeed', new THREE.BufferAttribute(randomSeeds, 1));
    geometry.setAttribute('individualSpeed', new THREE.BufferAttribute(individualSpeeds, 1));

    // 3. Materials & Shaders
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: PHYSICS[RainMode.NORMAL].speed },
        uDrift: { value: PHYSICS[RainMode.NORMAL].drift },
        uStretch: { value: 2.0 },
        uColor: { value: COLORS[RainMode.NORMAL] }
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const rainLines = new THREE.LineSegments(geometry, material);
    scene.add(rainLines);

    // 4. Post Processing (Bloom)
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, // Strength
      0.4, // Radius
      0.15 // Threshold
    );
    
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // 5. Animation Loop
    const animate = (time: number) => {
      frameIdRef.current = requestAnimationFrame(animate);
      const currentMode = modeRef.current;
      const targetPhysics = PHYSICS[currentMode];
      const targetColor = COLORS[currentMode];

      // Smooth Physics Transition
      lerpState.current.speed = THREE.MathUtils.lerp(lerpState.current.speed, targetPhysics.speed, LERP_FACTOR);
      lerpState.current.drift = THREE.MathUtils.lerp(lerpState.current.drift, targetPhysics.drift, LERP_FACTOR);
      lerpState.current.color.lerp(targetColor, LERP_FACTOR);

      material.uniforms.uTime.value = time * 0.001;
      material.uniforms.uSpeed.value = lerpState.current.speed;
      material.uniforms.uDrift.value = lerpState.current.drift;
      material.uniforms.uColor.value = lerpState.current.color;

      // Update positions manually for the "cycling" effect
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < RAIN_COUNT; i++) {
        const idx = i * 6;
        const seedIdx = i * 2;
        const speed = lerpState.current.speed * individualSpeeds[seedIdx];
        
        // Vertical Move
        posAttr.array[idx + 1] += speed;
        posAttr.array[idx + 4] += speed;

        // Reset Boundary logic
        if (posAttr.array[idx + 1] < -BOUNDS.height / 2) {
          posAttr.array[idx + 1] = BOUNDS.height / 2;
          posAttr.array[idx + 4] = BOUNDS.height / 2;
        } else if (posAttr.array[idx + 1] > BOUNDS.height / 2) {
          posAttr.array[idx + 1] = -BOUNDS.height / 2;
          posAttr.array[idx + 4] = -BOUNDS.height / 2;
        }
      }
      posAttr.needsUpdate = true;

      composer.render();
    };
    
    frameIdRef.current = requestAnimationFrame(animate);

    // Handle Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default RainCanvas;
