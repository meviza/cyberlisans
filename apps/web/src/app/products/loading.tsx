export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded bg-cyber-cyan/10" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl border border-cyber-cyan/10 bg-cyber-darker/40"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
