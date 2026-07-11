'use client';

import * as React from 'react';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';
import * as THREE from 'three';

export interface FloatingCubeProps {
  size?: number;
  color?: string;
  edgeColor?: string;
  speed?: number;
  position?: [number, number, number];
  enableControls?: boolean;
}

function FloatingCube({
  size = 1,
  color = '#0057FF',
  edgeColor = '#6B7CFF',
  speed = 1,
  position = [0, 0, 0],
  enableControls = false,
}: FloatingCubeProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime * speed;
    groupRef.current.rotation.x = t * 0.5;
    groupRef.current.rotation.y = t * 0.7;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.8) * 0.3;
  });

  return (
    <>
      <group ref={groupRef} position={position}>
        <mesh>
          <boxGeometry args={[size, size, size]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.4}
            transparent
            opacity={0.3}
            wireframe={false}
          />
        </mesh>
        <mesh>
          <boxGeometry args={[size * 1.02, size * 1.02, size * 1.02]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.5} />
        </mesh>
        <Edges color={edgeColor} threshold={15} />
      </group>
      {enableControls && <OrbitControls enablePan={false} enableZoom={false} />}
    </>
  );
}

export { FloatingCube };
