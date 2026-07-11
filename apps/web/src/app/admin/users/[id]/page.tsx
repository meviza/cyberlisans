'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Loader2, Trash2, Mail, KeyRound } from 'lucide-react';
import { Button, Card, CardContent, Spinner } from '@cyberlisans/ui/atoms';
import { apiFetch, ApiError, getAccessToken } from '@/lib/api-client';
import { UserDetailCard, type AdminUserDetail } from '@/components/admin/user-detail-card';
import { UserOrdersList, type UserOrderRow } from '@/components/admin/user-orders-list';
import { UserPaymentsList, type UserPaymentRow } from '@/components/admin/user-payments-list';
import { UserAuditLogList, type AuditLogRow } from '@/components/admin/user-audit-log-list';
import { AdjustWalletModal } from '@/components/admin/adjust-wallet-modal';
import { Reset2FAButton } from '@/components/admin/reset-2fa-button';
import { SuspendUserButton } from '@/components/admin/suspend-user-button';

export default function AdminUserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const userId = params.id;

  const [user, setUser] = React.useState<AdminUserDetail | null>(null);
  const [orders, setOrders] = React.useState<UserOrderRow[]>([]);
  const [payments, setPayments] = React.useState<UserPaymentRow[]>([]);
  const [audit, setAudit] = React.useState<AuditLogRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [walletOpen, setWalletOpen] = React.useState(false);
  const [deleteBusy, setDeleteBusy] = React.useState(false);
  const [resetBusy, setResetBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [u, o, p, a] = await Promise.all([
        apiFetch<AdminUserDetail>(`/admin/users/${userId}`),
        apiFetch<{ items: UserOrderRow[] }>(`/admin/orders?limit=50`),
        apiFetch<{ items: UserPaymentRow[] }>(`/admin/payments?limit=50`),
        apiFetch<{ items: AuditLogRow[] }>(
          `/admin/audit/export?actorId=${userId}&targetUserId=${userId}&limit=50`,
        ),
      ]);
      setUser(u);
      setOrders(
        (o.items ?? []).filter(
          (x: UserOrderRow & { user?: { id: string } }) => x.user?.id === userId,
        ),
      );
      setPayments((p.items ?? []) as UserPaymentRow[]);
      setAudit(a.items ?? []);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const handlePasswordReset = async () => {
    if (resetBusy || !user) return;
    if (!window.confirm(`${user.username} için şifre sıfırlama e-postası gönder?`)) return;
    setResetBusy(true);
    try {
      await apiFetch(`/admin/users/${user.id}/send-password-reset`, { method: 'POST' });
      window.alert('Şifre sıfırlama e-postası gönderildi');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Gönderilemedi';
      window.alert(msg);
    } finally {
      setResetBusy(false);
    }
  };

  const handleDelete = async () => {
    if (deleteBusy || !user) return;
    if (
      !window.confirm(
        `${user.username} (${user.email}) hesabı KVKK kapsamında kalıcı olarak silinecek. Bu işlem geri alınamaz. Devam edilsin mi?`,
      )
    )
      return;
    setDeleteBusy(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`/admin/users/${user.id}/delete`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Silinemedi');
      }
      window.alert('Kullanıcı silindi');
      router.push('/admin/users');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Silinemedi';
      window.alert(msg);
    } finally {
      setDeleteBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="rounded-md border border-cyber-magenta/30 bg-cyber-magenta/5 p-6 text-cyber-magenta">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>{error ?? 'Kullanıcı bulunamadı'}</p>
        </div>
        <Button onClick={() => router.push('/admin/users')} variant="ghost" className="mt-4">
          <ArrowLeft className="h-4 w-4" /> Listeye dön
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-cyber-cyan"
        >
          <ArrowLeft className="h-4 w-4" /> Kullanıcılar
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setWalletOpen(true)} variant="primary" className="gap-2">
            <KeyRound className="h-4 w-4" />
            Cüzdan
          </Button>
          <SuspendUserButton
            userId={user.id}
            currentStatus={user.status}
            username={user.username}
            size="md"
            onDone={load}
          />
          <Button
            onClick={handlePasswordReset}
            variant="outline"
            className="gap-2"
            disabled={resetBusy}
          >
            {resetBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            Şifre Sıfırlama
          </Button>
          <Reset2FAButton userId={user.id} username={user.username} onDone={load} />
          <Button
            onClick={handleDelete}
            variant="outline"
            className="gap-2 border-cyber-magenta/40 text-cyber-magenta hover:bg-cyber-magenta/10"
            disabled={deleteBusy}
          >
            {deleteBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Sil (KVKK)
          </Button>
        </div>
      </div>

      <UserDetailCard user={user} />

      <UserOrdersList orders={orders} />
      <UserPaymentsList payments={payments} />
      <UserAuditLogList logs={audit} />

      {walletOpen && (
        <AdjustWalletModal
          user={{ id: user.id, username: user.username }}
          open={walletOpen}
          onClose={() => setWalletOpen(false)}
          onSuccess={load}
        />
      )}
    </div>
  );
}
