import Link from 'next/link';

export const metadata = { title: 'Kullanım Koşulları | Adalya Solar Enerji' };

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

export default async function KullanimKosullariPage() {
  const content = await fetchPolicy('policy.terms');

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-orange-500">Ana Sayfa</Link>
        <span className="mx-1">/</span>
        <span className="text-orange-500 font-semibold">Kullanım Koşulları</span>
      </div>

      <h1 className="text-3xl font-extrabold text-[#1B3A6B] mb-2">Kullanım Koşulları</h1>
      <p className="text-sm text-gray-400 mb-8">Son güncelleme: Mayıs 2026</p>

      {content ? (
        <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      ) : (
        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">1. Genel Hükümler</h2>
            <p>Bu Kullanım Koşulları, <strong>adalyasolar.com</strong> alan adlı web sitesini kullanan tüm ziyaretçi ve kullanıcılar için geçerlidir. Siteyi kullanmaya devam etmeniz, bu koşulları kabul ettiğiniz anlamına gelir. Koşulları kabul etmiyorsanız siteyi kullanmayı bırakınız.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">2. Hizmet Kapsamı</h2>
            <p>Adalya Solar Enerji; güneş paneli, inverter, montaj ekipmanı ve ilgili ürünlerin satışını gerçekleştiren bir e-ticaret platformudur. Sitede yer alan ürün açıklamaları, görseller ve fiyat bilgileri bilgilendirme amaçlı olup önceden haber verilmeksizin değiştirilebilir.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">3. Kullanıcı Hesabı</h2>
            <p>Platformumuza üye olurken doğru ve güncel bilgi vermeniz gerekmektedir. Hesap güvenliğinizden ve şifrenizin gizliliğinden siz sorumlusunuz. Hesabınızın yetkisiz kişilerce kullanıldığını tespit ettiğinizde derhal <strong>info@adalyasolar.com</strong> adresine bildiriniz.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">4. Sipariş ve Ödeme</h2>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Siparişiniz onaylanana kadar satış gerçekleşmiş sayılmaz.</li>
              <li>Ödeme, sipariş tamamlama sırasında alınır; başarısız ödemelerde sipariş iptal edilir.</li>
              <li>Stok tükenmesi veya teknik hata durumunda sipariş iptal edilerek ödeme iade edilir.</li>
              <li>Fiyatlar KDV dahildir; kargo ücreti ayrıca belirtilir.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">5. Teslimat</h2>
            <p>Teslimat süreleri ürün ve stok durumuna göre değişmekte olup ortalama <strong>3–7 iş günü</strong>dür. Teslimat adresinizde bulunmamanız durumunda kargo firması size bildirim yapacaktır. Gecikmelerde sorumluluk kargo firmasına aittir.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">6. Fikri Mülkiyet</h2>
            <p>Sitede yer alan tüm içerik (logo, görsel, metin, tasarım) Adalya Solar Enerji&apos;ye aittir. İzinsiz kopyalanması, çoğaltılması veya dağıtılması yasaktır ve hukuki işleme konu olabilir.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">7. Sorumluluk Sınırlaması</h2>
            <p>Adalya Solar Enerji; teknik arızalar, internet kesintileri veya üçüncü taraf hizmetlerden kaynaklanan aksaklıklardan sorumlu tutulamaz. Site &quot;olduğu gibi&quot; sunulmakta olup hizmetin kesintisiz çalışacağı garanti edilmez.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">8. Yasaklı Kullanımlar</h2>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Sahte kimlik veya bilgi kullanarak hesap açmak</li>
              <li>Sisteme yetkisiz erişim sağlamaya çalışmak</li>
              <li>Diğer kullanıcıları yanıltacak ya da zarara uğratacak eylemler</li>
              <li>Otomatik bot/script ile site trafiği oluşturmak</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">9. Değişiklik Hakkı</h2>
            <p>Bu koşullar önceden haber verilmeksizin güncellenebilir. Güncel koşullar her zaman bu sayfada yayımlanır. Siteyi kullanmaya devam etmeniz, güncel koşulları kabul ettiğiniz anlamına gelir.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">10. Uygulanacak Hukuk</h2>
            <p>Bu koşullar Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklarda Antalya Mahkemeleri ve İcra Daireleri yetkilidir.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">11. İletişim</h2>
            <p>Sorularınız için <Link href="/iletisim" className="text-orange-500 hover:underline">İletişim</Link> sayfamızı ziyaret edebilir ya da <strong>info@adalyasolar.com</strong> adresine e-posta gönderebilirsiniz.</p>
          </section>
        </div>
      )}
    </main>
  );
}
