'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 font-medium transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'bg-brand-accent/15 text-brand-accent border border-brand-accent/30',
        success: 'bg-brand-success/15 text-brand-success border border-brand-success/30',
        warning: 'bg-brand-warning/15 text-brand-warning border border-brand-warning/30',
        danger: 'bg-brand-danger/15 text-brand-danger border border-brand-danger/30',
        cyan: 'bg-brand-accent/15 text-brand-accent border border-brand-accent/30',
        magenta: 'bg-brand-accent-soft text-[#6B7CFF] border border-[#6B7CFF]/30',
        purple: 'bg-white/[0.04] text-brand-text-secondary border border-white/10',
        outline: 'bg-transparent text-brand-text border border-white/15',
      },
      size: {
        sm: 'h-5 px-1.5 text-[10px] rounded-md',
        md: 'h-6 px-2 text-xs rounded-md',
        lg: 'h-7 px-2.5 text-sm rounded-lg',
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
