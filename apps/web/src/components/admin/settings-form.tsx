'use client';

import * as React from 'react';
import { Loader2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button, Card, CardContent, Input, Label, Separator } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError } from '@/lib/api-client';
import { cn } from '@cyberlisans/ui/cn';

export interface AppSettings {
  general: {
    siteName: string;
    supportEmail: string;
    contactPhone: string;
  };
  payments: {
    activeProviders: string[];
    testMode: boolean;
    webhookUrls: Record<string, string>;
    commissionByCategory: Record<string, number>;
  };
  currency: {
    manualRates: Record<string, number>;
    updatedAt: string | null;
  };
  kvkk: {
    documentVersion: string;
  };
  mailTemplates: {
    enabled: boolean;
  };
}

const ALL_PROVIDERS = [
  'PAYTR',
  'PAPARA',
  'STRIPE',
  'NOWPAYMENTS',
  'BANK_TRANSFER',
  'WALLET',
] as const;
const ALL_CURRENCIES = ['TRY', 'USD', 'EUR', 'USDT'] as const;

export function SettingsForm({ initial }: { initial: AppSettings }) {
  const [settings, setSettings] = React.useState<AppSettings>(initial);
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(null), 4000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [msg]);

  const updateGeneral = (k: keyof AppSettings['general'], v: string) =>
    setSettings((s) => ({ ...s, general: { ...s.general, [k]: v } }));

  const toggleProvider = (p: string) =>
    setSettings((s) => {
      const set = new Set(s.payments.activeProviders);
      if (set.has(p)) set.delete(p);
      else set.add(p);
      return { ...s, payments: { ...s.payments, activeProviders: Array.from(set) } };
    });

  const updateRate = (code: string, v: string) =>
    setSettings((s) => {
      const n = Number(v);
      const next = { ...s.currency.manualRates };
      if (!Number.isFinite(n) || n <= 0) delete next[code];
      else next[code] = n;
      return { ...s, currency: { ...s.currency, manualRates: next } };
    });

  const updateCommission = (key: string, v: string) =>
    setSettings((s) => {
      const n = Number(v);
      const next = { ...s.payments.commissionByCategory };
      if (!Number.isFinite(n) || n < 0) delete next[key];
      else next[key] = n;
      return { ...s, payments: { ...s.payments, commissionByCategory: next } };
    });

  const submit = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const body = {
        general: settings.general,
        payments: {
          activeProviders: settings.payments.activeProviders,
          testMode: settings.payments.testMode,
          commissionByCategory: settings.payments.commissionByCategory,
        },
        currency: { manualRates: settings.currency.manualRates },
        kvkk: { documentVersion: settings.kvkk.documentVersion },
      };
      const next = await apiFetch<AppSettings>('/api/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      setSettings(next);
      setMsg({ kind: 'success', text: 'Ayarlar kaydedildi' });
    } catch (err) {
      if (err instanceof ApiError) setMsg({ kind: 'error', text: err.message });
      else setMsg({ kind: 'error', text: 'Kaydedilemedi' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {msg ? (
        <div
          className={cn(
            'flex items-center gap-2 rounded-md border p-3 text-sm',
            msg.kind === 'success'
              ? 'border-cyber-lime/30 bg-cyber-lime/5 text-cyber-lime'
              : 'border-cyber-magenta/30 bg-cyber-magenta/5 text-cyber-magenta',
          )}
        >
          {msg.kind === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {msg.text}
        </div>
      ) : null}

      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">
            Genel
          </h2>
          <Separator />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Site Adı">
              <Input
                value={settings.general.siteName}
                onChange={(e) => updateGeneral('siteName', e.target.value)}
              />
            </Field>
            <Field label="Destek E-posta">
              <Input
                type="email"
                value={settings.general.supportEmail}
                onChange={(e) => updateGeneral('supportEmail', e.target.value)}
              />
            </Field>
            <Field label="İletişim Telefonu">
              <Input
                value={settings.general.contactPhone}
                onChange={(e) => updateGeneral('contactPhone', e.target.value)}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">
            Ödeme Sağlayıcıları
          </h2>
          <Separator />
          <label className="flex items-center gap-2 text-xs text-white/70">
            <input
              type="checkbox"
              checked={settings.payments.testMode}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  payments: { ...s.payments, testMode: e.target.checked },
                }))
              }
              className="h-4 w-4 rounded border-cyber-cyan/40 bg-cyber-darker accent-cyber-cyan"
            />
            Test Modu Aktif
          </label>
          <div>
            <p className="mb-2 text-xs text-white/50">Aktif sağlayıcılar</p>
            <div className="flex flex-wrap gap-2">
              {ALL_PROVIDERS.map((p) => {
                const active = settings.payments.activeProviders.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggleProvider(p)}
                    className={cn(
                      'rounded-md border px-3 py-1.5 text-xs transition-colors',
                      active
                        ? 'border-cyber-cyan/40 bg-cyber-cyan/10 text-cyber-cyan'
                        : 'border-cyber-cyan/20 text-white/50 hover:border-cyber-cyan/40',
                    )}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-white/50">Webhook URL&apos;leri</p>
            <ul className="space-y-1 rounded border border-cyber-cyan/10 bg-cyber-darker/40 p-3 text-xs">
              {Object.entries(settings.payments.webhookUrls).map(([provider, url]) => (
                <li key={provider} className="flex items-center justify-between gap-3">
                  <span className="text-white/60">{provider}</span>
                  <span className="truncate font-mono text-cyber-cyan">{url || '—'}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-2 text-xs text-white/50">Kategori Bazlı Komisyon (%)</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Antivirus">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={settings.payments.commissionByCategory['antivirus'] ?? ''}
                  onChange={(e) => updateCommission('antivirus', e.target.value)}
                  placeholder="örn: 5"
                />
              </Field>
              <Field label="Oyun">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={settings.payments.commissionByCategory['game'] ?? ''}
                  onChange={(e) => updateCommission('game', e.target.value)}
                  placeholder="örn: 8"
                />
              </Field>
              <Field label="Office">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={settings.payments.commissionByCategory['office'] ?? ''}
                  onChange={(e) => updateCommission('office', e.target.value)}
                  placeholder="örn: 3"
                />
              </Field>
              <Field label="VPN">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={settings.payments.commissionByCategory['vpn'] ?? ''}
                  onChange={(e) => updateCommission('vpn', e.target.value)}
                  placeholder="örn: 6"
                />
              </Field>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">
            Manuel Döviz Kurları
          </h2>
          <Separator />
          <p className="text-xs text-white/50">
            1 {settings.currency.manualRates['TRY'] ? 'TRY' : ''} karşılığı değerler. Base: TRY ={' '}
            {settings.currency.manualRates['TRY'] ?? 1}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ALL_CURRENCIES.map((c) => (
              <Field key={c} label={`1 TRY = ${c}`}>
                <Input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={settings.currency.manualRates[c] ?? ''}
                  onChange={(e) => updateRate(c, e.target.value)}
                  placeholder="örn: 0.03"
                />
              </Field>
            ))}
          </div>
          <p className="text-[10px] text-white/40">
            Son güncelleme:{' '}
            {settings.currency.updatedAt
              ? new Date(settings.currency.updatedAt).toLocaleString('tr-TR')
              : '—'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">
            KVKK / GDPR
          </h2>
          <Separator />
          <Field label="Aydınlatma Metni Versiyonu">
            <Input
              value={settings.kvkk.documentVersion}
              onChange={(e) =>
                setSettings((s) => ({ ...s, kvkk: { ...s.kvkk, documentVersion: e.target.value } }))
              }
              placeholder="örn: 1.0.0"
            />
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="button" variant="primary" disabled={busy} onClick={submit} className="gap-2">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Değişiklikleri Kaydet
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
