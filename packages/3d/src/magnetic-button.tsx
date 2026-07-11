'use client';

import * as React from 'react';
import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group } from 'three';

export interface MagneticButtonProps {
  strength?: number;
  position?: [number, number, number];
  onClick?: () => void;
}

function MagneticButton({ strength = 0.3, position = [0, 0, 0], onClick }: MagneticButtonProps) {
  const groupRef = useRef<Group>(null);
  const [hovered, setHovered] = useState(false);
  const { viewport, mouse } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    const targetX = hovered ? mouse.x * viewport.width * 0.15 * strength : 0;
    const targetY = hovered ? mouse.y * viewport.height * 0.15 * strength : 0;
    groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.15;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.15;
    const targetRotZ = hovered ? mouse.x * 0.15 : 0;
    const targetRotX = hovered ? -mouse.y * 0.15 : 0;
    groupRef.current.rotation.z += (targetRotZ - groupRef.current.rotation.z) * 0.15;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.15;
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={onClick}
    >
      <mesh>
        <boxGeometry args={[2.5, 0.7, 0.1]} />
        <meshStandardMaterial
          color={hovered ? '#0057FF' : '#0a0a14'}
          emissive={hovered ? '#0057FF' : '#0044CC'}
          emissiveIntensity={hovered ? 1.2 : 0.4}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

export { MagneticButton };
