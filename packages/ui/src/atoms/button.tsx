'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-cyber-bg disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-cyber-cyan text-cyber-bg hover:bg-cyber-cyan/90 shadow-neon-cyan hover:shadow-[0_0_30px_rgba(0,255,255,0.8)]',
        secondary:
          'bg-transparent text-cyber-magenta border border-cyber-magenta hover:bg-cyber-magenta/10 shadow-neon-magenta hover:shadow-[0_0_30px_rgba(255,0,255,0.8)]',
        ghost: 'bg-transparent text-cyber-cyan hover:bg-cyber-cyan/10',
        outline:
          'bg-transparent text-cyber-cyan border border-cyber-cyan/50 hover:border-cyber-cyan hover:bg-cyber-cyan/5',
        gradient:
          'bg-gradient-to-r from-cyber-cyan to-cyber-magenta text-cyber-bg hover:opacity-90 shadow-neon-cyan hover:shadow-neon-magenta',
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-sm',
        md: 'h-10 px-4 text-sm rounded-md',
        lg: 'h-12 px-6 text-base rounded-md',
        icon: 'h-10 w-10 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
