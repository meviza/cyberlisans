import * as React from 'react';
import Link from 'next/link';
import { AlertCircle, Clock, XCircle } from 'lucide-react';
import type { DealerStatus } from '@/lib/dealer-types';

export function DealerStatusBanner({
  status,
  rejectionReason,
}: {
  status: DealerStatus;
  rejectionReason?: string | null;
}) {
  if (status === 'APPROVED' || status === 'SUSPENDED') return null;

  if (status === 'PENDING') {
    return (
      <div className="border-b border-cyber-magenta/40 bg-cyber-magenta/5">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Clock className="h-5 w-5 shrink-0 text-cyber-magenta" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Bayi Başvurunuz Onay Bekliyor</p>
            <p className="text-xs text-white/70">
              Başvurunuz inceleniyor. Bu süreçte yalnızca profil sayfanıza erişebilirsiniz. Onay
              sonrası tüm özellikler aktif olacak.
            </p>
          </div>
          <Link
            href="/dealer/profile"
            className="shrink-0 rounded border border-cyber-magenta/40 bg-cyber-magenta/10 px-3 py-1.5 text-xs font-medium text-cyber-magenta hover:bg-cyber-magenta/20"
          >
            Profil
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'REJECTED') {
    return (
      <div className="border-b border-cyber-pink/40 bg-cyber-pink/5">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <XCircle className="h-5 w-5 shrink-0 text-cyber-pink" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">Bayi Başvurunuz Reddedildi</p>
            {rejectionReason ? (
              <p className="text-xs text-white/70">
                <span className="text-white/50">Sebep:</span> {rejectionReason}
              </p>
            ) : (
              <p className="text-xs text-white/70">
                Başvurunuz reddedildi. Daha fazla bilgi için destek ekibiyle iletişime geçin.
              </p>
            )}
          </div>
          <Link
            href="/dealer/profile"
            className="shrink-0 rounded border border-cyber-pink/40 bg-cyber-pink/10 px-3 py-1.5 text-xs font-medium text-cyber-pink hover:bg-cyber-pink/20"
          >
            Profil
          </Link>
        </div>
      </div>
    );
  }

  return null;
}

export function DealerAccessGuard({
  status,
  children,
}: {
  status: DealerStatus;
  children: React.ReactNode;
}) {
  if (status === 'PENDING' || status === 'REJECTED') {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-md border border-cyber-magenta/30 bg-cyber-magenta/5 p-8 text-center">
        <AlertCircle className="mb-3 h-10 w-10 text-cyber-magenta" />
        <h2 className="mb-2 font-orbitron text-xl font-bold text-white">Erişim Beklemede</h2>
        <p className="max-w-md text-sm text-white/70">
          {status === 'PENDING'
            ? 'Bayi başvurunuz henüz onaylanmadı. Bu bölüme başvuru onaylandıktan sonra erişebilirsiniz.'
            : 'Bayi başvurunuz reddedildi. Bu bölüme erişiminiz bulunmamaktadır.'}
        </p>
        <Link
          href="/dealer/profile"
          className="mt-4 rounded border border-cyber-cyan/40 bg-cyber-cyan/10 px-4 py-2 text-sm text-cyber-cyan hover:bg-cyber-cyan/20"
        >
          Profile Git
        </Link>
        {children}
      </div>
    );
  }
  return <>{children}</>;
}
