import Link from 'next/link';
import { CATEGORIES } from '@/lib/categories';

const ICONS: Record<string, React.ReactNode> = {
  gamepad: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <line x1="6" y1="11" x2="10" y2="11" />
      <line x1="8" y1="9" x2="8" y2="13" />
      <line x1="15" y1="12" x2="15.01" y2="12" />
      <line x1="18" y1="10" x2="18.01" y2="10" />
      <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258A4 4 0 0 0 17.32 5z" />
    </svg>
  ),
  package: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  sparkles: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
    >
      <path d="M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3z" />
      <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
    </svg>
  ),
};

export function CategoriesSection() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-brand-accent">Kategoriler</p>
          <h2 className="section-title mt-2">Ne arıyorsan, saniyeler içinde</h2>
          <p className="section-lead">Yazılım lisansları ve API paketleri — doğrudan satış.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/products?category=${cat.slug}`}
              className="group surface-card flex flex-col p-6 transition hover:border-brand-accent/30"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-accent/15 text-brand-accent transition group-hover:bg-brand-accent/25">
                {ICONS[cat.icon]}
              </div>
              <h3 className="text-lg font-semibold text-white">{cat.name}</h3>
              <p className="mt-1 text-sm text-brand-muted">{cat.count ?? 0} ürün</p>
              <span className="mt-6 text-sm font-medium text-brand-accent opacity-80 transition group-hover:opacity-100">
                Keşfet →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
