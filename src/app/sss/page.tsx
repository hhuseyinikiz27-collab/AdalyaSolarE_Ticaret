import Link from 'next/link';
import { ChevronDown, HelpCircle, ChevronRight } from 'lucide-react';

export const metadata = { title: 'Sıkça Sorulan Sorular | Adalya Solar Enerji' };

const faqs = [
  {
    category: 'Kurulum & Proje',
    items: [
      {
        q: 'Güneş enerjisi sistemi kurulumu ne kadar sürer?',
        a: 'Konut tipi sistemler (5-10 kWp) genellikle 1-3 iş günü içinde tamamlanır. Ticari ve endüstriyel projeler sistemin büyüklüğüne göre 1-4 hafta sürebilir. TEDAŞ bağlantı başvuru onayı ise bölgeye göre 15-45 gün arasında değişmektedir.',
      },
      {
        q: 'Kaç güneş paneli gerekiyor?',
        a: 'Panel sayısı aylık elektrik tüketiminize, çatı yönüne ve bölgenizdeki güneşlenme saatine bağlıdır. Enerji Hesaplayıcımızı kullanarak tahmini panel sayısını hesaplayabilirsiniz. Ortalama bir konut için 5-15 panel genellikle yeterlidir.',
      },
      {
        q: 'Hangi yöne bakan çatılar uygun?',
        a: 'En verimli yön güney, ardından güneybatı ve güneydoğudur. Güney yönünde 30-35 derece eğim idealdir. Doğu-batı yönleri de kullanılabilir ancak verim %10-20 düşer. Düz çatılarda optimum açıda montaj yapılabilir.',
      },
      {
        q: 'Kiracı olarak güneş enerjisi sistemi kurabilir miyim?',
        a: 'Kiracılar mülk sahibinin yazılı onayıyla sistem kurabilir. Taşınma durumunda sistem sökülebilir veya mülk sahibiyle devir anlaşması yapılabilir. Adalya Solar bu süreçte sözleşme desteği de sağlamaktadır.',
      },
    ],
  },
  {
    category: 'Teknik Sorular',
    items: [
      {
        q: 'Şebeke kesintisinde sistem çalışır mı?',
        a: 'Standart on-grid (şebekeye bağlı) sistemler güvenlik nedeniyle şebeke kesintisinde otomatik olarak kapanır. Kesinti anında da elektrik kullanmak istiyorsanız batarya destekli hibrit sistem tercih etmelisiniz.',
      },
      {
        q: 'Kış aylarında verim ne kadar düşer?',
        a: 'Güneş panelleri yalnızca ışıkla çalışır, sıcakla değil. Kışın güneşlenme saatleri azaldığı için üretim düşer; ancak paneller aslında soğuk havada daha verimli çalışır. Antalya gibi bölgelerde kış aylarında bile önemli miktarda üretim gerçekleşir.',
      },
      {
        q: 'Düşük ışık koşullarında (bulutlu hava) sistem çalışır mı?',
        a: 'Evet, modern güneş panelleri diffüz ışıkta da üretim yapar. Ancak verim, parlak güneş altına kıyasla %10-40 arasında düşer. Düşük ışık performansı yüksek paneller (TOPCon, HJT teknolojisi) bu koşullarda avantaj sağlar.',
      },
      {
        q: 'Güneş panelleri ne kadar süre kullanılır?',
        a: 'Kaliteli paneller 25-30 yıl ve üzeri kullanım ömrüne sahiptir. Çoğu üretici ilk 10 yıl için ürün garantisi, 25-30 yıl için güç garantisi sunar. Güç garantisi genellikle 25. yılda orijinal gücün en az %80\'inin korunacağını taahhüt eder.',
      },
    ],
  },
  {
    category: 'Maliyet & Yatırım',
    items: [
      {
        q: 'Yatırım kendini kaç yılda amorti eder?',
        a: 'Türkiye\'de konut sistemleri ortalama 4-7 yılda kendini amorti eder. Bu süre bulunduğunuz şehirdeki güneşlenme, tüketim miktarınız ve elektrik tarifenize göre değişir. Enerji Hesaplayıcımız amortisman sürenizi hesaplamanıza yardımcı olur.',
      },
      {
        q: 'Devlet teşviki veya kredi imkânı var mı?',
        a: 'YEKDEM kapsamında ürettiğiniz fazla enerji şebekeye satılabilir. KOBİ\'ler için KOSGEB enerji verimliliği destekleri mevcuttur. Bazı bankalar güneş enerjisi projelerine özel düşük faizli kredi sunmaktadır. Güncel teşvikler için ücretsiz danışmanlık hizmetimizden yararlanabilirsiniz.',
      },
      {
        q: 'Sigorta yaptırmalı mıyım?',
        a: 'Güneş enerjisi sistemleri konut sigortanıza ek zeyil ile veya ayrı bir montaj sigortasıyla güvence altına alınabilir. Fırtına, dolu ve yangın gibi risklere karşı sigorta yaptırmanızı tavsiye ederiz. Adalya Solar kurulum sonrası gerekli belgeleri sigorta şirketinize iletmenize yardımcı olur.',
      },
      {
        q: 'Toplu/kurumsal alımlarda fiyat avantajı var mı?',
        a: 'Evet. 5 kWp ve üzeri sistemler ile kurumsal alımlarda özel fiyatlandırma uygulanmaktadır. Toplu Sipariş ve B2B formumuzdan talebinizi iletebilir, uzman ekibimizden projenize özel teklif alabilirsiniz.',
      },
    ],
  },
  {
    category: 'Bakım & Garanti',
    items: [
      {
        q: 'Paneller ne sıklıkla temizlenmeli?',
        a: 'Yılda 2-3 kez temizleme önerilir. Toz, kuş pisliği ve yaprak gibi kirler yüzeyde birikirse üretim %10-25 düşebilir. Sabahın erken saatlerinde veya akşamüstü ılık suyla ve yumuşak bezle temizlik yapabilirsiniz. Kimyasal temizleyicilerden kaçının.',
      },
      {
        q: 'Sistemi kim bakıyor?',
        a: 'Adalya Solar tüm kurduğu sistemler için yıllık teknik bakım paketi sunmaktadır. Bakım kapsamında inverter güncelleme, topraklama ölçümü, kablo kontrolü ve verimlilik raporu yer alır. Bakım anlaşması kurulum sözleşmenize eklenebilir.',
      },
      {
        q: 'Garanti kapsamı nedir?',
        a: 'Ürün garantileri markaya göre değişir: Paneller 10-15 yıl ürün garantisi + 25-30 yıl güç garantisi; inverterler 5-10 yıl. İşçilik ve montaj garantisi Adalya Solar tarafından 2 yıl verilmektedir. Tüm garanti belgelerini sistemin tesliminde yazılı olarak sunuyoruz.',
      },
    ],
  },
];

