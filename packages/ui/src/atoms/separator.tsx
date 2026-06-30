'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const separatorVariants = cva(
  'relative bg-gradient-to-r from-transparent via-cyber-cyan to-transparent',
  {
    variants: {
      orientation: {
        horizontal: 'h-px w-full',
        vertical: 'w-px h-full bg-gradient-to-b from-transparent via-cyber-cyan to-transparent',
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  },
);

export interface SeparatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorVariants> {}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      className={cn(separatorVariants({ orientation }), 'animate-pulse', className)}
      {...props}
    />
  ),
);
Separator.displayName = 'Separator';

export { Separator, separatorVariants };
