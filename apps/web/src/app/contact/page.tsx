import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MessageSquare, Building2, ArrowRight } from 'lucide-react';
import { StorefrontHeader } from '@/components/store/storefront-header';

export const metadata: Metadata = {
  title: 'Iletisim',
  description:
    'CyberLisans ekibiyle iletisime gec. Destek, is ortakligi veya toplu lisans talepleri icin bize ulas.',
  alternates: { canonical: 'https://cyberlisans.com/contact' },
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function toSingle(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? '';
  return v ?? '';
}

const SUBJECTS = [
  { value: 'support', label: 'Destek talebi' },
  { value: 'business', label: 'Is ortakligi' },
  { value: 'bulk', label: 'Toplu lisans' },
  { value: 'other', label: 'Diger' },
];

export default async function ContactPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const plan = toSingle(sp['plan']);

  return (
    <>
      <StorefrontHeader />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <p className="mb-2 font-mono text-xs uppercase tracking-widest text-brand-accent">
            Iletisim
          </p>
          <h1 className="mb-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Bize <span className="text-brand-accent ">Ulas</span>
          </h1>
          <p className="mx-auto max-w-xl text-brand-text-secondary">
            Destek, is ortakligi veya toplu lisans talepleri icin asagidaki kanallardan birini
            kullanabilirsin. Genelde 24 saat icinde donus yapiyoruz.
          </p>
        </header>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <section className="rounded-xl border border-brand-accent/20 bg-brand-bg/40 p-6">
            <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-bold text-white">
              <MessageSquare className="h-5 w-5 text-brand-accent" />
              Mesaj Gonder
            </h2>

            <form action="https://formspree.io/f/REPLACE_ME" method="POST" className="space-y-4">
              <input type="hidden" name="plan" value={plan} />
              <div>
                <label htmlFor="name" className="mb-1 block text-sm text-white/70">
                  Ad Soyad
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1 block text-sm text-white/70">
                  E-posta
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
                />
              </div>
              <div>
                <label htmlFor="subject" className="mb-1 block text-sm text-white/70">
                  Konu
                </label>
                <select
                  id="subject"
                  name="subject"
                  defaultValue={plan === 'business' ? 'business' : 'support'}
                  className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="message" className="mb-1 block text-sm text-white/70">
                  Mesaj
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="w-full resize-none rounded-md border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-brand-accent"
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-accent px-4 py-2.5 font-display text-sm font-bold uppercase tracking-wider text-brand-bg shadow-accent-glow transition-all hover:brightness-110"
              >
                Gonder
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-xs text-white/40">
                Form Formspree uzerinden iletilir. Alternatif olarak asagidaki kanallari
                kullanabilirsin.
              </p>
            </form>
          </section>

          <aside className="space-y-6">
            <div className="rounded-xl border border-white/20 bg-brand-bg/40 p-6">
              <h2 className="mb-5 flex items-center gap-2 font-display text-lg font-bold text-white">
                <Building2 className="h-5 w-5 text-brand-text-secondary" />
                Diger Kanallar
              </h2>
              <ul className="space-y-3 text-sm text-white/70">
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                  <div>
                    <p className="text-white">E-posta</p>
                    <a
                      href="mailto:destek@cyberlisans.com"
                      className="text-brand-accent hover:underline"
                    >
                      destek@cyberlisans.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                  <div>
                    <p className="text-white">Canli Destek</p>
                    <p className="text-white/50">
                      7/24 - sitede bulunan chat widget&apos;i uzerinden
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-accent" />
                  <div>
                    <p className="text-white">Is Ortakligi</p>
                    <a
                      href="mailto:partner@cyberlisans.com"
                      className="text-brand-accent hover:underline"
                    >
                      partner@cyberlisans.com
                    </a>
                  </div>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-brand-accent/20 bg-brand-bg/40 p-6 text-sm text-brand-text-secondary">
              <h3 className="mb-2 font-display text-base font-bold text-white">SSS</h3>
              <p className="mb-3">
                Sikca sorulan sorularin yanitlarina SSS sayfasindan daha hizli ulasabilirsin.
              </p>
              <Link
                href="/legal/sss"
                className="inline-flex items-center gap-1 text-brand-accent hover:underline"
              >
                SSS&apos;ye git
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
