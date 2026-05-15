'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star, Heart, Check } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';

interface Props {
  product: Product;
}

export default function ProductListRow({ product }: Props) {
  const { addToCart } = useCart();
  const { isFavorite, toggle: toggleFav } = useFavorites();
  const [added, setAdded] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 flex gap-4 p-4 group">
      {/* Image */}
      <Link href={`/urunler/${product.slug}`} className="relative w-32 h-32 shrink-0 rounded-xl overflow-hidden bg-gray-50">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="128px"
        />
        {discount > 0 && (
          <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 min-w-0 flex-col sm:flex-row gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-orange-500 font-semibold mb-0.5">{product.brand}</p>
          <Link href={`/urunler/${product.slug}`}>
            <h3 className="font-semibold text-[#1B3A6B] text-sm leading-snug hover:text-orange-500 transition-colors line-clamp-2 mb-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{product.shortDescription}</p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-1.5">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  className={i < Math.floor(product.rating) ? 'fill-orange-400 text-orange-400' : 'text-gray-300'}
                />
              ))}
            </div>
            {product.reviewCount > 0 && (
              <span className="text-xs text-gray-500">({product.reviewCount})</span>
            )}
          </div>

          {/* Stock */}
          <p className="text-xs">
            {product.stock > 10
              ? <span className="text-green-600 font-medium">✓ In Stock</span>
              : product.stock > 0
              ? <span className="text-orange-500 font-medium">⚠ Only {product.stock} left</span>
              : <span className="text-red-500 font-medium">✗ Out of Stock</span>
            }
          </p>
        </div>

        {/* Price + Actions */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-xl font-extrabold text-[#1B3A6B]">
              {product.price.toLocaleString('tr-TR')} ₺
            </p>
            {product.originalPrice && (
              <p className="text-xs text-gray-400 line-through">
                {product.originalPrice.toLocaleString('tr-TR')} ₺
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.preventDefault(); toggleFav(product.id); }}
              className="p-2 rounded-xl border-2 border-gray-200 hover:border-red-300 transition-colors"
            >
              <Heart
                size={15}
                className={isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}
              />
            </button>
            <button
              onClick={() => {
                if (added || product.stock === 0) return;
                addToCart(product);
                setAdded(true);
                setTimeout(() => setAdded(false), 1800);
              }}
              disabled={product.stock === 0}
              className={`flex items-center gap-1.5 font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-300 ${
                added
                  ? 'bg-green-500 text-white scale-95'
                  : 'bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white'
              }`}
            >
              {added ? <Check size={14} /> : <ShoppingCart size={14} />}
              {added ? 'Added!' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
