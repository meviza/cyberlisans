'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 font-medium transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/50',
        success: 'bg-cyber-lime/20 text-cyber-lime border border-cyber-lime/50',
        warning: 'bg-cyber-yellow/20 text-cyber-yellow border border-cyber-yellow/50',
        danger: 'bg-cyber-pink/20 text-cyber-pink border border-cyber-pink/50',
        magenta: 'bg-cyber-magenta/20 text-cyber-magenta border border-cyber-magenta/50',
        outline: 'bg-transparent text-cyber-text border border-cyber-text/30',
      },
      size: {
        sm: 'h-5 px-1.5 text-[10px] rounded-sm',
        md: 'h-6 px-2 text-xs rounded-md',
        lg: 'h-7 px-2.5 text-sm rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size, className }))} {...props} />;
}

export { Badge, badgeVariants };
