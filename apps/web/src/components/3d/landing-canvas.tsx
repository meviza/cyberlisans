'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useRef } from 'react';

function SoftOrb({
  position,
  color,
  scale = 1,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * 0.12;
    ref.current.rotation.y = state.clock.elapsedTime * 0.18;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
      <mesh ref={ref} position={position} scale={scale}>
        <icosahedronGeometry args={[1.1, 16]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.25}
          metalness={0.35}
          distort={0.25}
          speed={1.5}
          transparent
          opacity={0.92}
        />
      </mesh>
    </Float>
  );
}

function CameraRig() {
  useFrame(({ camera, mouse }) => {
    camera.position.x += (mouse.x * 0.35 - camera.position.x) * 0.04;
    camera.position.y += (-mouse.y * 0.2 + 0.4 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function LandingCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 6.5], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.setClearColor(0x000000, 0);
      }}
    >
      <CameraRig />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 2]} intensity={1.1} color="#ffffff" />
      <pointLight position={[-3, 1, 2]} intensity={0.8} color="#0057FF" />
      <pointLight position={[3, -1, -1]} intensity={0.4} color="#6B7CFF" />

      <SoftOrb position={[0, 0.1, 0]} color="#1a3a8a" scale={1.35} />
      <SoftOrb position={[-2.1, 0.6, -0.8]} color="#0057FF" scale={0.55} />
      <SoftOrb position={[2.0, -0.5, -0.4]} color="#4B6BFF" scale={0.45} />

      <Environment preset="city" environmentIntensity={0.35} />
    </Canvas>
  );
}
