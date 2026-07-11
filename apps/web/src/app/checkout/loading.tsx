export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          <div className="h-10 w-48 animate-pulse rounded bg-brand-accent/10" />
          <div className="h-32 animate-pulse rounded-xl bg-brand-accent/5" />
          <div className="h-48 animate-pulse rounded-xl bg-brand-accent/5" />
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-brand-accent/5" />
      </div>
    </div>
  );
}
