import Link from 'next/link';

const productLinks = [
  { label: 'Tüm lisanslar', href: '/products' },
  { label: 'Yazılım', href: '/products?category=software' },
  { label: 'API paketleri', href: '/products?category=ai-api' },
];

const companyLinks = [
  { label: 'Hakkımızda', href: '/about' },
  { label: 'İletişim', href: '/contact' },
  { label: 'Kariyer', href: '/careers' },
];

const legalLinks = [
  { label: 'Kullanım Koşulları', href: '/legal/terms' },
  { label: 'Gizlilik', href: '/legal/privacy' },
  { label: 'KVKK', href: '/legal/kvkk' },
  { label: 'Çerezler', href: '/cookies' },
];

export function FooterSection() {
  return (
    <footer className="border-t border-white/[0.08] bg-brand-bg">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-accent text-sm font-bold text-white">
                CL
              </span>
              <span className="text-base font-semibold text-white">CyberLisans</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-text-secondary">
              Yazılım ve API lisanslarının doğrudan satışı. Kurumsal faturalandırma ve anında
              dijital teslimat.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Ürünler
            </h4>
            <ul className="space-y-2.5 text-sm text-brand-text-secondary">
              {productLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Şirket
            </h4>
            <ul className="space-y-2.5 text-sm text-brand-text-secondary">
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Yasal
            </h4>
            <ul className="space-y-2.5 text-sm text-brand-text-secondary">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-brand-muted">
            © {new Date().getFullYear()} CyberLisans. Tüm hakları saklıdır.
          </p>
          <p className="text-xs text-brand-muted">Türkiye · Doğrudan satış · KVKK uyumlu</p>
        </div>
      </div>
    </footer>
  );
}
