'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Star, Eye, Heart, GitCompare, Check } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useCompare } from '@/context/CompareContext';
import QuickViewModal from '@/components/QuickViewModal';
import FlashSaleCountdown from '@/components/FlashSaleCountdown';
import { useLang } from '@/context/LanguageContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isFavorite, toggle: toggleFav } = useFavorites();
  const { add: addToCompare, remove: removeFromCompare, isIn: isInCompare, items: compareItems } = useCompare();
  const { t, lang } = useLang();
  const [countOffset, setCountOffset] = useState(0);
  const [added, setAdded] = useState(false);
  const [quickView, setQuickView] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    const wasFav = isFavorite(product.id);
    setCountOffset((o) => o + (wasFav ? -1 : 1));
    toggleFav(product.id);
  };
  const isFlashActive = !!(product.flashSalePrice && product.flashSaleEndsAt && new Date(product.flashSaleEndsAt) > new Date());
  const displayPrice = isFlashActive ? product.flashSalePrice! : product.price;
  const displayOriginal = isFlashActive ? product.price : product.originalPrice;
  const discount = displayOriginal
    ? Math.round(((displayOriginal - displayPrice) / displayOriginal) * 100)
    : 0;

  return (
    <>
    {quickView && <QuickViewModal product={product} onClose={() => setQuickView(false)} />}
    <div className={`bg-white rounded-2xl transition-all duration-300 group overflow-hidden flex flex-col ${
      isFlashActive
        ? 'border-2 border-red-400 shadow-[0_0_18px_2px_rgba(239,68,68,0.25)] hover:shadow-[0_0_28px_4px_rgba(239,68,68,0.35)]'
        : 'border border-gray-100 shadow-sm hover:shadow-xl'
    }`}>
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50 h-52">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount > 0 && (
            isFlashActive ? (
              <span className="relative flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-400 rounded-full animate-ping opacity-75" />
                ⚡ -{discount}%
              </span>
            ) : (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                -{discount}%
              </span>
            )
          )}
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              NEW
            </span>
          )}
        </div>
        {/* Favorite button + count */}
        <button
          onClick={handleToggle}
          className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white rounded-full px-2 py-1 shadow-sm hover:scale-105 transition-transform"
        >
          <Heart
            size={13}
            className={isFavorite(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}
          />
          <span className="text-xs font-semibold text-gray-600">{(product.favoriteCount ?? 0) + countOffset}</span>
        </button>
        {/* Flash sale countdown */}
        {isFlashActive && (
          <FlashSaleCountdown endsAt={product.flashSaleEndsAt!} price={product.flashSalePrice!} originalPrice={product.price} size="sm" />
        )}
        {/* Quick view overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={e => { e.preventDefault(); setQuickView(true); }}
            className="bg-white text-[#1B3A6B] font-semibold px-3 py-2 rounded-full flex items-center gap-1.5 text-sm hover:bg-orange-500 hover:text-white transition-colors shadow"
          >
            <Eye size={14} />
            {t('quickView')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-orange-500 font-semibold mb-1">{product.brand}</p>
        <Link href={`/urunler/${product.slug}`}>
          <h3 className="font-semibold text-[#1B3A6B] text-sm leading-snug mb-2 hover:text-orange-500 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.floor(product.rating) ? 'fill-orange-400 text-orange-400' : 'text-gray-300'}
              />
            ))}
          </div>
          {product.reviewCount > 0 && (
            <span className="text-xs text-gray-500">({product.reviewCount})</span>
          )}
        </div>

        {/* Stock */}
        <p className="text-xs text-gray-400 mb-3">
          {product.stock > 10
            ? <span className="text-green-600 font-medium">✓ {t('inStock')}</span>
            : product.stock > 0
            ? <span className="text-orange-500 font-medium">⚠ Only {product.stock} {t('lastItems')}</span>
            : <span className="text-red-500 font-medium">✗ {t('outOfStock')}</span>
          }
        </p>

        <div className="mt-auto">
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className={`text-xl font-extrabold ${isFlashActive ? 'text-red-600' : 'text-[#1B3A6B]'}`}>
              {displayPrice.toLocaleString('tr-TR')} ₺
            </span>
            {displayOriginal && (
              <span className="text-sm text-gray-400 line-through">
                {displayOriginal.toLocaleString('tr-TR')} ₺
              </span>
            )}
          </div>

          {/* Add to cart + compare */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (added || product.stock === 0) return;
                addToCart(product);
                setAdded(true);
                setTimeout(() => setAdded(false), 1800);
              }}
              disabled={product.stock === 0}
              className={`flex-1 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm transition-all duration-300 ${
                added
                  ? 'bg-green-500 text-white scale-95'
                  : 'bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white'
              }`}
            >
              {added ? <Check size={16} /> : <ShoppingCart size={16} />}
              {added ? t('addedToCart') : t('addToCart')}
            </button>
            <button
              onClick={(e) => { e.preventDefault(); isInCompare(product.id) ? removeFromCompare(product.id) : addToCompare(product); }}
              disabled={!isInCompare(product.id) && compareItems.length >= 3}
              title={isInCompare(product.id) ? t('removeFromCompare') : t('compare')}
              className={`p-2.5 rounded-xl border-2 transition-colors disabled:opacity-40 ${
                isInCompare(product.id)
                  ? 'border-orange-500 bg-orange-50 text-orange-500'
                  : 'border-gray-200 text-gray-400 hover:border-orange-300 hover:text-orange-400'
              }`}
            >
              <GitCompare size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
