'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@cyberlisans/ui/cn';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
}

/**
 * Accessible checkbox with a visible custom tick.
 * Uses React `checked` state for the icon (peer-checked on nested SVG never works).
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, checked, defaultChecked, onChange, disabled, ...props }, ref) => {
    const id = React.useId();
    const isControlled = checked !== undefined;
    const [uncontrolled, setUncontrolled] = React.useState(Boolean(defaultChecked));
    const isChecked = isControlled ? Boolean(checked) : uncontrolled;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setUncontrolled(e.target.checked);
      onChange?.(e);
    };

    return (
      <div className="flex items-start gap-3">
        <div className="relative mt-0.5 h-5 w-5 shrink-0">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            checked={isControlled ? checked : undefined}
            defaultChecked={!isControlled ? defaultChecked : undefined}
            onChange={handleChange}
            disabled={disabled}
            {...props}
          />
          <div
            aria-hidden
            className={cn(
              'pointer-events-none flex h-5 w-5 items-center justify-center rounded border-2 transition-all',
              isChecked
                ? 'border-brand-accent bg-brand-accent/25 shadow-[0_0_0_1px_rgba(0,240,255,0.15)]'
                : 'border-white/35 bg-white/5',
              disabled && 'opacity-50',
              className,
            )}
          >
            <Check
              className={cn(
                'h-3.5 w-3.5 text-brand-accent transition-opacity duration-150',
                isChecked ? 'opacity-100' : 'opacity-0',
              )}
              strokeWidth={3}
            />
          </div>
        </div>
        {label && (
          <label
            htmlFor={id}
            className="cursor-pointer select-none text-sm leading-5 text-white/80"
          >
            {label}
          </label>
        )}
      </div>
    );
  },
);
Checkbox.displayName = 'Checkbox';
