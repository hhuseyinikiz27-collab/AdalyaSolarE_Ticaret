import Link from 'next/link';

export const metadata = { title: 'İade Politikası | Adalya Solar Enerji' };

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

export default async function IadePolitikasiPage() {
  const content = await fetchPolicy('policy.returns');

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-orange-500">Ana Sayfa</Link>
        <span className="mx-1">/</span>
        <span className="text-orange-500 font-semibold">İade Politikası</span>
      </div>

      <h1 className="text-3xl font-extrabold text-[#1B3A6B] mb-2">İade ve İptal Politikası</h1>
      <p className="text-sm text-gray-400 mb-8">Son güncelleme: Mayıs 2026</p>

      {content ? (
        <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      ) : (
        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">1. Cayma Hakkı</h2>
            <p>6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamında, teslim tarihinden itibaren <strong>14 gün</strong> içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayabilirsiniz.</p>
            <p className="mt-2">Cayma hakkını kullanmak için <strong>info@adalyasolar.com</strong> adresine e-posta göndererek veya <Link href="/iletisim" className="text-orange-500 hover:underline">İletişim</Link> sayfamız üzerinden bize ulaşabilirsiniz.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">2. İade Koşulları</h2>
            <p>İadenin kabul edilebilmesi için aşağıdaki koşulların sağlanması gerekmektedir:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Ürün orijinal ambalajında, hasarsız ve eksiksiz olmalıdır.</li>
              <li>Fatura ve teslim belgeleri ürünle birlikte iade edilmelidir.</li>
              <li>Ürünün kurulumu gerçekleştirilmemiş olmalıdır.</li>
              <li>Kullanıcı kaynaklı hasar, çizik veya kırık bulunmamalıdır.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">3. Cayma Hakkı Kullanılamayan Durumlar</h2>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Sipariş sonrası özel üretilen veya kişiselleştirilen ürünler</li>
              <li>Kurulumu yapılmış ve aktive edilmiş sistemler</li>
              <li>Açılmış yazılım lisansları veya dijital içerikler</li>
              <li>Hijyen koşulları nedeniyle iade edilemeyecek ürünler</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">4. İade Süreci</h2>
            <ol className="list-decimal pl-5 space-y-2 mt-2">
              <li>İade talebinizi e-posta ile bildirin; sipariş numaranızı ve iade nedeninizi belirtin.</li>
              <li>Ekibimiz 1–2 iş günü içinde size kargo bilgilerini iletir.</li>
              <li>Ürünü orijinal ambalajıyla belirtilen kargo firmasıyla gönderin.</li>
              <li>Ürün bize ulaştıktan sonra 5 iş günü içinde inceleme yapılır.</li>
              <li>Onaylanan iadelerde ödeme, 7–14 iş günü içinde orijinal ödeme yöntemiyle iade edilir.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">5. İade Kargo Ücreti</h2>
            <p>Ürünün ayıplı veya hatalı gönderilmesi durumunda kargo ücreti tarafımızca karşılanır. Cayma hakkı kapsamındaki iadelerde kargo ücreti alıcıya aittir.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">6. Hasarlı veya Hatalı Ürün</h2>
            <p>Ürünü teslim alırken hasar gördüğünüzde kargo görevlisi eşliğinde tutanak tutun ve ürünü teslim almayın. Kargoda oluşan hasarlar için tutanak olmaksızın işlem yapılamamaktadır. Gizli hasarlar için ürün tesliminden itibaren <strong>48 saat</strong> içinde bize bildirim yapmanız gerekmektedir.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">7. Sipariş İptali</h2>
            <p>Sipariş henüz kargoya verilmemişse, <strong>info@adalyasolar.com</strong> adresine e-posta göndererek siparişinizi iptal edebilirsiniz. Kargoya verilen siparişler için iade süreci işletilir. İptal onaylandığında ödeme 3–5 iş günü içinde iade edilir.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">8. Garanti</h2>
            <p>Tüm ürünler üretici garantisi kapsamındadır. Garanti süreleri ürün sayfasında belirtilmektedir. Garanti kapsamındaki arızalar için üretici servisine yönlendirme yapılmaktadır.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">9. İletişim</h2>
            <p>İade ve iptal talepleriniz için <strong>info@adalyasolar.com</strong> adresine e-posta gönderebilir veya <Link href="/iletisim" className="text-orange-500 hover:underline">İletişim</Link> sayfamızı ziyaret edebilirsiniz.</p>
          </section>
        </div>
      )}
    </main>
  );
}
