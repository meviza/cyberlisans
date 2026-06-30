'use client';

import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../atoms';
import { cn } from '../utils/cn';

export interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  className?: string;
}

function FeatureCard({ title, description, icon: IconComponent, className }: FeatureCardProps) {
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = React.useState({ x: 0, y: 0 });
  const [glow, setGlow] = React.useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -6, y: x * 6 });
    setGlow({ x: (x + 0.5) * 100, y: (y + 0.5) * 100 });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(8px)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.25s ease-out',
      }}
      className={cn('group relative', className)}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(255,0,255,0.25), transparent 60%)`,
        }}
      />
      <Card className="relative h-full">
        <CardContent className="space-y-3 p-6">
          <div className="inline-flex rounded-md border border-cyber-magenta/40 bg-cyber-magenta/10 p-3 text-cyber-magenta group-hover:border-cyber-magenta group-hover:shadow-neon-magenta transition-all duration-300">
            <IconComponent className="h-6 w-6" />
          </div>
          <h3 className="font-orbitron text-lg font-semibold text-cyber-text group-hover:text-cyber-cyan transition-colors">
            {title}
          </h3>
          <p className="text-sm text-cyber-text-dim leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export { FeatureCard };
