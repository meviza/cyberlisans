'use client';

import * as React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqProps {
  items: FaqItem[];
  className?: string;
}

function Faq({ items, className }: FaqProps) {
  return (
    <Accordion.Root type="single" collapsible className={cn('space-y-2', className)}>
      {items.map((item) => (
        <Accordion.Item
          key={item.id}
          value={item.id}
          className="group overflow-hidden rounded-md border border-cyber-cyan/20 bg-cyber-bg-elevated/60 backdrop-blur-sm transition-all data-[state=open]:border-cyber-cyan data-[state=open]:shadow-neon-cyan"
        >
          <Accordion.Header className="flex">
            <Accordion.Trigger
              className={cn(
                'flex flex-1 items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-cyber-text transition-colors hover:text-cyber-cyan',
                'focus:outline-none focus-visible:text-cyber-cyan',
              )}
            >
              <span className="font-orbitron">{item.question}</span>
              <ChevronDown className="h-4 w-4 text-cyber-cyan transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content
            className={cn(
              'overflow-hidden text-sm text-cyber-text-dim',
              'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
            )}
          >
            <div className="px-4 pb-4 leading-relaxed">{item.answer}</div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

export { Faq };
