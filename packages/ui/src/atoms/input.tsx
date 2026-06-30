'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const inputVariants = cva(
  'flex w-full bg-cyber-bg/50 border text-cyber-text placeholder:text-cyber-text-dim transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyber-cyan/50 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-cyber-cyan/30 hover:border-cyber-cyan/60 focus-visible:border-cyber-cyan',
        error: 'border-cyber-pink focus-visible:ring-cyber-pink/50 focus-visible:border-cyber-pink',
      },
      size: {
        sm: 'h-8 px-2 text-xs rounded-sm',
        md: 'h-10 px-3 text-sm rounded-md',
        lg: 'h-12 px-4 text-base rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, leftIcon, rightIcon, type = 'text', ...props }, ref) => {
    if (leftIcon || rightIcon) {
      return (
        <div className="relative w-full">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-text-dim pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ variant, size }),
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              className,
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-text-dim pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
      );
    }
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input, inputVariants };
