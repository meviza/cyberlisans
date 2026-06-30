export const metadata = { title: 'KVKK Aydınlatma Metni' };

export default function KvkkPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-6 font-display text-4xl font-black text-cyber-cyan text-glow-cyan">
        KVKK Aydınlatma Metni
      </h1>
      <div className="space-y-4 text-white/80">
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, CyberLisans olarak veri
          sorumlusu sıfatıyla kişisel verilerinizin işlenmesi hakkında bilgilendirmek isteriz.
        </p>
        <h2 className="font-display text-2xl font-bold text-cyber-magenta">Veri Sorumlusu</h2>
        <p>CyberLisans · [email protected]</p>
        <h2 className="font-display text-2xl font-bold text-cyber-magenta">İşlenen Veriler</h2>
        <p>
          Kimlik (ad, soyad, T.C. kimlik no opsiyonel), iletişim, ödeme bilgileri (PCI-DSS
          uyumlu sağlayıcı üzerinden), lokasyon (ülke/şehir), işlem güvenliği verileri.
        </p>
        <h2 className="font-display text-2xl font-bold text-cyber-magenta">İşleme Amaçları</h2>
        <p>
          Sözleşme süreçlerinin yürütülmesi, ürün/hizmet teslimi, müşteri desteği, finans ve
          muhasebe, dolandırıcılık önleme, yasal yükümlülükler.
        </p>
        <h2 className="font-display text-2xl font-bold text-cyber-magenta">Veri Aktarımı</h2>
        <p>
          Yurtiçi ve yurtdışı ödeme sağlayıcıları, bulut barındırma hizmetleri, e-posta/SMS
          sağlayıcılarına yalnızca hizmetin gerektirdiği ölçüde aktarım yapılır.
        </p>
        <h2 className="font-display text-2xl font-bold text-cyber-magenta">Başvuru</h2>
        <p>
          Kanunun 11. maddesi kapsamındaki haklarınızı kullanmak için yazılı başvuruyu
          [email protected] adresine iletebilirsiniz.
        </p>
      </div>
    </main>
  );
}
