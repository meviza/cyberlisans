'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Stars, Environment, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { NeonGrid, ParticleField, FloatingCube } from '@cyberlisans/3d';

function CameraRig() {
  useFrame(({ camera, mouse }) => {
    camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.05;
    camera.position.y += (-mouse.y * 0.3 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function SceneFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#00F0FF" wireframe />
    </mesh>
  );
}

export function LandingScene() {
  return (
    <div className="absolute inset-0 h-full w-full">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 60 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
        }}
      >
        <CameraRig />
        <color attach="background" args={['#050510']} />
        <fog attach="fog" args={['#050510', 8, 25]} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#00F0FF" />
        <pointLight position={[-10, -5, -5]} intensity={1.2} color="#FF00C8" />
        <Suspense fallback={<SceneFallback />}>
          <NeonGrid color="#00F0FF" speed={0.5} />
          <ParticleField count={2000} color1="#00F0FF" color2="#FF00C8" />
          <Float speed={1.5} rotationIntensity={1.5} floatIntensity={2}>
            <FloatingCube position={[0, 1, 0]} />
          </Float>
          <Environment preset="city" />
        </Suspense>
        <Sparkles count={100} scale={10} size={2} speed={0.3} color="#00F0FF" />
        <Sparkles count={50} scale={8} size={1.5} speed={0.4} color="#FF00C8" />
        <Stars radius={50} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
      </Canvas>
    </div>
  );
}