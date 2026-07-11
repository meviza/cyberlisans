export const metadata = { title: 'Gizlilik Politikası' };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-6 font-display text-4xl font-black text-brand-accent ">
        Gizlilik Politikası
      </h1>
      <div className="space-y-4 text-white/80">
        <p>
          CyberLisans olarak kişisel verilerinizin korunması konusunda KVKK ve GDPR düzenlemelerine
          tam uyumlu çalışmaktayız.
        </p>
        <h2 className="font-display text-2xl font-bold text-brand-text-secondary">
          Toplanan Veriler
        </h2>
        <p>
          E-posta adresi, kullanıcı adı, IP adresi, cihaz bilgisi, ödeme yöntemi referansı (kart
          bilgisi asla saklanmaz) ve sipariş geçmişi.
        </p>
        <h2 className="font-display text-2xl font-bold text-brand-text-secondary">
          Veri Kullanımı
        </h2>
        <p>
          Siparişlerinizi işlemek, dolandırıcılığı önlemek, yasal yükümlülükleri yerine getirmek ve
          hizmet kalitesini artırmak.
        </p>
        <h2 className="font-display text-2xl font-bold text-brand-text-secondary">Çerezler</h2>
        <p>
          Zorunlu çerezler oturum için gereklidir. Analitik ve pazarlama çerezleri için onayınız
          alınır; istediğiniz zaman reddedebilirsiniz.
        </p>
        <h2 className="font-display text-2xl font-bold text-brand-text-secondary">Haklarınız</h2>
        <p>
          Verilerinize erişme, düzeltme, silme, taşıma ve işlenmesini kısıtlama haklarına
          sahipsiniz. Başvuru için [email protected].
        </p>
      </div>
    </main>
  );
}
