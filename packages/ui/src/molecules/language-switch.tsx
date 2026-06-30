'use client';

import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { cn } from '../utils/cn';

export type Language = 'TR' | 'EN' | 'DE' | 'AR' | 'RU';

export interface LanguageSwitchProps {
  value?: Language;
  onChange?: (lang: Language) => void;
  className?: string;
}

const languages: Array<{ code: Language; label: string; flag: string }> = [
  { code: 'TR', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'EN', label: 'English', flag: '🇬🇧' },
  { code: 'DE', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'AR', label: 'العربية', flag: '🇸🇦' },
  { code: 'RU', label: 'Русский', flag: '🇷🇺' },
];

function LanguageSwitch({ value = 'TR', onChange, className }: LanguageSwitchProps) {
  const [current, setCurrent] = React.useState<Language>(value);
  const active = languages.find((l) => l.code === current) ?? languages[0]!;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(
          'inline-flex items-center gap-2 rounded-md border border-cyber-cyan/30 bg-cyber-bg-elevated/80 px-3 py-1.5 text-sm text-cyber-text transition-all',
          'hover:border-cyber-cyan hover:shadow-neon-cyan focus:outline-none focus:ring-2 focus:ring-cyber-cyan/50',
          'data-[state=open]:border-cyber-cyan data-[state=open]:shadow-neon-cyan',
          className,
        )}
      >
        <Globe className="h-4 w-4 text-cyber-cyan" />
        <span>{active.flag}</span>
        <span className="font-medium">{active.code}</span>
        <ChevronDown className="h-3 w-3 text-cyber-text-dim" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="min-w-[180px] rounded-md border border-cyber-cyan/30 bg-cyber-bg-elevated/95 p-1 shadow-neon-cyan backdrop-blur-md z-50"
        >
          {languages.map((lang) => (
            <DropdownMenu.Item
              key={lang.code}
              onSelect={() => {
                setCurrent(lang.code);
                onChange?.(lang.code);
              }}
              className="flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm text-cyber-text outline-none data-[highlighted]:bg-cyber-cyan/10 data-[highlighted]:text-cyber-cyan"
            >
              <span className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </span>
              {current === lang.code && <Check className="h-3 w-3 text-cyber-cyan" />}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export { LanguageSwitch };
