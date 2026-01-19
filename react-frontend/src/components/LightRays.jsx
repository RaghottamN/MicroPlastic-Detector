import React, { useEffect, useRef } from 'react';
import { Renderer, Camera, Program, Mesh, Plane, Vec2, Vec4 } from 'ogl';

function LightRays({
    raysOrigin = 'center',
    raysColor = '#ffffff',
    raysSpeed = 1,
    lightSpread = 0.5, // Reduced for valid float
    rayLength = 3,     // Reduced for valid float
    followMouse = true,
    mouseInfluence = 0.1,
    noiseAmount = 0,
    distortion = 0,
    className = '',
    pulsating = false,
    fadeDistance = 1,
    saturation = 1,
}) {
    const containerRef = useRef(null);
    const mouseRef = useRef(new Vec2(0.5, 0.5));

    useEffect(() => {
        if (!containerRef.current) return;

        const renderer = new Renderer({ alpha: true });
        const gl = renderer.gl;
        containerRef.current.appendChild(gl.canvas);

        const camera = new Camera(gl);
        camera.position.z = 1;

        const geometry = new Plane(gl, { width: 2, height: 2 });

        const vertex = `
      attribute vec3 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

        const fragment = `
      precision highp float;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec2 uResolution;
      uniform vec3 uColor;
      uniform float uSpeed;
      uniform float uSpread;
      uniform float uLength;
      uniform float uNoise;
      uniform float uDistortion;
      uniform float uFade;
      uniform float uSat;
      
      varying vec2 vUv;

      // Random function
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      // Noise function
      float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }

      void main() {
        vec2 uv = vUv;
        vec2 center = uMouse;
        
        // Calculate angle and distance from center
        vec2 db = uv - center;
        float angle = atan(db.y, db.x);
        float radius = length(db);
        
        // Ray calculation
        float ray = sin(angle * 10.0 + uTime * uSpeed + noise(uv * uNoise) * uDistortion);
        ray = smoothstep(1.0 - uSpread, 1.0, ray);
        
        // Falloff
        float falloff = 1.0 - smoothstep(0.0, uLength, radius);
        falloff *= (1.0 - uFade * radius); // Add explicit fade
        
        // Combine
        float alpha = ray * falloff * uSat;
        
        // Apply color
        vec3 color = uColor * alpha;
        
        gl_FragColor = vec4(color, alpha * 0.5);
      }
    `;

        const hexToRgb = (hex) => {
            const r = parseInt(hex.slice(1, 3), 16) / 255;
            const g = parseInt(hex.slice(3, 5), 16) / 255;
            const b = parseInt(hex.slice(5, 7), 16) / 255;
            return [r, g, b];
        };

        const program = new Program(gl, {
            vertex,
            fragment,
            uniforms: {
                uTime: { value: 0 },
                uMouse: { value: new Vec2(0.5, 0.5) },
                uResolution: { value: new Vec2(gl.canvas.width, gl.canvas.height) },
                uColor: { value: hexToRgb(raysColor) },
                uSpeed: { value: raysSpeed },
                uSpread: { value: lightSpread },
                uLength: { value: rayLength },
                uNoise: { value: noiseAmount },
                uDistortion: { value: distortion },
                uFade: { value: fadeDistance },
                uSat: { value: saturation },
            },
            transparent: true,
        });

        const mesh = new Mesh(gl, { geometry, program });

        function resize() {
            renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
            program.uniforms.uResolution.value.set(gl.canvas.width, gl.canvas.height);
        }
        window.addEventListener('resize', resize);
        resize();

        let animationId;
        function update(t) {
            animationId = requestAnimationFrame(update);
            program.uniforms.uTime.value = t * 0.001;

            if (followMouse) {
                // Smooth mouse movement
                const targetX = mouseRef.current.x;
                const targetY = 1.0 - mouseRef.current.y; // Flip Y for shader

                program.uniforms.uMouse.value.lerp(new Vec2(targetX, targetY), mouseInfluence);
            } else {
                // Default origin logic if not following mouse (e.g. top-center)
                if (raysOrigin === 'top-center') {
                    program.uniforms.uMouse.value.set(0.5, 1.0);
                } else if (raysOrigin === 'center') {
                    program.uniforms.uMouse.value.set(0.5, 0.5);
                }
            }

            renderer.render({ scene: mesh, camera });
        }
        animationId = requestAnimationFrame(update);

        const handleMouseMove = (e) => {
            const rect = containerRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            mouseRef.current.set(x, y);
        };

        if (followMouse) {
            window.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
            if (containerRef.current && gl.canvas) {
                containerRef.current.removeChild(gl.canvas);
            }
        };
    }, [raysColor, raysSpeed, lightSpread, rayLength, followMouse, mouseInfluence, noiseAmount, distortion, raysOrigin, pulsating, fadeDistance, saturation]);

    return <div ref={containerRef} className={`w-full h-full ${className}`} />;
}

export default LightRays;
