'use client';

import * as React from 'react';
import { Spinner } from '@cyberlisans/ui/atoms';
import { AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { SettingsForm, type AppSettings } from '@/components/admin/settings-form';
import { apiFetch, ApiError } from '@/lib/api-client';

export default function AdminSettingsPage() {
  const [data, setData] = React.useState<AppSettings | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch<AppSettings>('/api/admin/settings');
        if (!cancelled) setData(res);
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError) setError(e.message);
        else setError('Ayarlar yüklenemedi');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!data && !error) {
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-md border border-cyber-magenta/30 bg-cyber-magenta/5 p-6 text-cyber-magenta">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ayarlar"
        description="Genel, ödeme, kur ve KVKK ayarları"
        crumbs={[{ href: '/admin/settings', label: 'Ayarlar' }]}
      />
      <SettingsForm initial={data as AppSettings} />
    </div>
  );
}
