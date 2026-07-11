import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-bg px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,87,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(0,87,255,0.15) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
        }}
      />

      <div className="relative text-center">
        <div className="mb-2 font-display text-[8rem] font-black leading-none text-brand-accent sm:text-[10rem]">
          404
        </div>
        <h1 className="mb-3 font-display text-2xl font-bold text-white sm:text-3xl">
          Sayfa bulunamadı
        </h1>
        <p className="mb-8 text-white/60">Aradığın sayfa bu evrende mevcut değil.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-accent px-6 py-3 font-display text-sm font-bold uppercase tracking-wider text-brand-bg shadow-accent-glow transition-all hover:brightness-110"
        >
          Ana Sayfaya Dön →
        </Link>
      </div>
    </div>
  );
}
