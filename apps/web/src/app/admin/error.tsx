'use client';

import * as React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@cyberlisans/ui/atoms';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('[ADMIN ERROR]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="max-w-md rounded-lg border border-cyber-magenta/30 bg-cyber-magenta/5 p-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-cyber-magenta/40 bg-cyber-magenta/10 text-cyber-magenta">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="font-orbitron text-lg font-bold text-white">Bir hata oluştu</h2>
        <p className="mt-2 text-sm text-white/60">
          Admin paneli yüklenirken beklenmeyen bir sorunla karşılaşıldı.
        </p>
        {error.digest && (
          <p className="mt-2 break-all font-mono text-xs text-white/40">
            Hata kodu: {error.digest}
          </p>
        )}
        <Button onClick={reset} variant="primary" className="mt-4">
          <RefreshCcw className="h-4 w-4" />
          Tekrar Dene
        </Button>
      </div>
    </div>
  );
}
