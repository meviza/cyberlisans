'use client';

import * as React from 'react';
import { Save, Lock, Shield, Trash2, Download, X, QrCode } from 'lucide-react';
import { Card, CardContent, Button, Input, Label, Badge, Spinner } from '@cyberlisans/ui/atoms';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { apiFetch, ApiError } from '@/lib/api-client';

const LOCALE_OPTS = [
  { value: 'TR', label: 'Türkçe' },
  { value: 'EN', label: 'English' },
  { value: 'DE', label: 'Deutsch' },
  { value: 'AR', label: 'العربية' },
  { value: 'RU', label: 'Русский' },
];

const CURRENCY_OPTS = [
  { value: 'TRY', label: '₺ TRY' },
  { value: 'USD', label: '$ USD' },
  { value: 'EUR', label: '€ EUR' },
  { value: 'USDT', label: '₮ USDT' },
];

export default function DashboardSettingsPage() {
  const { user, refresh, logout } = useAuth();
  const [displayName, setDisplayName] = React.useState(user?.displayName ?? '');
  const [avatarUrl, setAvatarUrl] = React.useState(user?.avatarUrl ?? '');
  const [locale, setLocale] = React.useState(user?.locale ?? 'TR');
  const [currency, setCurrency] = React.useState(user?.currency ?? 'TRY');

  const [currentPwd, setCurrentPwd] = React.useState('');
  const [newPwd, setNewPwd] = React.useState('');
  const [confirmPwd, setConfirmPwd] = React.useState('');

  const [show2FAModal, setShow2FAModal] = React.useState(false);
  const [showDisable2FAModal, setShowDisable2FAModal] = React.useState(false);
  const [twoFactorCode, setTwoFactorCode] = React.useState('');
  const [disablePwd, setDisablePwd] = React.useState('');

  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deletePwd, setDeletePwd] = React.useState('');
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);

  const [savingProfile, setSavingProfile] = React.useState(false);
  const [savingPwd, setSavingPwd] = React.useState(false);
  const [profileMsg, setProfileMsg] = React.useState<{ type: 'ok' | 'err'; text: string } | null>(
    null,
  );
  const [pwdMsg, setPwdMsg] = React.useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setSavingProfile(true);
    try {
      await apiFetch('/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          displayName: displayName || undefined,
          avatarUrl: avatarUrl || undefined,
          locale,
          currency,
        }),
      });
      await refresh();
      setProfileMsg({ type: 'ok', text: 'Profil güncellendi' });
    } catch (err) {
      setProfileMsg({ type: 'err', text: err instanceof ApiError ? err.message : 'Hata oluştu' });
    } finally {
      setSavingProfile(false);
    }
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
      setPwdMsg({ type: 'err', text: err instanceof ApiError ? err.message : 'Hata oluştu' });
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

  const deleteAccount = async () => {
    try {
      await apiFetch('/profile', {
        method: 'DELETE',
        body: JSON.stringify({ password: deletePwd }),
      });
      logout();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-orbitron text-2xl font-black text-white">Ayarlar</h1>
        <p className="text-sm text-white/60">Hesap bilgilerini ve güvenliğini yönet</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 font-orbitron text-lg font-bold text-white">Profil Bilgileri</h2>
          <form onSubmit={saveProfile} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="displayName" className="mb-2 block">
                  Görünür ad
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Cyber User"
                />
              </div>
              <div>
                <Label htmlFor="avatarUrl" className="mb-2 block">
                  Avatar URL
                </Label>
                <Input
                  id="avatarUrl"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="locale" className="mb-2 block">
                  Dil
                </Label>
                <Select
                  id="locale"
                  value={locale}
                  onChange={(e) => setLocale(e.target.value)}
                  options={LOCALE_OPTS}
                />
              </div>
              <div>
                <Label htmlFor="currency" className="mb-2 block">
                  Para birimi
                </Label>
                <Select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  options={CURRENCY_OPTS}
                />
              </div>
            </div>
            {profileMsg && (
              <p
                className={
                  profileMsg.type === 'ok'
                    ? 'text-sm text-cyber-lime'
                    : 'text-sm text-cyber-magenta'
                }
              >
                {profileMsg.text}
              </p>
            )}
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? <Spinner size="sm" /> : <Save className="h-4 w-4" />}
              {savingProfile ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h2 className="mb-4 font-orbitron text-lg font-bold text-white">Şifre Değiştir</h2>
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <Label htmlFor="currentPwd" className="mb-2 block">
                Mevcut şifre
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
                  Yeni şifre
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
                  Yeni şifre tekrar
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
              <h2 className="font-orbitron text-lg font-bold text-white">
                İki Faktörlü Doğrulama (2FA)
              </h2>
              <p className="mt-1 text-sm text-white/60">
                Authenticator uygulaması ile hesabını koru
              </p>
              <div className="mt-3">
                {user?.twoFactorEnabled ? (
                  <Badge variant="success">Aktif</Badge>
                ) : (
                  <Badge variant="warning">Pasif</Badge>
                )}
              </div>
            </div>
            {user?.twoFactorEnabled ? (
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
          <h2 className="mb-4 font-orbitron text-lg font-bold text-white">KVKK & Veri</h2>
          <div className="space-y-3">
            <a
              href="/legal/kvkk"
              className="flex items-center gap-2 text-sm text-cyber-cyan hover:text-cyber-magenta"
            >
              <Download className="h-4 w-4" />
              KVKK aydınlatma metnini görüntüle
            </a>
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-cyber-cyan hover:text-cyber-magenta"
            >
              <Download className="h-4 w-4" />
              Verilerini indir (talep oluştur)
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-cyber-magenta/40">
        <CardContent className="p-6">
          <h2 className="font-orbitron text-lg font-bold text-cyber-magenta">Tehlikeli Bölge</h2>
          <p className="mt-1 text-sm text-white/60">
            Hesabını silmek geri alınamaz. Tüm verilerin silinir.
          </p>
          <Button variant="secondary" className="mt-4" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="h-4 w-4" />
            Hesabımı Sil
          </Button>
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
                6 haneli kodu gir
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
                2FA'yı Kapat
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showDeleteModal && (
        <Modal title="Hesabı Sil" onClose={() => setShowDeleteModal(false)}>
          <div className="space-y-4">
            <p className="text-sm text-cyber-magenta">
              Bu işlem geri alınamaz. Tüm verilerin kalıcı olarak silinir.
            </p>
            <div>
              <Label htmlFor="deletePwd" className="mb-2 block">
                Şifreni onayla
              </Label>
              <Input
                id="deletePwd"
                type="password"
                value={deletePwd}
                onChange={(e) => setDeletePwd(e.target.value)}
              />
            </div>
            <Checkbox
              checked={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.checked)}
              label="Hesabımı kalıcı olarak silmek istediğimi onaylıyorum"
            />
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => setShowDeleteModal(false)}>
                Vazgeç
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={deleteAccount}
                disabled={!deleteConfirm || !deletePwd}
              >
                Hesabı Sil
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
