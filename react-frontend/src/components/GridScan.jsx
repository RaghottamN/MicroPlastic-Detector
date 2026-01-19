import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const ChromaticAberrationShader = {
  uniforms: {
    tDiffuse: { value: null },
    uOffset: { value: 0.002 },
    uNoise: { value: 0.01 },
    uTime: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uOffset;
    uniform float uNoise;
    uniform float uTime;
    varying vec2 vUv;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    void main() {
      vec2 offset = vec2(uOffset, 0.0);
      float r = texture2D(tDiffuse, vUv + offset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - offset).b;
      vec4 color = vec4(r, g, b, 1.0);
      
      // Add noise
      float noise = random(vUv + uTime) * uNoise;
      color.rgb += noise;
      
      gl_FragColor = color;
    }
  `,
};

function GridScan({
  sensitivity = 0.55,
  lineThickness = 1,
  linesColor = '#6b5b95',
  gridScale = 0.1,
  scanColor = '#FF9FFC',
  scanOpacity = 0.5,
  enablePost = true,
  bloomIntensity = 0.8,
  chromaticAberration = 0.002,
  noiseIntensity = 0.01,
  className = '',
}) {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050508);

    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Create custom grid with glowing lines
    const gridGroup = new THREE.Group();
    const gridColor = new THREE.Color(linesColor);
    const gridDimension = 40;
    const gridDivisions = 40;
    const spacing = gridDimension / gridDivisions;

    // Create grid lines material with glow
    const lineMaterial = new THREE.LineBasicMaterial({
      color: gridColor,
      transparent: true,
      opacity: 0.6,
    });

    // Horizontal lines
    for (let i = -gridDivisions / 2; i <= gridDivisions / 2; i++) {
      const lineGeometry = new THREE.BufferGeometry();
      const points = [
        new THREE.Vector3(-gridDimension / 2, 0, i * spacing),
        new THREE.Vector3(gridDimension / 2, 0, i * spacing),
      ];
      lineGeometry.setFromPoints(points);
      const line = new THREE.Line(lineGeometry, lineMaterial.clone());
      gridGroup.add(line);
    }

    // Vertical lines
    for (let i = -gridDivisions / 2; i <= gridDivisions / 2; i++) {
      const lineGeometry = new THREE.BufferGeometry();
      const points = [
        new THREE.Vector3(i * spacing, 0, -gridDimension / 2),
        new THREE.Vector3(i * spacing, 0, gridDimension / 2),
      ];
      lineGeometry.setFromPoints(points);
      const line = new THREE.Line(lineGeometry, lineMaterial.clone());
      gridGroup.add(line);
    }

    gridGroup.position.y = -2;
    scene.add(gridGroup);

    // Create scan line plane
    const scanGeometry = new THREE.PlaneGeometry(80, 0.3);
    const scanMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(scanColor) },
        uOpacity: { value: scanOpacity },
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uOpacity;
        uniform float uTime;
        varying vec2 vUv;
        
        void main() {
          float alpha = smoothstep(0.0, 0.5, vUv.y) * smoothstep(1.0, 0.5, vUv.y);
          alpha *= uOpacity * 1.5;
          vec3 glow = uColor * (1.0 + 0.3 * sin(uTime * 3.0));
          gl_FragColor = vec4(glow, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    const scanLine = new THREE.Mesh(scanGeometry, scanMaterial);
    scanLine.rotation.x = -Math.PI / 2;
    scanLine.position.y = -1.9;
    scene.add(scanLine);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x6b5b95, 0.3);
    scene.add(ambientLight);

    // Add point light at scan position
    const scanLight = new THREE.PointLight(new THREE.Color(scanColor), 2, 15);
    scanLight.position.set(0, -1, 0);
    scene.add(scanLight);

    // Post-processing
    let composer;
    let chromaticPass;

    if (enablePost) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));

      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(containerRef.current.clientWidth, containerRef.current.clientHeight),
        bloomIntensity,
        0.4,
        0.2
      );
      composer.addPass(bloomPass);

      chromaticPass = new ShaderPass(ChromaticAberrationShader);
      chromaticPass.uniforms.uOffset.value = chromaticAberration;
      chromaticPass.uniforms.uNoise.value = noiseIntensity;
      composer.addPass(chromaticPass);
    }

    // Mouse handling
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = (e.clientY - rect.top) / rect.height;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize handling
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      if (composer) {
        composer.setSize(width, height);
      }
    };
    window.addEventListener('resize', handleResize);

    // Animation
    let animationId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Animate scan line moving across the grid
      scanLine.position.z = Math.sin(elapsedTime * 0.8) * 15;
      scanLight.position.z = scanLine.position.z;
      scanMaterial.uniforms.uTime.value = elapsedTime;

      // Camera/Grid movement based on mouse
      const targetX = (mouseRef.current.x - 0.5) * sensitivity * 4;
      const targetZ = (mouseRef.current.y - 0.5) * sensitivity * 4;

      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.z += (10 + targetZ - camera.position.z) * 0.05;
      camera.lookAt(0, 0, 0);

      // Subtle grid animation
      gridGroup.rotation.y = Math.sin(elapsedTime * 0.1) * 0.05;

      if (enablePost && composer) {
        chromaticPass.uniforms.uTime.value = elapsedTime;
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [sensitivity, lineThickness, linesColor, gridScale, scanColor, scanOpacity, enablePost, bloomIntensity, chromaticAberration, noiseIntensity]);

  return <div ref={containerRef} className={`w-full h-full ${className}`} />;
}

export default GridScan;
