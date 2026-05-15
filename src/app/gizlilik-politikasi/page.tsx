import Link from 'next/link';

export const metadata = { title: 'Gizlilik Politikası | Adalya Solar Enerji' };

async function fetchPolicy(key: string): Promise<string | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5207';
    const res = await fetch(`${base}/api/public/settings/${key}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.value || null;
  } catch {
    return null;
  }
}

export default async function GizlilikPolitikasiPage() {
  const content = await fetchPolicy('policy.privacy');

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-orange-500">Ana Sayfa</Link>
        <span className="mx-1">/</span>
        <span className="text-orange-500 font-semibold">Gizlilik Politikası</span>
      </div>

      <h1 className="text-3xl font-extrabold text-[#1B3A6B] mb-2">Gizlilik Politikası</h1>
      <p className="text-sm text-gray-400 mb-8">Son güncelleme: Mayıs 2026</p>

      {content ? (
        <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      ) : (
        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">1. Genel Bilgiler</h2>
            <p>Adalya Solar Enerji olarak kişisel verilerinizin güvenliğine büyük önem vermekteyiz. Bu Gizlilik Politikası, <strong>adalyasolar.com</strong> alan adlı web sitemizi ziyaret etmeniz ve/veya hizmetlerimizden yararlanmanız sırasında topladığımız kişisel verilerin nasıl işlendiğini açıklamaktadır.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">2. Toplanan Veriler</h2>
            <p>Aşağıdaki kişisel verilerinizi toplayabiliriz:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Ad, soyad ve iletişim bilgileri (e-posta, telefon)</li>
              <li>Teslimat ve fatura adresleri</li>
              <li>Sipariş geçmişi ve satın alma tercihleri</li>
              <li>Cihaz ve tarayıcı bilgileri (IP adresi, çerezler)</li>
              <li>Hesap giriş bilgileri (şifreler şifreli olarak saklanır)</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">3. Verilerin Kullanım Amacı</h2>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Sipariş işleme, teslimat ve müşteri hizmetleri</li>
              <li>Hesap oluşturma ve yönetimi</li>
              <li>Kampanya ve indirim bilgilendirmeleri (onay verilmesi halinde)</li>
              <li>Yasal yükümlülüklerin yerine getirilmesi</li>
              <li>Site güvenliğinin sağlanması</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">4. Verilerin Paylaşımı</h2>
            <p>Kişisel verileriniz; yasal zorunluluklar, sipariş teslimatı (kargo firmaları) ve ödeme işlemleri dışında üçüncü taraflarla paylaşılmamaktadır. Verileriniz hiçbir koşulda satılmaz veya kiralanmaz.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">5. Çerezler (Cookies)</h2>
            <p>Sitemiz, kullanıcı deneyimini iyileştirmek amacıyla çerezler kullanmaktadır. Tarayıcınızın ayarlarından çerezleri devre dışı bırakabilirsiniz; ancak bu durumda bazı özellikler düzgün çalışmayabilir.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">6. Veri Güvenliği</h2>
            <p>Kişisel verileriniz SSL şifreleme teknolojisi ile korunmakta, güvenli sunucularda saklanmaktadır. Şifreler hash&apos;lenerek tutulmakta, düz metin olarak hiçbir zaman saklanmamaktadır.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">7. Haklarınız</h2>
            <p>KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Verilerinize erişim ve kopyasını talep etme</li>
              <li>Yanlış verilerin düzeltilmesini isteme</li>
              <li>Verilerinizin silinmesini talep etme</li>
              <li>Pazarlama iletişimlerinden çıkma</li>
            </ul>
            <p className="mt-2">Talepleriniz için <strong>info@adalyasolar.com</strong> adresine e-posta gönderebilirsiniz.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">8. İletişim</h2>
            <p>Bu politikayla ilgili sorularınız için <Link href="/iletisim" className="text-orange-500 hover:underline">İletişim</Link> sayfamızı ziyaret edebilirsiniz.</p>
          </section>
        </div>
      )}
    </main>
  );
}
