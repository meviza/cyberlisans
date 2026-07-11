'use client';

import * as React from 'react';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Plane } from '@react-three/drei';
import * as THREE from 'three';

export interface NeonGridProps {
  color?: string;
  speed?: number;
  size?: number;
  divisions?: number;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPos;
  uniform float uTime;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += sin(p.x * 0.5 + uTime * 0.5) * 0.05;
    p.z += cos(p.y * 0.5 + uTime * 0.4) * 0.05;
    vPos = p;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPos;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uDivisions;

  float gridLine(vec2 p, float div) {
    vec2 g = abs(fract(p * div - 0.5) - 0.5);
    float line = min(g.x, g.y);
    return smoothstep(0.0, 0.05, line);
  }

  void main() {
    vec2 p = vUv * 1.0;
    float line1 = gridLine(p, uDivisions);
    float line2 = gridLine(p + vec2(uTime * 0.05, uTime * 0.03), uDivisions * 0.5);
    float dist = length(vUv - 0.5);
    vec3 color = mix(uColorA, uColorB, smoothstep(0.0, 1.0, vUv.y + uTime * 0.05));
    vec3 emissive = color * ((1.0 - line1) * 0.8 + (1.0 - line2) * 0.4);
    float fade = 1.0 - smoothstep(0.3, 0.7, dist);
    gl_FragColor = vec4(emissive, fade);
  }
`;

function NeonGridMesh({ color = '#0057FF', speed = 1, size = 30, divisions = 20 }: NeonGridProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const colorA = React.useMemo(() => new THREE.Color(color), [color]);
  const colorB = React.useMemo(() => new THREE.Color('#6B7CFF'), []);

  useFrame(({ clock }) => {
    if (matRef.current?.uniforms.uTime)
      matRef.current.uniforms.uTime.value = clock.elapsedTime * speed;
  });

  const uniforms = React.useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: colorA },
      uColorB: { value: colorB },
      uDivisions: { value: divisions },
    }),
    [colorA, colorB, divisions],
  );

  return (
    <Plane args={[size, size, 32, 32]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </Plane>
  );
}

function NeonGrid(props: NeonGridProps) {
  return <NeonGridMesh {...props} />;
}

export { NeonGrid };
