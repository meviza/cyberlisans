'use client';

import * as React from 'react';
import { cn } from '../utils/cn';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-cyber-bg-elevated/60',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-cyber-cyan/20 before:to-transparent',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
