export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-brand-bg">
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="absolute inset-0 bg-hero-glow opacity-80" />
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
        {children}
      </div>
    </div>
  );
}
