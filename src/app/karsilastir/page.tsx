'use client';

import { useCompare } from '@/context/CompareContext';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingCart, GitCompare } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const specLabels: Record<string, string> = {
  boyutlar: 'Boyutlar', agirlik: 'Ağırlık', garantiSuresi: 'Garanti',
  kullanomru: 'Kullanım Ömrü', uretimYili: 'Üretim Yılı', calismaScakligi: 'Çalışma Sıcaklığı',
};

export default function ComparePage() {
  const { items, remove, clear } = useCompare();
  const { addToCart } = useCart();

  if (items.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-20 text-center">
        <GitCompare size={60} className="mx-auto text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Karşılaştırma Listesi Boş</h2>
        <p className="text-gray-500 mb-6">Ürün listesinde karşılaştır butonuna tıklayarak ürün ekleyin.</p>
        <Link href="/urunler" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors">
          Ürünlere Git
        </Link>
      </main>
    );
  }

  const allSpecKeys = Array.from(new Set(items.flatMap(p => Object.keys(p.specs ?? {})))).filter(k => k !== 'sertifikalar');

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-[#1B3A6B]">Ürün Karşılaştırma</h1>
        <button onClick={clear} className="text-sm text-red-400 hover:text-red-600 font-semibold">Listeyi Temizle</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <td className="w-40 p-3 text-sm font-bold text-gray-400 uppercase">Özellik</td>
              {items.map(p => (
                <td key={p.id} className="p-3 min-w-[220px]">
                  <div className="bg-white rounded-2xl border border-gray-100 p-4 relative">
                    <button onClick={() => remove(p.id)} className="absolute top-2 right-2 text-gray-300 hover:text-red-400 transition-colors">
                      <X size={16} />
                    </button>
                    <div className="relative w-full h-36 rounded-xl overflow-hidden bg-gray-50 mb-3">
                      <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="220px" />
                    </div>
                    <p className="text-xs text-orange-500 font-semibold">{p.brand}</p>
                    <Link href={`/urunler/${p.slug}`} className="text-sm font-bold text-[#1B3A6B] hover:text-orange-500 line-clamp-2 block mb-2">
                      {p.name}
                    </Link>
                    <p className="text-xl font-extrabold text-[#1B3A6B] mb-3">{p.price.toLocaleString('tr-TR')} ₺</p>
                    <button
                      onClick={() => addToCart(p)}
                      disabled={p.stock === 0}
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold py-2 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <ShoppingCart size={14} />Sepete Ekle
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { key: 'price', label: 'Fiyat', render: (p: typeof items[0]) => `${p.price.toLocaleString('tr-TR')} ₺` },
              { key: 'brand', label: 'Marka', render: (p: typeof items[0]) => p.brand },
              { key: 'stock', label: 'Stok', render: (p: typeof items[0]) => p.stock > 0 ? <span className="text-green-600 font-semibold">Mevcut ({p.stock})</span> : <span className="text-red-500 font-semibold">Tükendi</span> },
              { key: 'rating', label: 'Puan', render: (p: typeof items[0]) => `${p.rating} / 5` },
            ].map(row => (
              <tr key={row.key} className="border-t border-gray-100">
                <td className="p-3 text-sm font-semibold text-gray-500">{row.label}</td>
                {items.map(p => (
                  <td key={p.id} className="p-3 text-sm text-gray-700">{row.render(p)}</td>
                ))}
              </tr>
            ))}
            {allSpecKeys.map(key => (
              <tr key={key} className="border-t border-gray-100">
                <td className="p-3 text-sm font-semibold text-gray-500">{specLabels[key] || key}</td>
                {items.map(p => (
                  <td key={p.id} className="p-3 text-sm text-gray-700">{String(p.specs[key as keyof typeof p.specs] ?? '-')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
