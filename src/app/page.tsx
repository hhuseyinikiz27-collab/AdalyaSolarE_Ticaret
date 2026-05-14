'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Phone, Mail } from 'lucide-react';
import { categories as staticCategories } from '@/data/products';
import { FeaturedProductsSection, NewProductsSection, RecentlyViewedSection } from '@/components/HomeProductSections';
import HeroSlider from '@/components/HeroSlider';
import HomeStats from '@/components/HomeStats';
import { useLang } from '@/context/LanguageContext';

type CatItem = { slug: string; name: string; icon: string; description: string };

const whyFeatures = [
  { icon: '🛠️', title: 'Mühendislik Odaklı Yaklaşım', desc: 'Her ürün teknik standartlara göre seçilir. Verimlilikten ödün vermeden en doğru çözümü sunuyoruz.' },
  { icon: '🔑', title: 'Anahtar Teslim Projeler', desc: 'Projenizi bütünüyle üstleniyoruz. Siz sadece kapıyı teslim alın, gerisini biz halledelim.' },
  { icon: '📈', title: 'Yüksek Verimlilik Garantisi', desc: 'Doğru ekipman seçimi ve sistem tasarımıyla %90+ verimlilik oranı hedefliyoruz.' },
  { icon: '🤝', title: 'Uzun Vadeli Teknik Destek', desc: 'Kurulum sonrası bakım ve destek hizmetleriyle yatırımınızın değerini koruyoruz.' },
];

const whyStats = [
  { num: '4-6', unit: ' yıl', label: 'Geri Ödeme' },
  { num: '25', unit: ' yıl', label: 'Panel Garantisi' },
  { num: '%90', unit: '+', label: 'Verimlilik' },
  { num: '0 ₺', unit: '', label: '1. Yıl Bakım' },
];

export default function Home() {
  const { t } = useLang();
  const [categories, setCategories] = useState<CatItem[]>(staticCategories);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5207';
    fetch(`${base}/api/categories`)
      .then(r => r.ok ? r.json() : staticCategories)
      .then((data: CatItem[]) => { if (data.length > 0) setCategories(data); })
      .catch(() => {});
  }, []);

  return (
    <main>
      {/* Hero Slider */}
      <HeroSlider />

      {/* Stats */}
      <HomeStats />

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-extrabold text-[#1B3A6B]">{t('categories')}</h2>
          <Link href="/urunler" className="text-orange-500 hover:text-orange-600 flex items-center gap-1 text-sm font-semibold">
            {t('allProducts')} <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/urunler?kategori=${cat.slug}`}
              className="group bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-lg border border-gray-100 hover:border-orange-300 transition-all"
            >
              <div className="text-5xl mb-3">{cat.icon}</div>
              <h3 className="font-bold text-[#1B3A6B] group-hover:text-orange-500 transition-colors text-sm">
                {cat.name}
              </h3>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed hidden sm:block">
                {(cat.description || '').slice(0, 50)}{(cat.description?.length ?? 0) > 50 ? '...' : ''}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <FeaturedProductsSection />

      {/* Why Us — dark theme */}
      <section className="bg-[#0d1f3d] py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            {/* Left */}
            <div>
              <span className="inline-block border border-orange-400/50 text-orange-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 bg-orange-400/10">
                Neden Adalya Solar?
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
                Enerjinizi Gidere Değil,<br />
                <span style={{ color: '#FFB347' }}>Yatırıma</span> Dönüştürün
              </h2>
              <p className="text-white/55 mb-8">
                Elektrik maliyetlerinizi sabitleyen, uzun vadede kazanç sağlayan anahtar teslim çatı GES projeleri sunuyoruz.
              </p>
              <div className="flex flex-col gap-4">
                {whyFeatures.map(({ icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4 bg-white/5 hover:bg-white/8 border border-white/10 rounded-2xl p-4 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-xl shrink-0">
                      {icon}
                    </div>
                    <div>
                      <h6 className="font-bold text-white mb-0.5">{title}</h6>
                      <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right */}
            <div
              className="rounded-2xl p-6 lg:p-8"
              style={{ background: 'linear-gradient(135deg,rgba(247,148,29,.12),rgba(247,148,29,.03))', border: '1px solid rgba(247,148,29,.22)' }}
            >
              <h4 className="text-xl font-extrabold text-white mb-2">Yatırımınız Ne Zaman Geri Döner?</h4>
              <p className="text-white/55 mb-6">Ortalama bir villa projesi için geri ödeme süresi 4–6 yıl. Sonrasında 25 yıl boyunca tam kâr.</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {whyStats.map(({ num, unit, label }) => (
                  <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-extrabold text-orange-400">
                      {num}<span className="text-lg text-white/50">{unit}</span>
                    </div>
                    <div className="text-xs text-white/40 mt-1">{label}</div>
                  </div>
                ))}
              </div>
              <Link
                href="/hesaplayici"
                className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl text-center transition-colors"
              >
                Hesaplama Yaptır →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Products */}
      <NewProductsSection />

      {/* Recently Viewed */}
      <RecentlyViewedSection />

      {/* Calculator CTA */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-[#1B3A6B] to-[#2d5282] rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-white">
          <div>
            <p className="text-green-300 text-sm font-semibold mb-1">{t('freeCalcBadge')}</p>
            <h3 className="text-2xl font-extrabold mb-1">{t('freeCalcTitle')}</h3>
            <p className="text-gray-300 text-sm">{t('freeCalcSub')}</p>
          </div>
          <Link
            href="/hesaplayici"
            className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-3.5 rounded-xl flex items-center gap-2 transition-colors text-sm whitespace-nowrap"
          >
            {t('calculate')}
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* CTA Banner — source style */}
      <section className="py-8 max-w-7xl mx-auto px-4 pb-16">
        <div className="rounded-3xl p-10 lg:p-14" style={{ background: 'linear-gradient(135deg,#1B2D5E,#2a4a8a)' }}>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-block border border-white/30 text-white/80 text-sm font-semibold px-4 py-1.5 rounded-full mb-4 bg-white/10">
                Hemen Başlayın
              </span>
              <h2 className="text-3xl font-extrabold text-white mb-3">
                Güneş Enerjisine<br />
                <span style={{ color: '#FFD166' }}>Geçmenin</span> Tam Zamanı
              </h2>
              <p className="text-white/60">
                Ücretsiz keşif hizmetimizden yararlanın. Uzmanlarımız sisteminizi tasarlasın, siz sadece tasarruf edin.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/iletisim"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl text-center transition-colors flex items-center justify-center gap-2"
              >
                <Phone size={18} />
                Ücretsiz Keşif İste
              </Link>
              <a
                href="mailto:info@adalyasolar.com"
                className="border-2 border-white/30 hover:border-orange-400 text-white font-bold py-4 rounded-xl text-center transition-colors flex items-center justify-center gap-2"
              >
                <Mail size={18} />
                info@adalyasolar.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
