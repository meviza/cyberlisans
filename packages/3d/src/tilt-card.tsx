'use client';

import * as React from 'react';
import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export interface TiltCardProps {
  children?: React.ReactNode;
  width?: number;
  height?: number;
  depth?: number;
  color?: string;
  maxTilt?: number;
  position?: [number, number, number];
}

function TiltCard({
  width = 2.4,
  height = 3.2,
  depth = 0.05,
  color = '#0a0a14',
  maxTilt = 15,
  position = [0, 0, 0],
}: TiltCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const targetRotation = React.useRef({ x: 0, y: 0 });
  const { mouse, viewport } = useThree();

  useFrame(() => {
    if (!meshRef.current) return;
    const rad = (maxTilt * Math.PI) / 180;
    targetRotation.current.y = hovered ? mouse.x * rad : 0;
    targetRotation.current.x = hovered ? -mouse.y * rad : 0;
    meshRef.current.rotation.x += (targetRotation.current.x - meshRef.current.rotation.x) * 0.15;
    meshRef.current.rotation.y += (targetRotation.current.y - meshRef.current.rotation.y) * 0.15;
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={color}
          emissive={hovered ? '#00ffff' : '#001a1a'}
          emissiveIntensity={hovered ? 0.5 : 0.1}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
      {hovered && (
        <mesh position={[0, 0, -depth / 2 - 0.01]}>
          <planeGeometry args={[width * 1.2, height * 1.2]} />
          <meshBasicMaterial color="#00ffff" transparent opacity={0.1} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

export { TiltCard };