export default function SSSPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B3A6B] via-[#2d5282] to-[#1B3A6B] text-white py-16 px-4 text-center">
        <span className="inline-block bg-orange-500/20 border border-orange-400/30 text-orange-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
          Yardım Merkezi
        </span>
        <h1 className="text-4xl font-extrabold mb-3">Sıkça Sorulan Sorular</h1>
        <p className="text-gray-300 max-w-xl mx-auto text-sm leading-relaxed mb-6">
          Güneş enerjisi sistemi hakkında merak ettiğiniz her şey burada.
          Bulamadığınız sorunuz için bizimle iletişime geçin.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/iletisim"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2"
          >
            Soru Sor <ChevronRight size={15} />
          </Link>
          <Link
            href="/hesaplayici"
            className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            Tasarruf Hesapla
          </Link>
        </div>
      </section>

      {/* Category jump links */}
      <div className="bg-white border-b border-gray-100 sticky top-[72px] z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto py-3">
          {faqs.map((section) => (
            <a
              key={section.category}
              href={`#${section.category}`}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold text-gray-500 hover:bg-orange-50 hover:text-orange-500 transition-colors"
            >
              {section.category}
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-14 space-y-14">
        {faqs.map((section) => (
          <section key={section.category} id={section.category}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                <HelpCircle size={18} className="text-orange-500" />
              </div>
              <h2 className="text-xl font-extrabold text-[#1B3A6B]">{section.category}</h2>
            </div>

            <div className="space-y-3">
              {section.items.map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </section>
        ))}

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#1B3A6B] to-[#2d5282] rounded-2xl p-8 text-white text-center">
          <h3 className="text-xl font-extrabold mb-2">Sorunuzu Bulamadınız mı?</h3>
          <p className="text-gray-300 text-sm mb-6">
            Uzman ekibimiz hafta içi 09:00 - 18:00 arasında sorularınızı yanıtlamaya hazır.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/iletisim"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              İletişime Geç
            </Link>
            <Link
              href="/kurumsal"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              Kurumsal Teklif Al
            </Link>
            <Link
              href="/blog"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              Blog Rehberleri
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none select-none">
        <span className="font-semibold text-[#1B3A6B] text-sm leading-snug">{q}</span>
        <ChevronDown
          size={18}
          className="text-orange-400 shrink-0 group-open:rotate-180 transition-transform duration-200"
        />
      </summary>
      <div className="px-6 pb-5">
        <div className="border-t border-gray-100 pt-4">
          <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
        </div>
      </div>
    </details>
  );
}
