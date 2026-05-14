'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Clock } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { api } from '@/lib/api';
import { Product } from '@/types';
import { toProduct } from '@/lib/productMapper';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useLang } from '@/context/LanguageContext';

export function FeaturedProductsSection() {
  const { t } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const load = () =>
      api.products.getFeatured().then((data) => setProducts(data.map(toProduct))).catch(() => setFailed(true)).finally(() => setLoading(false));
    load();
    const interval = setInterval(load, 60_000);
    window.addEventListener('product-changed', load);
    return () => { clearInterval(interval); window.removeEventListener('product-changed', load); };
  }, []);

  if (failed) return null;
  if (!loading && products.length === 0) return null;

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1B3A6B]">{t('featuredProducts')}</h2>
          </div>
          <Link
            href="/urunler"
            className="text-orange-500 hover:text-orange-600 flex items-center gap-1 text-sm font-semibold"
          >
            {t('viewAll')} <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function RecentlyViewedSection() {
  const { t } = useLang();
  const { ids } = useRecentlyViewed();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    Promise.all(ids.map((id) => api.products.getById(id).catch(() => null)))
      .then((results) => setProducts(results.filter(Boolean).map((p) => toProduct(p!))))
      .finally(() => setLoading(false));
  }, [ids.join(',')]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-orange-500" />
          <h2 className="text-xl font-extrabold text-[#1B3A6B]">{t('recentlyViewed')}</h2>
        </div>
        <Link href="/urunler" className="text-orange-500 hover:text-orange-600 flex items-center gap-1 text-sm font-semibold">
          {t('allProducts')} <ChevronRight size={16} />
        </Link>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-56 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

export function NewProductsSection() {
  const { t } = useLang();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const load = () =>
      api.products.getAll().then((data) => { setProducts(data.filter((p) => p.isNew).slice(0, 3).map(toProduct)); }).catch(() => setFailed(true)).finally(() => setLoading(false));
    load();
    const interval = setInterval(load, 60_000);
    window.addEventListener('product-changed', load);
    return () => { clearInterval(interval); window.removeEventListener('product-changed', load); };
  }, []);

  if (failed) return null;
  if (!loading && products.length === 0) return null;

  return (
    <section className="bg-[#1B3A6B] py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-white">{t('newArrivals')}</h2>
          </div>
          <Link
            href="/urunler"
            className="text-orange-400 hover:text-orange-300 flex items-center gap-1 text-sm font-semibold"
          >
            {t('viewAll')} <ChevronRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#2d5282] rounded-2xl h-72 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
