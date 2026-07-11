export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-2xl bg-brand-accent/5" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded bg-brand-accent/10" />
          <div className="h-12 w-1/3 animate-pulse rounded bg-brand-accent/10" />
          <div className="h-32 animate-pulse rounded bg-brand-accent/5" />
          <div className="h-12 animate-pulse rounded bg-brand-accent/10" />
        </div>
      </div>
    </div>
  );
}
