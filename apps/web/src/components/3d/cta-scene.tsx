'use client';

import * as React from 'react';
import { Canvas } from '@react-three/fiber';
import { Sparkles, Stars } from '@react-three/drei';

export function CTAScene() {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }} dpr={[1, 2]} gl={{ alpha: true }}>
        <Sparkles count={200} scale={12} size={3} speed={0.5} color="#0057FF" />
        <Sparkles count={100} scale={10} size={2} speed={0.7} color="#6B7CFF" />
        <Stars radius={30} depth={30} count={500} factor={3} fade speed={2} />
      </Canvas>
    </div>
  );
}
