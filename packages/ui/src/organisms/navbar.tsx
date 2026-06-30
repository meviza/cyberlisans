'use client';

import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Menu, X, LogOut, User, Settings, ShoppingBag } from 'lucide-react';
import { Button, Avatar, AvatarImage, AvatarFallback } from '../atoms';
import { LanguageSwitch, WalletChip, type Language } from '../molecules';
import { cn } from '../utils/cn';

export interface NavLink {
  label: string;
  href: string;
}

export interface NavbarProps {
  logo?: React.ReactNode;
  links?: NavLink[];
  user?: { name: string; avatar?: string } | null;
  wallet?: { balance: number; currency: 'TRY' | 'USD' | 'EUR' };
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
  onLogout?: () => void;
  className?: string;
}

const defaultLinks: NavLink[] = [
  { label: 'Ana Sayfa', href: '/' },
  { label: 'Ürünler', href: '/products' },
  { label: 'Hakkımızda', href: '/about' },
  { label: 'İletişim', href: '/contact' },
];

function Navbar({
  logo,
  links = defaultLinks,
  user,
  wallet,
  language = 'TR',
  onLanguageChange,
  onLogout,
  className,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b border-cyber-cyan/20 bg-cyber-bg/80 backdrop-blur-md',
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <a href="/" className="font-orbitron text-xl font-black text-cyber-cyan text-glow-cyan">
            {logo ?? 'CYBERLISANS'}
          </a>
          <nav className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-cyber-text-dim transition-colors hover:text-cyber-cyan"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <LanguageSwitch value={language} onChange={onLanguageChange} />
          {wallet && <WalletChip balance={wallet.balance} currency={wallet.currency} />}
          {user ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-cyber-cyan/50">
                  <Avatar>
                    {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                    <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="min-w-[200px] rounded-md border border-cyber-cyan/30 bg-cyber-bg-elevated/95 p-1 shadow-neon-cyan backdrop-blur-md z-50"
                >
                  <div className="px-2 py-1.5 text-xs text-cyber-text-dim border-b border-cyber-cyan/20 mb-1">
                    {user.name}
                  </div>
                  <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-cyber-text outline-none data-[highlighted]:bg-cyber-cyan/10 data-[highlighted]:text-cyber-cyan">
                    <User className="h-4 w-4" /> Profil
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-cyber-text outline-none data-[highlighted]:bg-cyber-cyan/10 data-[highlighted]:text-cyber-cyan">
                    <ShoppingBag className="h-4 w-4" /> Siparişlerim
                  </DropdownMenu.Item>
                  <DropdownMenu.Item className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-cyber-text outline-none data-[highlighted]:bg-cyber-cyan/10 data-[highlighted]:text-cyber-cyan">
                    <Settings className="h-4 w-4" /> Ayarlar
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="my-1 h-px bg-cyber-cyan/20" />
                  <DropdownMenu.Item
                    onSelect={onLogout}
                    className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-cyber-pink outline-none data-[highlighted]:bg-cyber-pink/10"
                  >
                    <LogOut className="h-4 w-4" /> Çıkış Yap
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <>
              <Button size="sm" variant="ghost">
                Giriş Yap
              </Button>
              <Button size="sm" variant="primary">
                Kayıt Ol
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden text-cyber-text"
          onClick={() => setMobileOpen((s) => !s)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-cyber-cyan/20 bg-cyber-bg-elevated/95 px-4 py-4">
          <nav className="flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-cyber-text-dim hover:text-cyber-cyan"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <LanguageSwitch value={language} onChange={onLanguageChange} />
            {wallet && <WalletChip balance={wallet.balance} currency={wallet.currency} />}
          </div>
        </div>
      )}
    </header>
  );
}

export { Navbar };
