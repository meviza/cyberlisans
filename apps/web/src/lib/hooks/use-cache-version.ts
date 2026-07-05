'use client';

import * as React from 'react';

const listeners = new Set<() => void>();

export function useCacheVersion(): number {
  const [v, setV] = React.useState(0);
  React.useEffect(() => {
    const l = () => setV((x) => x + 1);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return v;
}

export function invalidateProductsCache() {
  listeners.forEach((l) => l());
}
