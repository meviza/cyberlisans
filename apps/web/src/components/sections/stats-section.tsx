const STATS = [
  { value: '7 gün', label: 'Escrow koruma süresi' },
  { value: '%12', label: 'Varsayılan platform komisyonu' },
  { value: '<5 sn', label: 'Ortalama otomatik teslim' },
  { value: '3 rol', label: 'Alıcı · Satıcı · Admin' },
];

export function StatsSection() {
  return (
    <section className="section-pad">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-6 text-center"
            >
              <div className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {s.value}
              </div>
              <div className="mt-2 text-xs text-brand-muted sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
