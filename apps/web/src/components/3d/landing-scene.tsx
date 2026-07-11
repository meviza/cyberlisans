'use client';

import * as React from 'react';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

/**
 * Premium soft 3D hero — lazy loaded, disabled on mobile / reduced motion.
 * Avoids heavy neon cyberpunk aesthetics; subtle geometry + depth only.
 */

function useShouldRender3D() {
  const [ok, setOk] = React.useState(false);

  React.useEffect(() => {
    const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mqMobile = window.matchMedia('(max-width: 1023px)');
    const update = () => setOk(!mqReduce.matches && !mqMobile.matches);
    update();
    mqReduce.addEventListener('change', update);
    mqMobile.addEventListener('change', update);
    return () => {
      mqReduce.removeEventListener('change', update);
      mqMobile.removeEventListener('change', update);
    };
  }, []);

  return ok;
}

function StaticPoster() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div
        className="absolute h-[120%] w-[120%] opacity-80"
        style={{
          background:
            'radial-gradient(circle at 40% 40%, rgba(0,87,255,0.35), transparent 45%), radial-gradient(circle at 70% 60%, rgba(107,124,255,0.2), transparent 40%), linear-gradient(160deg, #0B1220, #00001e)',
        }}
      />
      <div className="relative z-10 mx-auto max-w-xs text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-accent/20 ring-1 ring-brand-accent/40">
          <div className="h-8 w-8 rounded-lg bg-brand-accent shadow-accent-glow" />
        </div>
        <p className="text-sm font-medium text-white">Escrow korumalı marketplace</p>
        <p className="mt-1 text-xs text-brand-muted">Alıcı · Satıcı · Platform</p>
      </div>
    </div>
  );
}

const CanvasScene = dynamic(() => import('./landing-canvas'), {
  ssr: false,
  loading: () => <StaticPoster />,
});

export function LandingScene() {
  const should3d = useShouldRender3D();

  if (!should3d) {
    return (
      <div className="absolute inset-0 h-full w-full">
        <StaticPoster />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 h-full w-full">
      <Suspense fallback={<StaticPoster />}>
        <CanvasScene />
      </Suspense>
    </div>
  );
}
