export default function Loading() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-6 h-24 w-24 animate-pulse rounded-full bg-brand-success/10" />
      <div className="mb-3 h-4 w-32 animate-pulse rounded-full bg-brand-accent/10" />
      <div className="mb-2 h-10 w-64 animate-pulse rounded bg-brand-accent/10" />
      <div className="h-32 w-full animate-pulse rounded-xl bg-brand-accent/5" />
    </div>
  );
}
