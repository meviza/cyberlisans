'use client';

import * as React from 'react';
import { cn } from '@cyberlisans/ui/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-cyber-cyan/30 bg-cyber-darker px-3 py-2 text-sm text-white placeholder:text-white/40 transition-all',
          'hover:border-cyber-cyan/60 focus:border-cyber-cyan focus:outline-none focus:ring-2 focus:ring-cyber-cyan/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';
