'use client';

import * as React from 'react';
import { Wallet as WalletIcon, Plus, ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';
import { Card, CardContent, Button, Input, Label, Badge } from '@cyberlisans/ui/atoms';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/dashboard/empty-state';
import { useAuth } from '@/lib/auth-context';
import { apiFetch } from '@/lib/api-client';

interface Transaction {
  id: string;
  createdAt: string;
  type:
    | 'DEPOSIT'
    | 'WITHDRAWAL'
    | 'PURCHASE'
    | 'REFUND'
    | 'ADMIN_CREDIT'
    | 'ADMIN_DEBIT'
    | 'REFERRAL_REWARD'
    | 'LOYALTY_REWARD'
    | 'GIFT_RECEIVED'
    | 'GIFT_SENT';
  amount: number;
  currency: 'TRY' | 'USD' | 'EUR' | 'USDT';
  balanceAfter: number;
  description?: string | null;
}

const TX_TYPE_MAP: Record<
  Transaction['type'],
  { label: string; variant: 'success' | 'warning' | 'danger' | 'default' }
> = {
  DEPOSIT: { label: 'Yükleme', variant: 'success' },
  WITHDRAWAL: { label: 'Çekim', variant: 'warning' },
  PURCHASE: { label: 'Alışveriş', variant: 'default' },
  REFUND: { label: 'İade', variant: 'default' },
  ADMIN_CREDIT: { label: 'Admin Artış', variant: 'success' },
  ADMIN_DEBIT: { label: 'Admin Azalış', variant: 'danger' },
  REFERRAL_REWARD: { label: 'Referans', variant: 'success' },
  LOYALTY_REWARD: { label: 'Sadakat', variant: 'success' },
  GIFT_RECEIVED: { label: 'Hediye Gelen', variant: 'success' },
  GIFT_SENT: { label: 'Hediye Giden', variant: 'warning' },
};

const METHOD_OPTS = [
  { value: 'PAPARA', label: 'Papara' },
  { value: 'PAYTR', label: 'PayTR' },
  { value: 'NOWPAYMENTS', label: 'Kripto' },
  { value: 'STRIPE', label: 'Stripe (Kart)' },
  { value: 'BANK_TRANSFER', label: 'Havale / EFT' },
];

export default function DashboardWalletPage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = React.useState(false);
  const [amount, setAmount] = React.useState('');
  const [method, setMethod] = React.useState('PAPARA');
  const [filterType, setFilterType] = React.useState<string>('all');
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [txError, setTxError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    apiFetch<{ items: Transaction[] }>('/wallet/transactions?limit=50')
      .then((res) => {
        if (!cancelled) setTransactions(res.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setTxError('İşlem geçmişi yüklenemedi');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const balances = [
    {
      code: 'TRY',
      name: 'Türk Lirası',
      symbol: '₺',
      value: user?.wallet.balanceTry ?? 0,
      color: 'cyan',
    },
    {
      code: 'USD',
      name: 'Amerikan Doları',
      symbol: '$',
      value: user?.wallet.balanceUsd ?? 0,
      color: 'lime',
    },
    {
      code: 'EUR',
      name: 'Euro',
      symbol: '€',
      value: user?.wallet.balanceEur ?? 0,
      color: 'magenta',
    },
    {
      code: 'USDT',
      name: 'Tether',
      symbol: '₮',
      value: user?.wallet.balanceUsdt ?? 0,
      color: 'cyan',
    },
  ];

  const filteredTx =
    filterType === 'all' ? transactions : transactions.filter((t) => t.type === filterType);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-orbitron text-2xl font-black text-white">Cüzdan</h1>
          <p className="text-sm text-white/60">Bakiyelerini yönet, işlemlerini takip et</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Bakiye Yükle
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {balances.map((b) => (
          <Card key={b.code} className="group">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-white/60">
                    {b.code}
                  </p>
                  <p className="mt-1 text-xs text-white/50">{b.name}</p>
                  <p className="mt-3 font-orbitron text-2xl font-bold text-white">
                    {b.symbol}
                    {b.value.toLocaleString('tr-TR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="rounded-md border border-cyber-cyan/30 bg-cyber-cyan/10 p-2 text-cyber-cyan transition-all group-hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                  <WalletIcon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-orbitron text-lg font-bold text-white">İşlem Geçmişi</h2>
            <div className="flex items-center gap-2">
              <Label htmlFor="filter" className="text-xs text-white/60">
                Filtre:
              </Label>
              <Select
                id="filter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                options={[
                  { value: 'all', label: 'Tümü' },
                  { value: 'DEPOSIT', label: 'Yükleme' },
                  { value: 'WITHDRAWAL', label: 'Çekim' },
                  { value: 'PURCHASE', label: 'Alışveriş' },
                  { value: 'REFUND', label: 'İade' },
                ]}
                className="w-40"
              />
            </div>
          </div>

          {txError ? (
            <div className="rounded-md border border-cyber-magenta/40 bg-cyber-magenta/10 px-4 py-3 text-sm text-cyber-magenta">
              {txError}
            </div>
          ) : filteredTx.length === 0 ? (
            <EmptyState
              icon={WalletIcon}
              title="Henüz işlem yok"
              description="Bakiye yüklediğinde veya alışveriş yaptığında işlemler burada görünecek."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-cyber-cyan/20 text-left text-xs uppercase tracking-wider text-white/60">
                    <th className="py-3 pr-4">Tarih</th>
                    <th className="py-3 pr-4">Tip</th>
                    <th className="py-3 pr-4 text-right">Tutar</th>
                    <th className="py-3 pr-4 text-right">Bakiye Sonrası</th>
                    <th className="py-3 pr-4">Açıklama</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.map((tx) => {
                    const m = TX_TYPE_MAP[tx.type];
                    const isPositive = [
                      'DEPOSIT',
                      'REFUND',
                      'ADMIN_CREDIT',
                      'REFERRAL_REWARD',
                      'LOYALTY_REWARD',
                      'GIFT_RECEIVED',
                    ].includes(tx.type);
                    return (
                      <tr
                        key={tx.id}
                        className="border-b border-cyber-cyan/10 hover:bg-cyber-cyan/5"
                      >
                        <td className="py-3 pr-4 text-white/70">
                          {new Date(tx.createdAt).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={m.variant} size="sm">
                            {m.label}
                          </Badge>
                        </td>
                        <td
                          className={`py-3 pr-4 text-right font-medium ${isPositive ? 'text-cyber-lime' : 'text-white'}`}
                        >
                          {isPositive ? '+' : '-'}
                          {tx.currency} {tx.amount.toLocaleString('tr-TR')}
                        </td>
                        <td className="py-3 pr-4 text-right text-white/70">
                          {tx.currency} {tx.balanceAfter.toLocaleString('tr-TR')}
                        </td>
                        <td className="py-3 pr-4 text-white/70">{tx.description ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-darker/80 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-orbitron text-lg font-bold text-white">Bakiye Yükle</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/60 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowModal(false);
                }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="amount" className="mb-2 block">
                    Tutar (₺) <span className="text-cyber-magenta">*</span>
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100.00"
                  />
                </div>
                <div>
                  <Label htmlFor="method" className="mb-2 block">
                    Yöntem <span className="text-cyber-magenta">*</span>
                  </Label>
                  <Select
                    id="method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                    options={METHOD_OPTS}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setShowModal(false)}
                  >
                    İptal
                  </Button>
                  <Button type="submit" className="flex-1">
                    Yükle
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
