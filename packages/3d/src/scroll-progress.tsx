'use client';

import * as React from 'react';
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface ScrollProgressProps {
  height?: number;
  width?: number;
  color?: string;
  bgColor?: string;
  position?: [number, number, number];
  scrollContainer?: HTMLElement | Window | null;
}

function ScrollProgressMesh({
  height = 0.2,
  width = 4,
  color = '#0057FF',
  bgColor = '#0a0a14',
  position = [0, 0, 0],
  scrollContainer,
}: ScrollProgressProps) {
  const barRef = useRef<THREE.Mesh>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const container = scrollContainer ?? window;
      let scrollTop = 0;
      let scrollHeight = 0;
      if (container instanceof Window) {
        scrollTop = container.scrollY;
        scrollHeight = document.documentElement.scrollHeight - container.innerHeight;
      } else if (container instanceof HTMLElement) {
        scrollTop = container.scrollTop;
        scrollHeight = container.scrollHeight - container.clientHeight;
      }
      const p = scrollHeight > 0 ? Math.min(1, Math.max(0, scrollTop / scrollHeight)) : 0;
      setProgress(p);
    };
    onScroll();
    const target: Window | HTMLElement =
      scrollContainer instanceof HTMLElement ? scrollContainer : window;
    target.addEventListener('scroll', onScroll, { passive: true });
    return () => target.removeEventListener('scroll', onScroll);
  }, [scrollContainer]);

  useFrame(() => {
    if (barRef.current) {
      const scaleX = Math.max(0.001, progress);
      barRef.current.scale.x = scaleX;
      barRef.current.position.x = -width / 2 + (width * scaleX) / 2;
    }
  });

  return (
    <group position={position}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color={bgColor} transparent opacity={0.6} />
      </mesh>
      <mesh ref={barRef} position={[-width / 2, 0, 0.01]}>
        <planeGeometry args={[width, height * 0.9]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
}

function ScrollProgress(props: ScrollProgressProps) {
  return <ScrollProgressMesh {...props} />;
}

export { ScrollProgress };
