'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn';

const inputVariants = cva(
  'flex w-full border bg-white/[0.03] text-brand-text placeholder:text-brand-muted transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/40 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-white/12 hover:border-white/20 focus-visible:border-brand-accent/50',
        error:
          'border-brand-danger/60 focus-visible:ring-brand-danger/40 focus-visible:border-brand-danger',
      },
      size: {
        sm: 'h-8 px-2 text-xs rounded-lg',
        md: 'h-10 px-3 text-sm rounded-lg',
        lg: 'h-12 px-4 text-base rounded-xl',
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
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted">
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
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted">
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
