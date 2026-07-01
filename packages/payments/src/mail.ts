export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface MailService {
  send(msg: MailMessage): Promise<{ id: string }>;
}

class ResendMailService implements MailService {
  private apiKey: string;
  private from: string;

  constructor(apiKey: string, from = 'CyberLisans <[email protected]>') {
    this.apiKey = apiKey;
    this.from = from;
  }

  async send(msg: MailMessage): Promise<{ id: string }> {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: msg.from ?? this.from,
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend failed: ${res.status} ${body}`);
    }
    const data = (await res.json()) as { id: string };
    return { id: data.id };
  }
}

class ConsoleMailService implements MailService {
  async send(msg: MailMessage): Promise<{ id: string }> {
    console.log('[MAIL]', msg.to, msg.subject);
    console.log(msg.text ?? msg.html);
    return { id: `console-${Date.now()}` };
  }
}

let _service: MailService | null = null;

export function getMailService(): MailService {
  if (_service) return _service;
  const apiKey = process.env['RESEND_API_KEY'];
  if (!apiKey || process.env['NODE_ENV'] === 'development') {
    _service = new ConsoleMailService();
  } else {
    _service = new ResendMailService(apiKey);
  }
  return _service;
}

export const mailTemplates = {
  emailVerify: (link: string) => ({
    subject: 'E-posta Adresinizi Doğrulayın — CyberLisans',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0A0A1F; color: #fff;">
      <h1 style="color: #00F0FF; font-family: Orbitron, sans-serif;">CyberLisans</h1>
      <p>Hoş geldiniz! Hesabınızı aktifleştirmek için aşağıdaki bağlantıya tıklayın:</p>
      <p><a href="${link}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #00F0FF, #FF00C8); color: #050510; text-decoration: none; border-radius: 8px; font-weight: bold;">E-postamı Doğrula</a></p>
      <p style="color: #888; font-size: 12px;">Bu bağlantı 24 saat içinde geçerliliğini yitirir.</p>
    </div>`,
    text: `E-postanızı doğrulamak için: ${link}`,
  }),
  passwordReset: (link: string) => ({
    subject: 'Şifre Sıfırlama — CyberLisans',
    html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #0A0A1F; color: #fff;">
      <h1 style="color: #FF00C8;">Şifre Sıfırlama</h1>
      <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
      <p><a href="${link}" style="display: inline-block; padding: 12px 24px; background: #FF00C8; color: #fff; text-decoration: none; border-radius: 8px;">Şifremi Sıfırla</a></p>
      <p style="color: #888; font-size: 12px;">Bu bağlantı 1 saat geçerlidir. Eğer bu isteği siz yapmadıysanız bu e-postayı yok sayın.</p>
    </div>`,
    text: `Şifre sıfırlama: ${link}`,
  }),
  twoFactorEnabled: () => ({
    subject: '2FA Etkinleştirildi — CyberLisans',
    html: `<div style="font-family: sans-serif; padding: 24px; background: #0A0A1F; color: #fff;">
      <h1 style="color: #BEF264;">İki Faktörlü Doğrulama Aktif</h1>
      <p>Hesabınız artık ek bir güvenlik katmanı ile korunuyor.</p>
    </div>`,
  }),
  orderFulfilled: (orderNumber: string, codes: string[]) => ({
    subject: `Siparişiniz Hazır #${orderNumber} — CyberLisans`,
    html: `<div style="font-family: sans-serif; padding: 24px; background: #0A0A1F; color: #fff;">
      <h1 style="color: #00F0FF;">Siparişiniz Hazır</h1>
      <p>Sipariş no: <strong>${orderNumber}</strong></p>
      <p>Lisans anahtarlarınız:</p>
      <pre style="background: #050510; padding: 16px; border-radius: 8px; color: #00F0FF;">${codes.join('\n')}</pre>
    </div>`,
  }),
  newDeviceLogin: (info: { email: string; ip: string; device: string; time: string }) => ({
    subject: 'Yeni Cihazdan Giriş — CyberLisans',
    html: `<div style="font-family: sans-serif; padding: 24px; background: #0A0A1F; color: #fff;">
      <h1 style="color: #FF00C8;">Yeni Cihazdan Giriş</h1>
      <p>Yönetici hesabınıza yeni bir cihazdan giriş yapıldı.</p>
      <ul>
        <li><strong>E-posta:</strong> ${info.email}</li>
        <li><strong>IP:</strong> ${info.ip}</li>
        <li><strong>Cihaz:</strong> ${info.device}</li>
        <li><strong>Zaman:</strong> ${info.time}</li>
      </ul>
      <p>Bu girişi tanımıyorsanız hemen şifrenizi sıfırlayın.</p>
    </div>`,
    text: `Yeni cihazdan giriş: ${info.email} ${info.ip} ${info.time}`,
  }),
  dealerNewDeviceLogin: (info: { email: string; ip: string; device: string; time: string }) => ({
    subject: 'Yeni Cihazdan Bayi Girişi — CyberLisans',
    html: `<div style="font-family: sans-serif; padding: 24px; background: #0A0A1F; color: #fff;">
      <h1 style="color: #FF00C8;">Yeni Cihazdan Bayi Girişi</h1>
      <p>Bayi hesabınıza yeni bir cihazdan giriş yapıldı.</p>
      <ul>
        <li><strong>E-posta:</strong> ${info.email}</li>
        <li><strong>IP:</strong> ${info.ip}</li>
        <li><strong>Cihaz:</strong> ${info.device}</li>
        <li><strong>Zaman:</strong> ${info.time}</li>
      </ul>
      <p>Bu girişi tanımıyorsanız hemen şifrenizi sıfırlayın.</p>
    </div>`,
    text: `Yeni bayi girişi: ${info.email} ${info.ip} ${info.time}`,
  }),
  twoFactorMandatoryWarning: (info: { email: string; setupUrl: string }) => ({
    subject: 'İki Faktörlü Doğrulama Zorunludur — CyberLisans',
    html: `<div style="font-family: sans-serif; padding: 24px; background: #0A0A1F; color: #fff;">
      <h1 style="color: #FF00C8;">2FA Zorunludur</h1>
      <p>Yönetici hesabınız için iki faktörlü doğrulama zorunludur.</p>
      <p>Lütfen aşağıdaki bağlantıdan 2FA kurulumunu tamamlayın:</p>
      <p><a href="${info.setupUrl}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #00F0FF, #FF00C8); color: #050510; text-decoration: none; border-radius: 8px; font-weight: bold;">2FA Kur</a></p>
    </div>`,
    text: `2FA kurulumu: ${info.setupUrl}`,
  }),
};
