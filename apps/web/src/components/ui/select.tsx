'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@cyberlisans/ui/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            'flex h-10 w-full appearance-none rounded-md border border-cyber-cyan/30 bg-cyber-darker px-3 pr-9 text-sm text-white transition-all',
            'hover:border-cyber-cyan/60 focus:border-cyber-cyan focus:outline-none focus:ring-2 focus:ring-cyber-cyan/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-cyber-darker text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cyber-cyan/60" />
      </div>
    );
  }
);
Select.displayName = 'Select';
