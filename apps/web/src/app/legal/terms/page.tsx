export const metadata = { title: 'Kullanım Koşulları' };

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-6 font-display text-4xl font-black text-cyber-cyan text-glow-cyan">
        Kullanım Koşulları
      </h1>
      <div className="space-y-4 text-white/80">
        <p>
          CyberLisans platformunu kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız.
        </p>
        <h2 className="font-display text-2xl font-bold text-cyber-magenta">1. Genel</h2>
        <p>
          Bu platform 18 yaşını doldurmuş bireylere yöneliktir. Tüm lisanslar orijinaldir ve
          ilgili markaların ticari markalarıdır.
        </p>
        <h2 className="font-display text-2xl font-bold text-cyber-magenta">2. Ödeme ve Teslim</h2>
        <p>
          Ödeme onayı sonrası lisanslar otomatik olarak teslim edilir. İade politikası:
          aktivasyon yapılmamış ürünler için 14 gün.
        </p>
        <h2 className="font-display text-2xl font-bold text-cyber-magenta">3. Gizlilik</h2>
        <p>
          Kişisel verileriniz KVKK ve GDPR uyumlu işlenir. Detaylı bilgi için Gizlilik Politikası.
        </p>
        <h2 className="font-display text-2xl font-bold text-cyber-magenta">4. Sorumluluk</h2>
        <p>
          Platformumuz &quot;olduğu gibi&quot; sunulmaktadır. Mücbir sebepler, üçüncü taraf sağlayıcı
          kesintileri ve ödeme aracılarının politikaları nedeniyle oluşabilecek gecikmelerden
          şirketimiz sorumlu tutulamaz.
        </p>
      </div>
    </main>
  );
}
