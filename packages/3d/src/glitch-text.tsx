'use client';

import * as React from 'react';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export interface GlitchTextProps {
  text: string;
  fontSize?: number;
  color?: string;
  position?: [number, number, number];
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.x += sin(p.y * 8.0 + uTime * 6.0) * 0.02 * uIntensity;
    p.x += (step(0.99, fract(sin(uTime + p.y * 12.0) * 43758.5453)) - 0.5) * 0.4 * uIntensity;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColor;
  varying vec2 vUv;
  void main() {
    float scan = sin(vUv.y * 200.0 + uTime * 10.0) * 0.04;
    vec3 col = uColor;
    col.r += scan * uIntensity;
    col.b -= scan * uIntensity;
    float glitch = step(0.98, fract(sin(uTime * 3.0 + vUv.y * 50.0) * 43758.5453)) * uIntensity;
    col = mix(col, vec3(1.0), glitch * 0.5);
    gl_FragColor = vec4(col, 1.0);
  }
`;

function GlitchTextMaterial({ color, intensity = 1 }: { color: string; intensity?: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const c = React.useMemo(() => new THREE.Color(color), [color]);

  useFrame(({ clock }) => {
    if (matRef.current?.uniforms.uTime) matRef.current.uniforms.uTime.value = clock.elapsedTime;
    if (matRef.current?.uniforms.uIntensity) matRef.current.uniforms.uIntensity.value = intensity;
  });

  const uniforms = React.useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uColor: { value: c },
    }),
    [c, intensity],
  );

  return (
    <shaderMaterial
      ref={matRef}
      vertexShader={vertexShader}
      fragmentShader={fragmentShader}
      uniforms={uniforms}
      transparent
    />
  );
}

function GlitchText({
  text,
  fontSize = 1,
  color = '#00ffff',
  position = [0, 0, 0],
}: GlitchTextProps) {
  return (
    <Text
      fontSize={fontSize}
      color={color}
      position={position}
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.05}
    >
      {text}
      <GlitchTextMaterial color={color} intensity={1} />
    </Text>
  );
}

export { GlitchText };
