'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Truck, Headphones, Award, ChevronRight } from 'lucide-react';
import { categories as staticCategories } from '@/data/products';
import { FeaturedProductsSection, NewProductsSection, RecentlyViewedSection } from '@/components/HomeProductSections';
import { useLang } from '@/context/LanguageContext';

type CatItem = { slug: string; name: string; icon: string; description: string };

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

  const whyItems = [
    { icon: <Shield className="text-orange-500" size={36} />, title: t('whyWarrantyTitle'), desc: t('whyWarrantyDesc') },
    { icon: <Truck className="text-orange-500" size={36} />, title: t('whyDeliveryTitle'), desc: t('whyDeliveryDesc') },
    { icon: <Headphones className="text-orange-500" size={36} />, title: t('whySupportTitle'), desc: t('whySupportDesc') },
    { icon: <Award className="text-orange-500" size={36} />, title: t('whyPriceTitle'), desc: t('whyPriceDesc') },
  ];

  const stats: [string, string][] = [
    ['10.000+', t('statInstallations')],
    ['500+', t('statBrands')],
    ['%98', t('statSatisfaction')],
    ['25 Years', t('statWarranty')],
  ];

  return (
    <main>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1B3A6B] via-[#2d5282] to-[#1B3A6B] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-96 h-96 bg-orange-400 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-20 w-64 h-64 bg-orange-300 rounded-full blur-2xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block bg-orange-500/20 border border-orange-400/40 text-orange-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              {t('heroBadge')}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              {t('heroTitle1')}
              <span className="block text-orange-400">{t('heroTitle2')}</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto lg:mx-0">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link
                href="/urunler"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl flex items-center gap-2 transition-colors text-lg"
              >
                {t('exploreProducts')}
                <ArrowRight size={20} />
              </Link>
              <Link
                href="https://adalyasolar.com"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white/30 hover:border-orange-400 text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-lg"
              >
                {t('freeConsultancy')}
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-12 justify-center lg:justify-start">
              {stats.map(([val, label]) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-extrabold text-orange-400">{val}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="relative w-72 h-72 sm:w-96 sm:h-96">
              <Image
                src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=600&fit=crop"
                alt="Solar Panel"
                fill
                className="object-cover rounded-2xl shadow-2xl"
                sizes="(max-width: 768px) 288px, 384px"
              />
              <div className="absolute -bottom-4 -right-4 bg-orange-500 text-white p-4 rounded-xl shadow-lg">
                <p className="text-xs font-medium">{t('monthlySaving')}</p>
                <p className="text-2xl font-extrabold">2.500 ₺</p>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* Why Us */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-extrabold text-[#1B3A6B] text-center mb-12">
          {t('whyUs')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyItems.map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="flex justify-center mb-4">{item.icon}</div>
              <h3 className="font-bold text-[#1B3A6B] mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
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

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl p-10 text-center text-white">
          <h2 className="text-3xl font-extrabold mb-3">{t('ctaTitle')}</h2>
          <p className="text-orange-100 mb-6 max-w-xl mx-auto">{t('ctaDesc')}</p>
          <Link
            href="https://adalyasolar.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-orange-600 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors"
          >
            {t('ctaBtn')}
          </Link>
        </div>
      </section>
    </main>
  );
}
