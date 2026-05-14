'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Layers, Check } from 'lucide-react';
import { api, ApiBundle } from '@/lib/api';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5207';
const toAbsolute = (url: string) => url && !url.startsWith('http') ? `${BASE_URL}${url}` : url;
const FALLBACK = 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=48&h=48&fit=crop';

export default function BundlesPage() {
  const [bundles, setBundles] = useState<ApiBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [added, setAdded] = useState<number | null>(null);

  useEffect(() => {
    api.bundles.getAll()
      .then(setBundles)
      .finally(() => setLoading(false));
  }, []);

  const handleAddBundle = (bundle: ApiBundle) => {
    bundle.items.forEach(item => {
      addToCart({
        id: item.productId,
        name: item.productName,
        price: item.productPrice,
        images: [item.productImageUrl],
        slug: '',
        category: 'gunes-panelleri',
        brand: '',
        model: '',
        stock: 99,
        rating: 0,
        reviewCount: 0,
        description: '',
        shortDescription: '',
        specs: { boyutlar: '', agirlik: '', garantiSuresi: '', kullanomru: '', uretimYili: '', calismaScakligi: '', sertifikalar: [] },
        tags: [],
        isNew: false,
        isFeatured: false,
      } as Product, item.quantity);
    });
    setAdded(bundle.id);
    setTimeout(() => setAdded(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-2">
          <Layers size={28} className="text-orange-500" />
          <h1 className="text-3xl font-extrabold text-[#1B3A6B]">Bundle &amp; Paketler</h1>
        </div>
        <p className="text-gray-500 mb-10">Birden fazla ürünü bir arada alarak tasarruf edin.</p>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse" />)}
          </div>
        ) : bundles.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Layers size={48} className="mx-auto mb-4 text-gray-200" />
            <p className="text-lg font-semibold">Henüz aktif paket bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bundles.map(bundle => {
              const discount = bundle.originalPrice > 0
                ? Math.round((1 - bundle.bundlePrice / bundle.originalPrice) * 100)
                : 0;
              const isAdded = added === bundle.id;
              return (
                <div key={bundle.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-xl font-extrabold text-[#1B3A6B]">{bundle.name}</h2>
                    {discount > 0 && (
                      <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shrink-0 ml-2">
                        %{discount} Tasarruf
                      </span>
                    )}
                  </div>
                  {bundle.description && (
                    <p className="text-sm text-gray-500 mb-4">{bundle.description}</p>
                  )}

                  {/* Items */}
                  <div className="space-y-2 mb-5 flex-1">
                    {bundle.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <img
                            src={toAbsolute(item.productImageUrl) || FALLBACK}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.src = FALLBACK; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#1B3A6B] truncate">{item.productName}</p>
                          <p className="text-xs text-gray-400">{item.productPrice.toLocaleString('tr-TR')} ₺{item.quantity > 1 ? ` × ${item.quantity}` : ''}</p>
                        </div>
                        <p className="text-sm font-bold text-[#1B3A6B] shrink-0">
                          {(item.productPrice * item.quantity).toLocaleString('tr-TR')} ₺
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Price + CTA */}
                  <div className="border-t pt-4">
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-extrabold text-[#1B3A6B]">
                        {bundle.bundlePrice.toLocaleString('tr-TR')} ₺
                      </span>
                      {bundle.originalPrice > bundle.bundlePrice && (
                        <span className="text-sm text-gray-400 line-through">
                          {bundle.originalPrice.toLocaleString('tr-TR')} ₺
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddBundle(bundle)}
                      className={`w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-300 ${
                        isAdded
                          ? 'bg-green-500 text-white scale-95'
                          : 'bg-orange-500 hover:bg-orange-600 text-white'
                      }`}
                    >
                      {isAdded ? <Check size={16} /> : <ShoppingCart size={16} />}
                      {isAdded ? 'Sepete Eklendi!' : 'Paketi Sepete Ekle'}
                    </button>
                    <p className="text-xs text-gray-400 text-center mt-2">
                      Ürünler ayrı ayrı sepete eklenir ve sipariş özetinizde gösterilir.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
