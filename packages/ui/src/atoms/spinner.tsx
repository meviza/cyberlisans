'use client';

import * as React from 'react';
import { cn } from '../utils/cn';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-4',
};

function Spinner({ className, size = 'md', ...props }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block animate-spin rounded-full border-cyber-cyan/20 border-t-cyber-cyan shadow-neon-cyan',
        sizeMap[size],
        className,
      )}
      {...props}
    />
  );
}

export { Spinner };
