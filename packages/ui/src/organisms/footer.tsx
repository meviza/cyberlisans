'use client';

import * as React from 'react';
import { Github, Twitter, Instagram, Send } from 'lucide-react';
import { Separator } from '../atoms';
import { cn } from '../utils/cn';

export interface FooterColumn {
  title: string;
  links: Array<{ label: string; href: string }>;
}

export interface FooterProps {
  columns?: FooterColumn[];
  copyright?: string;
  socials?: Array<{ icon: 'github' | 'twitter' | 'instagram' | 'telegram'; href: string }>;
  className?: string;
}

const socialIcons = {
  github: Github,
  twitter: Twitter,
  instagram: Instagram,
  telegram: Send,
};

const defaultColumns: FooterColumn[] = [
  {
    title: 'Ürün',
    links: [
      { label: 'Tüm Ürünler', href: '/products' },
      { label: 'Popüler', href: '/products?sort=popular' },
      { label: 'Yeni Eklenenler', href: '/products?sort=new' },
      { label: 'Kampanyalar', href: '/campaigns' },
    ],
  },
  {
    title: 'Şirket',
    links: [
      { label: 'Hakkımızda', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Kariyer', href: '/careers' },
      { label: 'İletişim', href: '/contact' },
    ],
  },
  {
    title: 'Yasal',
    links: [
      { label: 'Gizlilik Politikası', href: '/privacy' },
      { label: 'Kullanım Şartları', href: '/terms' },
      { label: 'KVKK', href: '/kvkk' },
      { label: 'Çerez Politikası', href: '/cookies' },
    ],
  },
];

const defaultSocials: FooterProps['socials'] = [
  { icon: 'twitter', href: 'https://twitter.com' },
  { icon: 'instagram', href: 'https://instagram.com' },
  { icon: 'github', href: 'https://github.com' },
  { icon: 'telegram', href: 'https://t.me' },
];

function Footer({
  columns = defaultColumns,
  copyright = `© ${new Date().getFullYear()} CYBERLISANS. Tüm hakları saklıdır.`,
  socials = defaultSocials,
  className,
}: FooterProps) {
  return (
    <footer className={cn('relative border-t border-cyber-cyan/20 bg-cyber-bg', className)}>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyber-cyan to-transparent shadow-neon-cyan" />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="font-orbitron text-2xl font-black text-cyber-cyan text-glow-cyan">
              CYBERLISANS
            </div>
            <p className="mt-3 text-sm text-cyber-text-dim max-w-xs">
              Dijital lisanslar için geleceğin pazar yeri. Güvenli, hızlı, sınırsız.
            </p>
            {socials && (
              <div className="mt-4 flex gap-3">
                {socials.map((s, i) => {
                  const Icon = socialIcons[s.icon];
                  return (
                    <a
                      key={i}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-cyber-cyan/30 text-cyber-cyan transition-all hover:border-cyber-cyan hover:shadow-neon-cyan"
                      aria-label={s.icon}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-orbitron text-sm font-bold uppercase tracking-wider text-cyber-text">
                {col.title}
              </h4>
              <ul className="mt-3 space-y-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      className="text-sm text-cyber-text-dim transition-colors hover:text-cyber-cyan"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col items-center justify-between gap-3 text-xs text-cyber-text-dim sm:flex-row">
          <p>{copyright}</p>
          <p className="font-orbitron">v1.0.0</p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
