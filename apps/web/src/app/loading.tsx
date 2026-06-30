export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-darker">
      <div className="flex flex-col items-center gap-4">
        <div className="font-display text-3xl font-black text-cyber-cyan text-glow-cyan animate-pulse">CYBERLISANS</div>
        <div className="h-1 w-48 overflow-hidden rounded-full bg-cyber-cyan/20">
          <div className="h-full w-1/2 animate-scanline-bar bg-gradient-to-r from-cyber-cyan to-cyber-magenta" />
        </div>
      </div>
    </div>
  );
}