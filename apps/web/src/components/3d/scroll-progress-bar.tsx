'use client';

import * as React from 'react';

export function ScrollProgressBar() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
      setProgress(scrolled * 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 z-50 h-0.5 w-full bg-brand-accent/10">
      <div
        className="h-full bg-gradient-to-r from-cyber-cyan via-cyber-magenta to-cyber-cyan transition-[width] duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
