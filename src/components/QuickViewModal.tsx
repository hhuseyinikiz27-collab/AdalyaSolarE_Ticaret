'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingCart, Star, Check, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';

interface Props {
  product: Product;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: Props) {
  const { addToCart } = useCart();
  const { isFavorite, toggle } = useFavorites();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAdd = () => {
    if (added || product.stock === 0) return;
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col sm:flex-row">
          {/* Image */}
          <div className="sm:w-80 shrink-0 relative bg-gray-50 rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none overflow-hidden">
            <div className="relative h-64 sm:h-full min-h-64">
              <Image
                src={product.images[imgIdx] || product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="320px"
              />
              {discount > 0 && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  -{discount}%
                </span>
              )}
              {product.images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + product.images.length) % product.images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % product.images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 shadow">
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs text-orange-500 font-semibold">{product.brand}</p>
                <h2 className="text-lg font-bold text-[#1B3A6B] leading-snug mt-0.5">{product.name}</h2>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 shrink-0 ml-3">
                <X size={20} />
              </button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={13} className={i < Math.floor(product.rating) ? 'fill-orange-400 text-orange-400' : 'text-gray-300'} />
              ))}
              {product.reviewCount > 0 && <span className="text-xs text-gray-500">({product.reviewCount})</span>}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-extrabold text-[#1B3A6B]">{product.price.toLocaleString('tr-TR')} ₺</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through">{product.originalPrice.toLocaleString('tr-TR')} ₺</span>
              )}
            </div>

            {/* Stock */}
            <p className="text-xs mb-4">
              {product.stock > 10
                ? <span className="text-green-600 font-medium">✓ In Stock</span>
                : product.stock > 0
                ? <span className="text-orange-500 font-medium">⚠ Only {product.stock} left</span>
                : <span className="text-red-500 font-medium">✗ Out of Stock</span>
              }
            </p>

            <p className="text-sm text-gray-500 leading-relaxed mb-5 line-clamp-3">{product.shortDescription}</p>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm font-semibold text-gray-600">Qty:</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-1.5 hover:bg-gray-50">−</button>
                  <span className="px-4 font-bold text-sm">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-1.5 hover:bg-gray-50">+</button>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-auto">
              <button
                onClick={handleAdd}
                disabled={product.stock === 0}
                className={`flex-1 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all ${
                  added ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white'
                }`}
              >
                {added ? <Check size={16} /> : <ShoppingCart size={16} />}
                {added ? 'Added!' : 'Add to Cart'}
              </button>
              <button
                onClick={() => toggle(product.id)}
                className={`p-2.5 rounded-xl border-2 transition-colors ${isFavorite(product.id) ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-red-300'}`}
              >
                <Heart size={16} className={isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
              </button>
            </div>

            <Link href={`/urunler/${product.slug}`} className="text-center text-xs text-orange-500 hover:text-orange-600 mt-3 underline">
              View product details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
