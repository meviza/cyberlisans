'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@cyberlisans/ui/cn';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    const id = React.useId();
    return (
      <div className="flex items-start gap-3">
        <div className="relative mt-0.5">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={id}
            className={cn(
              'flex h-5 w-5 cursor-pointer items-center justify-center rounded border-2 border-cyber-cyan/40 bg-cyber-darker transition-all',
              'peer-checked:border-cyber-cyan peer-checked:bg-cyber-cyan/20',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-cyber-cyan/50 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-cyber-darker',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
              className
            )}
          >
            <Check className="h-3.5 w-3.5 text-cyber-cyan opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={3} />
          </label>
        </div>
        {label && (
          <label htmlFor={id} className="cursor-pointer text-sm text-white/80">
            {label}
          </label>
        )}
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';
