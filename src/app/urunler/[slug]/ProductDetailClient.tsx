'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ShoppingCart, Star, Shield, Truck, ChevronRight, ChevronLeft, X,
  Plus, Minus, Heart, Share2, CheckCircle, Package, Download
} from 'lucide-react';
import { categories } from '@/data/products';
import { api, ApiReview, ApiProductQuestion, ApiProductVariant, ApiProductDocument } from '@/lib/api';
import { Product, Category } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import ProductCard from '@/components/ProductCard';
import FlashSaleCountdown from '@/components/FlashSaleCountdown';
import { ThumbsUp } from 'lucide-react';
import { toProduct, slugToProductId } from '@/lib/productMapper';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useLang } from '@/context/LanguageContext';

interface Props {
  slug: string;
}

export default function ProductDetailClient({ slug }: Props) {
  const productId = slugToProductId(slug);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isFavorite, toggle: toggleFav } = useFavorites();
  const { t, lang } = useLang();
  const { ids: recentIds, track } = useRecentlyViewed();
  const [initFav, setInitFav] = useState<boolean | null>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFoundPage, setNotFoundPage] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [activeTab, setActiveTab] = useState<'specs' | 'description' | 'reviews' | 'qa' | 'docs'>('description');
  const [documents, setDocuments] = useState<ApiProductDocument[]>([]);
  const [added, setAdded] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyStatus, setNotifyStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [notifyMsg, setNotifyMsg] = useState('');

  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewPhotos, setReviewPhotos] = useState<File[]>([]);
  const [uploadingReviewPhotos, setUploadingReviewPhotos] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);

  // Q&A state
  const [questions, setQuestions] = useState<ApiProductQuestion[]>([]);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState('');

  // Variants state
  const [variants, setVariants] = useState<ApiProductVariant[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, ApiProductVariant>>({});

  useEffect(() => {
    if (isNaN(productId)) { setNotFoundPage(true); return; }

    track(productId);

    api.products.getById(productId)
      .then((data) => {
        setProduct(toProduct(data));
        setInitFav(null);
        api.reviews.getByProduct(productId)
          .then((reviewData) => { setReviews(reviewData); setReviewsLoaded(true); })
          .catch(() => setReviewsLoaded(true));
        api.questions.getByProduct(productId)
          .then((qs) => { setQuestions(qs); setQuestionsLoaded(true); })
          .catch(() => setQuestionsLoaded(true));
        api.products.getDocuments(productId)
          .then(setDocuments)
          .catch(() => {});
        api.products.getOrderCount(productId)
          .then((r) => setOrderCount(r.count))
          .catch(() => {});
        api.variants.getByProduct(productId)
          .then((vs) => {
            setVariants(vs);
            // Set defaults
            const groups = [...new Set(vs.map(v => v.groupName))];
            const defaults: Record<string, ApiProductVariant> = {};
            for (const g of groups) {
              const def = vs.find(v => v.groupName === g && v.isDefault) ?? vs.find(v => v.groupName === g);
              if (def) defaults[g] = def;
            }
            setSelectedVariants(defaults);
          })
          .catch(() => {});
        return api.products.getAll({ category: data.category });
      })
      .then((all) => {
        setRelated(
          all
            .filter((p) => p.id !== productId)
            .slice(0, 4)
            .map(toProduct)
        );
      })
      .catch(() => setNotFoundPage(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    const toFetch = recentIds.filter(rid => rid !== productId).slice(0, 4);
    if (toFetch.length === 0) { setRecentProducts([]); return; }
    Promise.all(toFetch.map(rid => api.products.getById(rid).then(toProduct).catch(() => null)))
      .then(results => setRecentProducts(results.filter(Boolean) as Product[]));
  }, [recentIds, slug]);

  // Poll reviews + Q&A every 30s so admin replies and new reviews appear automatically
  useEffect(() => {
    if (isNaN(productId)) return;
    const interval = setInterval(() => {
      api.reviews.getByProduct(productId).then(setReviews).catch(() => {});
      api.questions.getByProduct(productId).then(setQuestions).catch(() => {});
    }, 30_000);
    return () => clearInterval(interval);
  }, [productId]);

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') setSelectedImage((i) => (i + 1) % (product?.images.length ?? 1));
      if (e.key === 'ArrowLeft') setSelectedImage((i) => (i - 1 + (product?.images.length ?? 1)) % (product?.images.length ?? 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, product]);

  const handleToggleFav = async () => {
    if (!product) return;
    const wasFav = isFavorite(product.id);
    if (initFav === null) setInitFav(wasFav);
    await toggleFav(product.id);
    setProduct((p) => p ? { ...p, favoriteCount: (p.favoriteCount ?? 0) + (wasFav ? -1 : 1) } : p);
  };

  const handleLike = async (reviewId: number) => {
    if (!user) return;
    const result = await api.reviews.like(reviewId);
    setReviews((prev) =>
      prev.map((r) => r.id === reviewId ? { ...r, likeCount: result.likeCount, likedByMe: result.liked } : r)
    );
  };

  const handleSubmitReview = async () => {
    if (!user) return;
    if (!reviewForm.comment.trim()) { setReviewError(lang === 'en' ? 'Please write a comment.' : 'Lütfen bir yorum yazın.'); return; }
    setSubmittingReview(true);
    setReviewError('');
    try {
      const newReview = await api.reviews.create(productId, reviewForm.rating, reviewForm.comment);
      if (reviewPhotos.length > 0) {
        setUploadingReviewPhotos(true);
        try {
          const { photos } = await api.reviews.uploadPhotos(newReview.id, reviewPhotos);
          const withPhotos = { ...newReview, photosJson: JSON.stringify(photos) };
          setReviews((prev) => [withPhotos as ApiReview, ...prev]);
        } catch {
          setReviews((prev) => [newReview, ...prev]);
        } finally {
          setUploadingReviewPhotos(false);
        }
      } else {
        setReviews((prev) => [newReview, ...prev]);
      }
      setProduct((p) => {
        if (!p) return p;
        const newCount = p.reviewCount + 1;
        const newRating = Math.round(((p.rating * p.reviewCount + newReview.rating) / newCount) * 10) / 10;
        return { ...p, rating: newRating, reviewCount: newCount };
      });
      setReviewForm({ rating: 5, comment: '' });
      setReviewPhotos([]);
    } catch (e: unknown) {
      setReviewError(e instanceof Error ? e.message : (lang === 'en' ? 'Could not submit review.' : 'Yorum gönderilemedi.'));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (notFoundPage) notFound();

  if (loading || !product) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="bg-gray-100 rounded-2xl h-96 animate-pulse" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-10 animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  const category = categories.find((c) => c.slug === product.category);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Compute total price adjustment from selected variants
  const variantPriceAdjustment = Object.values(selectedVariants).reduce((sum, v) => sum + v.priceAdjustment, 0);
  const variantLabel = Object.values(selectedVariants).map(v => `${v.groupName}: ${v.value}`).join(', ');
  const variantGroups = variants.length > 0 ? [...new Set(variants.map(v => v.groupName))] : [];

  const handleAddToCart = () => {
    const basePrice = product.price + variantPriceAdjustment;
    const activeTier = product.volumeDiscounts
      ? [...product.volumeDiscounts].sort((a, b) => b.minQty - a.minQty).find(t => quantity >= t.minQty)
      : undefined;
    const effectivePrice = activeTier ? basePrice * (1 - activeTier.discountPct / 100) : basePrice;
    const productToAdd = (variantPriceAdjustment !== 0 || activeTier)
      ? { ...product, price: effectivePrice }
      : product;
    addToCart(productToAdd, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const specEntries = Object.entries(product.specs).filter(([key]) => key !== 'sertifikalar');

  const certsRaw = product.specs.sertifikalar as string | string[] | undefined;
  const certsArray: string[] = Array.isArray(certsRaw)
    ? certsRaw
    : typeof certsRaw === 'string' && certsRaw.trim()
      ? certsRaw.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

  const handlePrintSpecs = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    const certs = certsArray.join(', ');
    const rows = specEntries.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('');
    w.document.write(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
      <title>${product.name} — Technical Data</title>
      <style>
        body{font-family:Arial,sans-serif;padding:32px;color:#111;max-width:700px;margin:0 auto}
        h1{color:#1B3A6B;font-size:20px;margin-bottom:4px}
        .brand{color:#f97316;font-size:13px;font-weight:600;margin-bottom:16px}
        table{width:100%;border-collapse:collapse;margin-top:16px;font-size:14px}
        td{padding:8px 12px;border:1px solid #ddd}
        tr:nth-child(even) td{background:#f9f9f9}
        td:first-child{font-weight:600;color:#1B3A6B;width:180px}
        .certs{margin-top:12px;font-size:13px;color:#555}
        .footer{margin-top:32px;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:12px}
        @media print{body{padding:16px}}
      </style></head><body>
      <div class="brand">${product.brand}</div>
      <h1>${product.name}</h1>
      <table>${rows}</table>
      ${certs ? `<div class="certs"><strong>Certificates:</strong> ${certs}</div>` : ''}
      <div class="footer">Adalya Solar Energy · adalyasolar.com · Price: ₺${product.price.toLocaleString('tr-TR')}</div>
      </body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-orange-500">{lang === 'en' ? 'Home' : 'Ana Sayfa'}</Link>
        <ChevronRight size={14} />
        <Link href="/urunler" className="hover:text-orange-500">{lang === 'en' ? 'Products' : 'Ürünler'}</Link>
        <ChevronRight size={14} />
        <Link href={`/urunler?kategori=${product.category}`} className="hover:text-orange-500">
          {category?.name}
        </Link>
        <ChevronRight size={14} />
        <span className="text-orange-500 line-clamp-1">{product.name}</span>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
        {/* Images */}
        <div>
          <div
            className="relative h-80 sm:h-96 bg-gray-50 rounded-2xl overflow-hidden mb-3 cursor-zoom-in"
            onClick={() => setLightbox(true)}
          >
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {discount > 0 && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                -{discount}%
              </span>
            )}
            {product.isNew && (
              <span className="absolute top-3 right-3 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                {lang === 'en' ? 'NEW' : 'YENİ'}
              </span>
            )}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedImage((i) => (i - 1 + product.images.length) % product.images.length); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-1.5 shadow transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedImage((i) => (i + 1) % product.images.length); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-700 rounded-full p-1.5 shadow transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setSelectedImage(i); }}
                      className={`w-2 h-2 rounded-full transition-colors ${i === selectedImage ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? 'border-orange-500' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-orange-500 font-semibold">{product.brand}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B3A6B] mb-4 leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < Math.floor(product.rating) ? 'fill-orange-400 text-orange-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-gray-700">{product.rating}</span>
            <span className="text-sm text-gray-400">({product.reviewCount} {lang === 'en' ? 'reviews' : 'değerlendirme'})</span>
            <span className="flex items-center gap-1 text-sm text-gray-400 ml-2">
              <Heart size={14} className="fill-red-400 text-red-400" />
              {product.favoriteCount}
            </span>
          </div>

          {orderCount !== null && orderCount > 0 && (
            <p className="text-xs font-semibold text-green-700 bg-green-50 border border-green-100 rounded-full px-3 py-1 inline-flex items-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
              {lang === 'en' ? `${orderCount} people bought this in the last 30 days` : `Son 30 günde ${orderCount} kişi satın aldı`}
            </p>
          )}

          <p className="text-gray-600 leading-relaxed mb-6">{product.shortDescription}</p>

          {/* Price */}
          {/* Flash sale banner */}
          {product.flashSalePrice && product.flashSaleEndsAt && new Date(product.flashSaleEndsAt) > new Date() && (
            <div className="mb-4">
              <FlashSaleCountdown
                endsAt={product.flashSaleEndsAt}
                price={product.flashSalePrice + variantPriceAdjustment}
                originalPrice={product.price + variantPriceAdjustment}
                size="lg"
              />
            </div>
          )}

          <div className="bg-orange-50 rounded-2xl p-4 mb-6">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl font-extrabold text-[#1B3A6B]">
                {(product.price + variantPriceAdjustment).toLocaleString('tr-TR')} ₺
              </span>
              {product.originalPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {product.originalPrice.toLocaleString('tr-TR')} ₺
                </span>
              )}
              {variantPriceAdjustment !== 0 && (
                <span className="text-xs text-orange-500 font-semibold">
                  ({variantPriceAdjustment > 0 ? '+' : ''}{variantPriceAdjustment.toLocaleString('tr-TR')} ₺ varyant)
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">{t('vatIncluded')}</p>
            {/* Taksit bilgisi */}
            {(product.price + variantPriceAdjustment) >= 500 && (() => {
              const total = product.price + variantPriceAdjustment;
              const installments = total >= 5000 ? 12 : total >= 2000 ? 6 : 3;
              const monthly = total / installments;
              return (
                <p className="text-xs text-green-700 font-semibold mt-2 bg-green-50 px-3 py-1.5 rounded-lg inline-block">
                  {installments} installments starting from ₺{monthly.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}/month
                </p>
              );
            })()}

            {/* Toplu sipariş indirimi */}
            {product.volumeDiscounts && product.volumeDiscounts.length > 0 && (
              <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <p className="text-xs font-bold text-blue-700 mb-2">{t('bulkDiscount')}</p>
                <div className="flex flex-wrap gap-2">
                  {[...product.volumeDiscounts]
                    .sort((a, b) => a.minQty - b.minQty)
                    .map(tier => {
                      const isActive = quantity >= tier.minQty;
                      return (
                        <span
                          key={tier.minQty}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-blue-600 border border-blue-200'
                          }`}
                        >
                          {lang === 'en' ? `${tier.minQty}+ units → ${tier.discountPct}% off` : `${tier.minQty}+ adet → %${tier.discountPct} indirim`}
                        </span>
                      );
                    })}
                </div>
                {(() => {
                  const activeTier = [...product.volumeDiscounts]
                    .sort((a, b) => b.minQty - a.minQty)
                    .find(t => quantity >= t.minQty);
                  if (!activeTier) return null;
                  const discountedPrice = (product.price + variantPriceAdjustment) * (1 - activeTier.discountPct / 100);
                  return (
                    <p className="text-xs text-blue-700 mt-1.5 font-semibold">
                      {lang === 'en'
                        ? `Unit price: ₺${discountedPrice.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} (${activeTier.discountPct}% off)`
                        : `Birim fiyat: ${discountedPrice.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺ (%${activeTier.discountPct} indirimli)`}
                    </p>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Variants */}
          {variantGroups.length > 0 && (
            <div className="mb-6 space-y-4">
              {variantGroups.map(group => (
                <div key={group}>
                  <p className="text-sm font-bold text-gray-700 mb-2">{group}</p>
                  <div className="flex flex-wrap gap-2">
                    {variants.filter(v => v.groupName === group).map(v => {
                      const isSelected = selectedVariants[group]?.id === v.id;
                      const outOfStock = v.stock === 0;
                      return (
                        <button
                          key={v.id}
                          disabled={outOfStock}
                          onClick={() => setSelectedVariants(prev => ({ ...prev, [group]: v }))}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                            isSelected
                              ? 'border-orange-500 bg-orange-50 text-orange-600'
                              : outOfStock
                              ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                              : 'border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                          }`}
                        >
                          {v.value}
                          {v.priceAdjustment !== 0 && (
                            <span className="ml-1 text-xs text-gray-400">
                              ({v.priceAdjustment > 0 ? '+' : ''}{v.priceAdjustment.toLocaleString('tr-TR')}₺)
                            </span>
                          )}
                          {outOfStock && <span className="ml-1 text-xs">({lang === 'en' ? 'Out of Stock' : 'Tükendi'})</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2 mb-5">
            <Package size={16} className="text-green-600" />
            {product.stock > 10 ? (
              <span className="text-green-600 font-semibold text-sm">{lang === 'en' ? `In Stock (${product.stock} units)` : `Stokta Mevcut (${product.stock} adet)`}</span>
            ) : product.stock > 0 ? (
              <span className="text-orange-500 font-semibold text-sm">{lang === 'en' ? `Only ${product.stock} left!` : `Son ${product.stock} adet!`}</span>
            ) : (
              <span className="text-red-500 font-semibold text-sm">{t('outOfStock')}</span>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <Minus size={16} />
              </button>
              <span className="px-4 font-bold text-lg w-12 text-center">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-1 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
                added ? 'bg-green-500 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white disabled:bg-gray-300'
              }`}
            >
              {added ? (<><CheckCircle size={20} />{t('addedToCart')}</>) : (<><ShoppingCart size={20} />{t('addToCart')}</>)}
            </button>
          </div>

          {/* Stock notify form */}
          {product.stock === 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4">
              <p className="text-sm font-semibold text-[#1B3A6B] mb-2">{t('notifyStock')}</p>
              {notifyStatus === 'done' ? (
                <p className="text-sm text-green-600 font-medium flex items-center gap-1.5">
                  <CheckCircle size={15} /> {notifyMsg}
                </p>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={notifyEmail}
                    onChange={e => setNotifyEmail(e.target.value)}
                    placeholder={lang === 'en' ? 'Your email address' : 'E-posta adresiniz'}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                  />
                  <button
                    onClick={async () => {
                      if (!notifyEmail.trim()) return;
                      setNotifyStatus('loading');
                      try {
                        const res = await api.stockNotify.request(product.id, notifyEmail.trim());
                        setNotifyMsg(res.message);
                        setNotifyStatus('done');
                      } catch { setNotifyStatus('idle'); }
                    }}
                    disabled={notifyStatus === 'loading'}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors whitespace-nowrap"
                  >
                    {notifyStatus === 'loading' ? '...' : t('notifyMe')}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mb-6">
            <button
              onClick={handleToggleFav}
              className={`flex-1 border-2 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors ${
                isFavorite(product.id)
                  ? 'border-red-300 text-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-red-300 text-gray-600 hover:text-red-500'
              }`}
            >
              <Heart size={16} className={isFavorite(product.id) ? 'fill-red-500' : ''} />
              {isFavorite(product.id) ? t('inFavorites') : t('addToFavorites')}
            </button>
            <div className="relative flex-1">
              <button
                onClick={() => {
                  const url = window.location.href;
                  const text = `${product.name} — Adalya Solar'da incele!`;
                  if (navigator.share) {
                    navigator.share({ title: product.name, text, url }).catch(() => {});
                  } else {
                    setShareOpen(o => !o);
                  }
                }}
                className="w-full border-2 border-gray-200 hover:border-orange-400 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-orange-500 transition-colors"
              >
                <Share2 size={16} />{t('share')}
              </button>
              {shareOpen && (
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg p-3 z-20">
                  <p className="text-xs font-bold text-gray-500 mb-2">{t('share')}</p>
                  {[
                    { label: 'WhatsApp', color: 'text-green-600', href: `https://wa.me/?text=${encodeURIComponent(`${product.name} — ${lang === 'en' ? 'Check it on Adalya Solar!' : "Adalya Solar'da incele!"} ${window.location.href}`)}` },
                    { label: 'X (Twitter)', color: 'text-sky-500', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(product.name)}&url=${encodeURIComponent(window.location.href)}` },
                    { label: 'Facebook', color: 'text-blue-600', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}` },
                  ].map(item => (
                    <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer"
                      onClick={() => setShareOpen(false)}
                      className={`block px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors ${item.color}`}>
                      {item.label}
                    </a>
                  ))}
                  <button
                    onClick={() => { navigator.clipboard.writeText(window.location.href); setShareOpen(false); }}
                    className="block w-full text-left px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-50 text-gray-600"
                  >
                    🔗 {lang === 'en' ? 'Copy Link' : 'Bağlantıyı Kopyala'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <Shield size={16} className="text-orange-500" />, text: t('whyWarrantyTitle') },
              { icon: <Truck size={16} className="text-orange-500" />, text: lang === 'en' ? 'Free Shipping (over ₺500)' : 'Ücretsiz Kargo (500₺ üzeri)' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 text-xs text-gray-600">
                {item.icon}{item.text}
              </div>
            ))}
          </div>

          {/* Tasarruf Hesabı */}
          {(() => {
            const ELECTRICITY_PRICE = 3.80; // TL/kWh
            const DAILY_HOURS = 5;
            // Watt değerini spec'ten veya ürün adından çek
            const rawWatt =
              product.specs['Güç'] ||
              product.specs['Nominal Güç'] ||
              product.specs['Panel Gücü'] ||
              product.specs['Çıkış Gücü'] ||
              product.specs['Toplam Güç'] ||
              '';
            const wattFromSpec = typeof rawWatt === 'string' ? parseFloat(rawWatt.replace(/[^0-9.]/g, '')) : 0;
            const wattFromName = (() => { const m = product.name.match(/(\d{2,4})\s*[Ww]/); return m ? parseFloat(m[1]) : 0; })();
            const watt = wattFromSpec || wattFromName;
            if (!watt || watt < 10) return null;
            const annualKwh = Math.round((watt / 1000) * DAILY_HOURS * 365);
            const annualSavings = Math.round(annualKwh * ELECTRICITY_PRICE);
            const payback = product.price > 0 ? (product.price / annualSavings).toFixed(1) : null;
            return (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-green-700 mb-2">{t('estimatedSavings')}</p>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-white rounded-xl p-2">
                    <p className="text-lg font-extrabold text-green-600">{annualKwh.toLocaleString('tr-TR')} kWh</p>
                    <p className="text-[10px] text-gray-500">{t('annualProduction')}</p>
                  </div>
                  <div className="bg-white rounded-xl p-2">
                    <p className="text-lg font-extrabold text-green-600">₺{annualSavings.toLocaleString('tr-TR')}</p>
                    <p className="text-[10px] text-gray-500">{t('annualSavings')}</p>
                  </div>
                </div>
                {payback && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {t('paybackPeriod')}: <span className="font-bold text-green-700">{payback} {t('years')}</span>
                    <span className="ml-1 text-gray-400">({ELECTRICITY_PRICE} ₺/kWh, {DAILY_HOURS} hrs/day)</span>
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-10">
        <div className="flex gap-1 border-b border-gray-200 mb-6 overflow-x-auto">
          {(['description', 'specs', 'reviews', 'qa', ...(documents.length > 0 ? ['docs'] : [])] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`px-5 py-3 font-semibold text-sm transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'description' && t('description')}
              {tab === 'specs' && t('specs')}
              {tab === 'reviews' && `${t('reviews')} (${reviews.length})`}
              {tab === 'qa' && `${t('qa')} (${questions.length})`}
              {tab === 'docs' && `${t('documents')} (${documents.length})`}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <p className="text-gray-700 leading-relaxed text-sm">{product.description}</p>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {specEntries.length === 0 && certsArray.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-400 text-sm">
                {lang === 'en' ? 'No technical specifications have been entered for this product yet.' : 'Bu ürün için henüz teknik özellik girilmemiştir.'}
              </div>
            ) : (
              <>
                <div className="flex justify-end px-4 py-3 border-b border-gray-100">
                  <button
                    onClick={handlePrintSpecs}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 font-semibold transition-colors"
                  >
                    <Download size={15} />
                    {t('downloadSpecs')}
                  </button>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {specEntries.map(([key, value], idx) => (
                      <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-6 py-3 font-semibold text-[#1B3A6B] w-48">{key}</td>
                        <td className="px-6 py-3 text-gray-700">{String(value)}</td>
                      </tr>
                    ))}
                    {certsArray.length > 0 && (
                      <tr className={specEntries.length % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-6 py-3 font-semibold text-[#1B3A6B]">{lang === 'en' ? 'Certificates' : 'Sertifikalar'}</td>
                        <td className="px-6 py-3">
                          <div className="flex flex-wrap gap-2">
                            {certsArray.map((cert) => (
                              <span key={cert} className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">{cert}</span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {user ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-bold text-[#1B3A6B] mb-4">{t('writeReview')}</h3>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-700 mb-2">{t('yourRating')}</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setReviewForm((p) => ({ ...p, rating: star }))}>
                        <Star
                          size={28}
                          className={star <= reviewForm.rating ? 'fill-orange-400 text-orange-400' : 'text-gray-300 hover:text-orange-300'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                  placeholder={t('reviewPlaceholder')}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 resize-none"
                />

                {/* Photo upload */}
                <div className="mt-3">
                  <input
                    ref={photoInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []).slice(0, 5);
                      setReviewPhotos(files);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="text-sm text-gray-500 border border-dashed border-gray-300 hover:border-orange-400 hover:text-orange-500 px-4 py-2 rounded-xl transition-colors"
                  >
                    📷 {t('addPhoto')}
                  </button>
                  {reviewPhotos.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {reviewPhotos.map((file, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                          <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setReviewPhotos(prev => prev.filter((_, j) => j !== i))}
                            className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] leading-none"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {reviewError && <p className="text-red-500 text-sm mt-1">{reviewError}</p>}
                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview || uploadingReviewPhotos}
                  className="mt-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
                >
                  {uploadingReviewPhotos ? t('uploadingPhotos') : submittingReview ? t('submitting') : t('submitReview')}
                </button>
              </div>
            ) : (
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 text-center">
                <p className="text-sm text-gray-600 mb-3">{t('loginToReview')}</p>
                <Link href="/giris" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors">
                  {t('login')}
                </Link>
              </div>
            )}

            {reviews.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <Star size={40} className="mx-auto mb-3 text-gray-300" />
                <p>{t('noReviews')}</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1B3A6B] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {review.userName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{review.userName}</p>
                        <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-US')}</p>
                      </div>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={14} className={s <= review.rating ? 'fill-orange-400 text-orange-400' : 'text-gray-200'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{review.comment}</p>

                  {/* Review photos */}
                  {(review as ApiReview & { photosJson?: string | null }).photosJson && (() => {
                    try {
                      const photos: string[] = JSON.parse((review as ApiReview & { photosJson?: string | null }).photosJson!);
                      if (photos.length > 0) return (
                        <div className="flex gap-2 flex-wrap mb-3">
                          {photos.map((url, i) => (
                            <a key={i} href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5207'}${url}`} target="_blank" rel="noopener noreferrer" className="block w-16 h-16 rounded-lg overflow-hidden border border-gray-200 hover:opacity-90 transition-opacity">
                              <img src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5207'}${url}`} alt={`${lang === 'en' ? 'Review photo' : 'Yorum fotoğrafı'} ${i + 1}`} className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      );
                    } catch { return null; }
                    return null;
                  })()}

                  {review.adminReply && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-3">
                      <p className="text-xs font-bold text-blue-700 mb-1">{t('sellerReply')}</p>
                      <p className="text-sm text-blue-800">{review.adminReply}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                    <button
                      onClick={() => handleLike(review.id)}
                      disabled={!user}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                        review.likedByMe
                          ? 'bg-orange-100 text-orange-600'
                          : 'bg-gray-100 text-gray-500 hover:bg-orange-50 hover:text-orange-500 disabled:cursor-default'
                      }`}
                    >
                      <ThumbsUp size={13} />
                      {t('helpful')} ({review.likeCount})
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Q&A Tab */}
        {activeTab === 'qa' && (
          <div className="space-y-5">
            {/* Ask form */}
            {user ? (
              <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
                <h3 className="font-extrabold text-[#1B3A6B] mb-3 text-sm">{t('askQuestion')}</h3>
                {questionError && (
                  <p className="text-red-500 text-sm mb-2">{questionError}</p>
                )}
                <textarea
                  value={questionText}
                  onChange={e => setQuestionText(e.target.value)}
                  placeholder={t('questionPlaceholder')}
                  rows={3}
                  className="w-full border border-orange-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 resize-none bg-white"
                />
                <button
                  disabled={submittingQuestion || !questionText.trim()}
                  onClick={async () => {
                    if (!questionText.trim()) return;
                    setSubmittingQuestion(true);
                    setQuestionError('');
                    try {
                      const q = await api.questions.ask(productId, questionText);
                      setQuestions(prev => [q, ...prev]);
                      setQuestionText('');
                    } catch (err: unknown) {
                      setQuestionError(err instanceof Error ? err.message : (lang === 'en' ? 'Could not send question.' : 'Soru gönderilemedi.'));
                    } finally {
                      setSubmittingQuestion(false);
                    }
                  }}
                  className="mt-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors"
                >
                  {submittingQuestion ? t('sending') : t('sendQuestion')}
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-center">
                <p className="text-sm text-gray-500 mb-3">{t('loginToAsk')}</p>
                <a href="/giris" className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors">
                  {t('login')}
                </a>
              </div>
            )}

            {/* Questions list */}
            {!questionsLoaded ? (
              <p className="text-gray-400 text-sm text-center py-6">{t('loading')}</p>
            ) : questions.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-sm">{t('noQuestions')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map(q => (
                  <div key={q.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-[#1B3A6B] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {q.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">{q.userName}</p>
                        <p className="text-xs text-gray-400">{new Date(q.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-800 font-medium mb-3">{q.question}</p>
                    {q.answer ? (
                      <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                        <p className="text-xs font-bold text-green-700 mb-1">{t('sellerReply')}</p>
                        <p className="text-sm text-green-800 leading-relaxed">{q.answer}</p>
                        {q.answeredAt && (
                          <p className="text-xs text-green-500 mt-1">{new Date(q.answeredAt).toLocaleDateString('en-US')}</p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl px-4 py-3">
                        <p className="text-xs text-gray-400 italic">{t('notAnswered')}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-[#1B3A6B] mb-4">{lang === 'en' ? 'Technical Documents & Data Sheets' : 'Teknik Belgeler & Veri Sayfaları'}</h3>
            <div className="space-y-3">
              {documents.map((doc) => {
                const icons: Record<string, string> = { pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', zip: '🗜️', dwg: '📐' };
                const icon = icons[doc.fileType] ?? '📎';
                const sizeMb = doc.sizeBytes > 0 ? (doc.sizeBytes / 1024 / 1024).toFixed(1) : null;
                return (
                  <a
                    key={doc.id}
                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5207'}${doc.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all group"
                  >
                    <span className="text-2xl">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate group-hover:text-orange-600">{doc.name}</p>
                      {sizeMb && <p className="text-xs text-gray-400">{sizeMb} MB · {doc.fileType.toUpperCase()}</p>}
                    </div>
                    <Download size={16} className="text-gray-400 group-hover:text-orange-500 shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-extrabold text-[#1B3A6B] mb-6">{t('relatedProducts')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {recentProducts.length > 0 && (
        <section>
          <h2 className="text-xl font-extrabold text-[#1B3A6B] mb-6">Recently Viewed</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
            onClick={() => setLightbox(false)}
          >
            <X size={24} />
          </button>
          {product.images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                onClick={(e) => { e.stopPropagation(); setSelectedImage((i) => (i - 1 + product.images.length) % product.images.length); }}
              >
                <ChevronLeft size={28} />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                onClick={(e) => { e.stopPropagation(); setSelectedImage((i) => (i + 1) % product.images.length); }}
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}
          <div
            className="relative w-full max-w-4xl max-h-[85vh] mx-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              width={1200}
              height={800}
              className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
            />
            {product.images.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${i === selectedImage ? 'bg-white' : 'bg-white/40'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
