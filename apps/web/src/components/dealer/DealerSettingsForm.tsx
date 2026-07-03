'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Save, Lock, Shield, Bell, X, QrCode, Trash2 } from 'lucide-react';
import { Card, CardContent, Button, Input, Label, Badge, Spinner } from '@cyberlisans/ui/atoms';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/auth-context';
import { apiFetch, ApiError } from '@/lib/api-client';

const NOTIF_KEY = 'cl_dealer_notif_v1';

interface NotifPrefs {
  emailSales: boolean;
  emailPayouts: boolean;
  emailLinkExpired: boolean;
  marketing: boolean;
}

const DEFAULT_PREFS: NotifPrefs = {
  emailSales: true,
  emailPayouts: true,
  emailLinkExpired: true,
  marketing: false,
};

export function DealerSettingsForm() {
  const router = useRouter();
  const { user, refresh, logout } = useAuth();
  const [currentPwd, setCurrentPwd] = React.useState('');
  const [newPwd, setNewPwd] = React.useState('');
  const [confirmPwd, setConfirmPwd] = React.useState('');
  const [savingPwd, setSavingPwd] = React.useState(false);
  const [pwdMsg, setPwdMsg] = React.useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [show2FAModal, setShow2FAModal] = React.useState(false);
  const [showDisable2FAModal, setShowDisable2FAModal] = React.useState(false);
  const [twoFactorCode, setTwoFactorCode] = React.useState('');
  const [disablePwd, setDisablePwd] = React.useState('');

  const [prefs, setPrefs] = React.useState<NotifPrefs>(DEFAULT_PREFS);
  const [savedPrefs, setSavedPrefs] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(NOTIF_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<NotifPrefs>;
        setPrefs({ ...DEFAULT_PREFS, ...parsed });
      }
    } catch {}
  }, []);

  const savePrefs = () => {
    try {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs));
      setSavedPrefs(true);
      window.setTimeout(() => setSavedPrefs(false), 1500);
    } catch {}
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    if (newPwd !== confirmPwd) {
      setPwdMsg({ type: 'err', text: 'Yeni şifreler eşleşmiyor' });
      return;
    }
    setSavingPwd(true);
    try {
      await apiFetch('/profile/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      setPwdMsg({ type: 'ok', text: 'Şifre değiştirildi' });
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (err) {
      setPwdMsg({ type: 'err', text: err instanceof ApiError ? err.message : 'Hata' });
    } finally {
      setSavingPwd(false);
    }
  };

  const enable2FA = async () => {
    try {
      await apiFetch('/auth/2fa/setup', { method: 'POST' });
    } catch {}
  };

  const verify2FA = async () => {
    try {
      await apiFetch('/auth/2fa/verify', {
        method: 'POST',
        body: JSON.stringify({ token: twoFactorCode }),
      });
      await refresh();
      setShow2FAModal(false);
      setTwoFactorCode('');
    } catch {}
  };

  const disable2FA = async () => {
    try {
      await apiFetch('/auth/2fa/disable', {
        method: 'POST',
        body: JSON.stringify({ password: disablePwd }),
      });
      await refresh();
      setShowDisable2FAModal(false);
      setDisablePwd('');
    } catch {}
  };

  if (!user) {
    React.useEffect(() => {
      router.replace('/login?next=/dealer/settings');
    }, [router]);
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-orbitron text-2xl font-black text-white">Bayi Ayarları</h1>
        <p className="text-sm text-white/60">Hesap güvenliğini ve bildirim tercihlerini yönet.</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 font-orbitron text-lg font-bold text-white">Şifre Değiştir</h2>
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <Label htmlFor="currentPwd" className="mb-2 block">
                Mevcut Şifre
              </Label>
              <Input
                id="currentPwd"
                type="password"
                required
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="newPwd" className="mb-2 block">
                  Yeni Şifre
                </Label>
                <Input
                  id="newPwd"
                  type="password"
                  required
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirmPwd" className="mb-2 block">
                  Yeni Şifre (Tekrar)
                </Label>
                <Input
                  id="confirmPwd"
                  type="password"
                  required
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                />
              </div>
            </div>
            {pwdMsg && (
              <p
                className={
                  pwdMsg.type === 'ok' ? 'text-sm text-cyber-lime' : 'text-sm text-cyber-magenta'
                }
              >
                {pwdMsg.text}
              </p>
            )}
            <Button type="submit" disabled={savingPwd}>
              {savingPwd ? <Spinner size="sm" /> : <Lock className="h-4 w-4" />}
              {savingPwd ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-orbitron text-lg font-bold text-white">İki Faktörlü Doğrulama</h2>
              <p className="mt-1 text-sm text-white/60">
                Authenticator uygulamasıyla ek bir güvenlik katmanı ekle.
              </p>
              <div className="mt-3">
                {user.twoFactorEnabled ? (
                  <Badge variant="success">Aktif</Badge>
                ) : (
                  <Badge variant="warning">Pasif</Badge>
                )}
              </div>
            </div>
            {user.twoFactorEnabled ? (
              <Button variant="secondary" onClick={() => setShowDisable2FAModal(true)}>
                2FA Kapat
              </Button>
            ) : (
              <Button
                onClick={() => {
                  enable2FA();
                  setShow2FAModal(true);
                }}
              >
                <Shield className="h-4 w-4" />
                2FA Kur
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 flex items-center gap-2 font-orbitron text-lg font-bold text-white">
            <Bell className="h-4 w-4 text-cyber-cyan" /> Bildirim Tercihleri
          </h2>
          <div className="space-y-3">
            <Checkbox
              checked={prefs.emailSales}
              onChange={(e) => setPrefs({ ...prefs, emailSales: e.target.checked })}
              label="Yeni satış bildirimleri (e-posta)"
            />
            <Checkbox
              checked={prefs.emailPayouts}
              onChange={(e) => setPrefs({ ...prefs, emailPayouts: e.target.checked })}
              label="Ödeme / komisyon bildirimleri"
            />
            <Checkbox
              checked={prefs.emailLinkExpired}
              onChange={(e) => setPrefs({ ...prefs, emailLinkExpired: e.target.checked })}
              label="Link süresi dolma uyarıları"
            />
            <Checkbox
              checked={prefs.marketing}
              onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
              label="Kampanya ve promosyon e-postaları"
            />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={savePrefs}>
              <Save className="h-4 w-4" /> Kaydet
            </Button>
            {savedPrefs && <span className="text-xs text-cyber-lime">Tercihler kaydedildi</span>}
          </div>
        </CardContent>
      </Card>

      {show2FAModal && (
        <Modal title="2FA Kurulumu" onClose={() => setShow2FAModal(false)}>
          <div className="space-y-4">
            <p className="text-sm text-white/70">
              Authenticator uygulamana (Google Authenticator, 1Password vb.) aşağıdaki QR kodu ekle:
            </p>
            <div className="flex justify-center rounded-md border border-cyber-cyan/30 bg-cyber-darker p-8">
              <QrCode className="h-32 w-32 text-cyber-cyan" />
            </div>
            <div>
              <Label htmlFor="code" className="mb-2 block">
                6 Haneli Kodu Gir
              </Label>
              <Input
                id="code"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                className="text-center tracking-widest"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setShow2FAModal(false)}>
                İptal
              </Button>
              <Button className="flex-1" onClick={verify2FA} disabled={twoFactorCode.length !== 6}>
                Doğrula
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showDisable2FAModal && (
        <Modal title="2FA Kapat" onClose={() => setShowDisable2FAModal(false)}>
          <div className="space-y-4">
            <p className="text-sm text-white/70">2FA'yı kapatmak için şifreni gir:</p>
            <Input
              type="password"
              value={disablePwd}
              onChange={(e) => setDisablePwd(e.target.value)}
              placeholder="Mevcut şifre"
            />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setShowDisable2FAModal(false)}
              >
                İptal
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={disable2FA}
                disabled={!disablePwd}
              >
                2FA Kapat
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-darker/80 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-orbitron text-lg font-bold text-white">{title}</h2>
            <button onClick={onClose} className="text-white/60 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
