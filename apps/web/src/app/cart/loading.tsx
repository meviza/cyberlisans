export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <div className="h-10 w-48 animate-pulse rounded bg-cyber-cyan/10" />
        <div className="h-24 animate-pulse rounded-xl bg-cyber-cyan/5" />
        <div className="h-24 animate-pulse rounded-xl bg-cyber-cyan/5" />
      </div>
    </div>
  );
}
