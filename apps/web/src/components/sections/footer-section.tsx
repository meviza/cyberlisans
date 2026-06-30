import Link from 'next/link';

const productLinks = [
  { label: 'Oyun', href: '/category/oyun' },
  { label: 'Yazılım', href: '/category/yazilim' },
  { label: 'AI API', href: '/category/ai-api' },
  { label: 'Hediye Kartları', href: '/category/hediye' },
];

const companyLinks = [
  { label: 'Hakkımızda', href: '/about' },
  { label: 'Blog', href: '/blog' },
  { label: 'Kariyer', href: '/careers' },
  { label: 'İletişim', href: '/contact' },
];

const legalLinks = [
  { label: 'Kullanım Koşulları', href: '/terms' },
  { label: 'Gizlilik Politikası', href: '/privacy' },
  { label: 'KVKK', href: '/kvkk' },
  { label: 'Çerez Politikası', href: '/cookies' },
];

function SocialIcon({ kind }: { kind: 'twitter' | 'discord' | 'instagram' | 'github' }) {
  const paths: Record<typeof kind, React.ReactNode> = {
    twitter: (
      <path d="M22 4.01s-2 1-3 1.5c-.5-1-1.5-1.5-3-1.5-2.5 0-4 2-4 4v1C7 9 4 7 2 4c0 0-3 6 5 9-2 1-4 1-6 1 6 4 14 4 18-1 3-3 3-7 3-9 1-1 2-2 2-3z" />
    ),
    discord: (
      <path d="M19 5a17 17 0 0 0-4-1l-.5 1a13 13 0 0 0-5 0L9 4a17 17 0 0 0-4 1C2 9 1 13 2 17a17 17 0 0 0 5 2l1-1.5a10 10 0 0 1-2-1l.5-.5C9 17 11 17.5 12 17.5s3-.5 5.5-1.5l.5.5a10 10 0 0 1-2 1l1 1.5a17 17 0 0 0 5-2c1-4 0-8-3-12zM9 14c-1 0-2-1-2-2.5S8 9 9 9s2 1 2 2.5S10 14 9 14zm6 0c-1 0-2-1-2-2.5S14 9 15 9s2 1 2 2.5S16 14 15 14z" />
    ),
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="4" ry="4" fill="none" />
        <circle cx="12" cy="12" r="4" fill="none" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </>
    ),
    github: (
      <path d="M12 2a10 10 0 0 0-3.16 19.5c.5.1.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.04 1.53 1.04.9 1.52 2.34 1.08 2.91.83.1-.65.35-1.08.63-1.33-2.22-.25-4.55-1.1-4.55-4.95 0-1.1.4-2 1.04-2.7-.1-.25-.45-1.28.1-2.66 0 0 .84-.27 2.75 1.03A9.6 9.6 0 0 1 12 6.8a9.6 9.6 0 0 1 2.5.34c1.9-1.3 2.74-1.03 2.74-1.03.55 1.38.2 2.41.1 2.66.65.7 1.04 1.6 1.04 2.7 0 3.86-2.34 4.7-4.57 4.95.36.3.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z" />
    ),
  };
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      {paths[kind]}
    </svg>
  );
}

export function FooterSection() {
  return (
    <footer className="border-t border-white/10 bg-cyber-darker">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="font-display text-xl font-black text-cyber-cyan text-glow-cyan">
              CYBERLISANS
            </Link>
            <p className="mt-3 max-w-xs text-sm text-white/60">
              Dijital lisansların yeni adresi. Hızlı, güvenli, global.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {(['twitter', 'discord', 'instagram', 'github'] as const).map((s) => (
                <Link
                  key={s}
                  href={`https://${s}.com/cyberlisans`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/70 transition-all hover:border-cyber-cyan/60 hover:bg-cyber-cyan/10 hover:text-cyber-cyan"
                  aria-label={s}
                >
                  <SocialIcon kind={s} />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-cyber-cyan">Ürünler</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-cyber-cyan">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-cyber-cyan">Şirket</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-cyber-cyan">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-cyber-cyan">Yasal</h4>
            <ul className="space-y-2 text-sm text-white/70">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors hover:text-cyber-cyan">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p className="font-mono text-xs text-white/50">© 2026 CyberLisans. Tüm hakları saklıdır.</p>
          <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-white/40">
            <span className="rounded border border-white/10 bg-white/5 px-2 py-1">PayTR</span>
            <span className="rounded border border-white/10 bg-white/5 px-2 py-1">Papara</span>
            <span className="rounded border border-white/10 bg-white/5 px-2 py-1">Visa</span>
            <span className="rounded border border-white/10 bg-white/5 px-2 py-1">Mastercard</span>
            <span className="rounded border border-white/10 bg-white/5 px-2 py-1">USDT</span>
          </div>
        </div>
      </div>
    </footer>
  );
}