'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Tag, Shield, Truck, CheckCircle, X, MapPin, CreditCard, Gift } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { useLang } from '@/context/LanguageContext';

export default function CartPage() {
  const { t, lang } = useLang();
  const { items, totalItems, totalPrice, coupon, discount, finalPrice, updateQuantity, removeFromCart, clearCart, setCoupon } = useCart();
  const { user } = useAuth();
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [shippingCost, setShippingCost] = useState(99);
  const [shippingFree, setShippingFree] = useState(500);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const [loyaltyLoading, setLoyaltyLoading] = useState(false);
  const [giftCardInput, setGiftCardInput] = useState('');
  const [giftCardLoading, setGiftCardLoading] = useState(false);
  const [giftCardError, setGiftCardError] = useState('');
  const [giftCardCode, setGiftCardCode] = useState<string | null>(null);
  const [giftCardDiscount, setGiftCardDiscount] = useState(0);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5207'}/api/settings/shipping`)
      .then(r => r.json())
      .then(d => { setShippingCost(d.cost); setShippingFree(d.freeAbove); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) api.loyalty.getBalance().then(d => setLoyaltyPoints(d.points)).catch(() => {});
  }, [user]);

  const kargo = finalPrice >= shippingFree ? 0 : shippingCost;
  const genel = Math.max(0, finalPrice + kargo - loyaltyDiscount - giftCardDiscount);

  const handleApplyGiftCard = async () => {
    const code = giftCardInput.trim().toUpperCase();
    if (!code) return;
    setGiftCardLoading(true); setGiftCardError('');
    try {
      const data = await api.giftCards.validate(code);
      if (data.balance <= 0) {
        setGiftCardError('This gift card has no remaining balance.');
      } else {
        const applied = Math.min(data.balance, finalPrice + kargo - loyaltyDiscount);
        setGiftCardCode(code);
        setGiftCardDiscount(applied);
        setGiftCardInput('');
      }
    } catch {
      setGiftCardError('Invalid gift card code.');
    } finally {
      setGiftCardLoading(false);
    }
  };

  const handleApplyCoupon = async (overrideCode?: string) => {
    const code = (overrideCode ?? couponInput).trim();
    if (!code) return;
    setCouponLoading(true); setCouponError('');
    try {
      const data = await api.coupons.validate(code);
      if (totalPrice < data.minOrderAmount) {
        setCouponError(`This coupon applies to orders of at least ₺${data.minOrderAmount.toLocaleString('tr-TR')}.`);
        setTimeout(() => setCouponError(''), 6000);
      } else {
        setCoupon({ code: data.code, discountType: data.discountType as 'percentage' | 'fixed', discountValue: data.discountValue, minOrderAmount: data.minOrderAmount });
        setCouponInput('');
      }
    } catch (e: unknown) {
      const raw = e instanceof Error ? e.message : '';
      const lower = raw.toLowerCase();
      let msg: string;
      if (lower.includes('süre') || lower.includes('expir') || lower.includes('geçerlilik') || lower.includes('tarih')) {
        msg = 'This coupon has expired.';
      } else if (lower.includes('maksimum') || lower.includes('limit') || lower.includes('tükendi') || lower.includes('kullanım')) {
        msg = 'This coupon has reached its maximum usage limit.';
      } else if (lower.includes('aktif değil') || lower.includes('pasif') || lower.includes('inactive')) {
        msg = 'This coupon is no longer active.';
      } else if (!raw || lower === 'bir hata oluştu.' || lower.includes('hata oluştu')) {
        msg = 'Invalid coupon code.';
      } else {
        msg = raw;
      }
      setCouponError(msg);
      setTimeout(() => setCouponError(''), 5000);
    } finally {
      setCouponLoading(false);
    }
  };

  useEffect(() => {
    const pending = localStorage.getItem('pendingCoupon');
    if (!pending || coupon) return;
    localStorage.removeItem('pendingCoupon');
    setCouponInput(pending);
    handleApplyCoupon(pending);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (giftCardCode) {
      localStorage.setItem('appliedGiftCard', JSON.stringify({ code: giftCardCode, discount: giftCardDiscount }));
    } else {
      localStorage.removeItem('appliedGiftCard');
    }
  }, [giftCardCode, giftCardDiscount]);

  if (items.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingCart size={80} className="mx-auto text-gray-200 mb-6" />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">{t('emptyCart')}</h2>
        <p className="text-gray-500 mb-8">{t('emptyCartDesc')}</p>
        <Link
          href="/urunler"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-colors"
        >
          <ShoppingCart size={18} />
          {t('continueShopping')}
        </Link>
      </main>
    );
  }

  const cartSteps = [
    { label: t('myCart'), icon: ShoppingCart },
    { label: 'Order Review', icon: MapPin },
    { label: 'Payment', icon: CreditCard },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Progress Stepper */}
      <div className="flex items-center justify-center mb-8 select-none">
        {cartSteps.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === 0;
          const isDone = i < 0;
          return (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                  isDone ? 'bg-green-500 text-white' :
                  isActive ? 'bg-orange-500 text-white ring-4 ring-orange-200' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  <Icon size={16} />
                </div>
                <span className={`text-xs font-semibold whitespace-nowrap ${
                  isActive ? 'text-orange-500' : 'text-gray-400'
                }`}>{step.label}</span>
              </div>
              {i < cartSteps.length - 1 && (
                <div className="h-0.5 w-16 sm:w-24 mx-2 mb-4 bg-gray-200" />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-[#1B3A6B]">
          {t('myCart')}
          <span className="ml-2 text-base font-normal text-gray-400">({totalItems} items)</span>
        </h1>
        <button
          onClick={clearCart}
          className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1 transition-colors"
        >
          <Trash2 size={14} />
          Clear Cart
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-4">
          {items.map(({ product, quantity }) => {
            const discount = product.originalPrice
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : 0;
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4 items-start"
              >
                <Link href={`/urunler/${product.slug}`} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-50">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-orange-500 font-semibold">{product.brand}</p>
                  <Link href={`/urunler/${product.slug}`}>
                    <h3 className="font-semibold text-[#1B3A6B] text-sm hover:text-orange-500 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">Model: {product.model}</p>

                  <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="px-3 py-1.5 hover:bg-gray-50 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-4 font-bold text-sm">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="px-3 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="font-extrabold text-[#1B3A6B]">
                        {(product.price * quantity).toLocaleString('tr-TR')} ₺
                      </span>
                      {discount > 0 && (
                        <span className="text-xs text-gray-400 line-through">
                          {(product.originalPrice! * quantity).toLocaleString('tr-TR')} ₺
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Coupon */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            {coupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm font-semibold text-green-700">{coupon.code}</span>
                  <span className="text-xs text-green-600">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% discount` : `₺${coupon.discountValue} discount`} applied
                  </span>
                </div>
                <button onClick={() => setCoupon(null)} className="text-gray-400 hover:text-red-500"><X size={16} /></button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center border border-gray-200 rounded-xl overflow-hidden px-4 gap-2">
                    <Tag size={16} className="text-gray-400" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={e => { if (e.key === 'Enter') handleApplyCoupon(); }}
                      placeholder="Enter coupon code..."
                      className="flex-1 py-2.5 text-sm outline-none"
                    />
                  </div>
                  <button
                    onClick={() => handleApplyCoupon()}
                    disabled={couponLoading || !couponInput.trim()}
                    className="bg-[#1B3A6B] hover:bg-[#2d5282] disabled:bg-gray-300 text-white font-semibold px-5 rounded-xl transition-colors text-sm"
                  >
                    {couponLoading ? '...' : t('apply')}
                  </button>
                </div>
                {couponError && <p className="text-red-500 text-xs px-1">{couponError}</p>}
              </div>
            )}
          </div>

          {/* Gift Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            {giftCardCode ? (
              <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Gift size={16} className="text-orange-500" />
                  <span className="text-sm font-semibold text-orange-700 font-mono">{giftCardCode}</span>
                  <span className="text-xs text-orange-600">₺{giftCardDiscount.toLocaleString('tr-TR')} applied</span>
                </div>
                <button onClick={() => { setGiftCardCode(null); setGiftCardDiscount(0); }} className="text-gray-400 hover:text-red-500"><X size={16} /></button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center border border-gray-200 rounded-xl overflow-hidden px-4 gap-2">
                    <Gift size={16} className="text-gray-400" />
                    <input
                      type="text"
                      value={giftCardInput}
                      onChange={e => setGiftCardInput(e.target.value.toUpperCase())}
                      onKeyDown={e => { if (e.key === 'Enter') handleApplyGiftCard(); }}
                      placeholder="Gift card code..."
                      className="flex-1 py-2.5 text-sm outline-none font-mono"
                    />
                  </div>
                  <button
                    onClick={handleApplyGiftCard}
                    disabled={giftCardLoading || !giftCardInput.trim()}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold px-5 rounded-xl transition-colors text-sm"
                  >
                    {giftCardLoading ? '...' : t('apply')}
                  </button>
                </div>
                {giftCardError && <p className="text-red-500 text-xs px-1">{giftCardError}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
            <h2 className="font-bold text-[#1B3A6B] text-lg mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Items ({totalItems})</span>
                <span className="font-medium">{totalPrice.toLocaleString('tr-TR')} ₺</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-medium">Coupon ({coupon?.code})</span>
                  <span className="text-green-600 font-semibold">-{discount.toLocaleString('tr-TR')} ₺</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('shipping')}</span>
                {kargo === 0 ? (
                  <span className="text-green-600 font-semibold">{t('freeShipping')}</span>
                ) : (
                  <span className="font-medium">{kargo} ₺</span>
                )}
              </div>
              {kargo > 0 && (
                <p className="text-xs text-orange-500 bg-orange-50 rounded-lg p-2">
                  🚚 Add ₺{(shippingFree - finalPrice).toLocaleString('tr-TR')} more for free shipping!
                </p>
              )}
              {loyaltyDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-purple-600 font-medium">Points Discount</span>
                  <span className="text-purple-600 font-semibold">-{loyaltyDiscount.toLocaleString('tr-TR')} ₺</span>
                </div>
              )}
              {giftCardDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-orange-600 font-medium">Gift Card ({giftCardCode})</span>
                  <span className="text-orange-600 font-semibold">-{giftCardDiscount.toLocaleString('tr-TR')} ₺</span>
                </div>
              )}
            </div>

            {/* Loyalty Points */}
            {user && loyaltyPoints >= 100 && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 mb-4">
                <p className="text-xs font-bold text-purple-700 mb-2">
                  {loyaltyPoints} pts = ₺{Math.floor(loyaltyPoints / 100) * 10} discount
                </p>
                {loyaltyDiscount > 0 ? (
                  <button
                    onClick={async () => {
                      setLoyaltyLoading(true);
                      const usedPoints = loyaltyDiscount / 10 * 100;
                      await api.loyalty.cancelRedeem().catch(() => {});
                      setLoyaltyPoints(p => p + usedPoints);
                      setLoyaltyDiscount(0);
                      localStorage.removeItem('appliedLoyalty');
                      setLoyaltyLoading(false);
                    }}
                    disabled={loyaltyLoading}
                    className="text-xs text-purple-600 underline"
                  >
                    Remove points
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      setLoyaltyLoading(true);
                      try {
                        const res = await api.loyalty.redeem(loyaltyPoints);
                        setLoyaltyDiscount(res.discount);
                        setLoyaltyPoints(res.remainingPoints);
                        localStorage.setItem('appliedLoyalty', JSON.stringify({ discount: res.discount }));
                      } catch { /* ignore */ }
                      setLoyaltyLoading(false);
                    }}
                    disabled={loyaltyLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
                  >
                    {loyaltyLoading ? '...' : 'Use All My Points'}
                  </button>
                )}
              </div>
            )}

            <div className="border-t pt-3 mb-5">
              <div className="flex justify-between font-extrabold text-[#1B3A6B] text-lg">
                <span>{t('total')}</span>
                <span>{genel.toLocaleString('tr-TR')} ₺</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">VAT included</p>
            </div>

            {user ? (
              <Link
                href="/odeme"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {t('checkout')}
                <ArrowRight size={18} />
              </Link>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/giris?redirect=/odeme"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  Sign In &amp; Pay
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="/odeme"
                  className="w-full border-2 border-gray-200 hover:border-orange-400 text-gray-600 font-semibold py-3 rounded-xl flex items-center justify-center text-sm transition-colors"
                >
                  Continue as Guest
                </Link>
              </div>
            )}

            {/* Guarantees */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield size={14} className="text-green-500 shrink-0" />
                Secure payment with SSL
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Truck size={14} className="text-green-500 shrink-0" />
                Insured delivery
              </div>
            </div>
          </div>

          {/* Continue Shopping */}
          <Link
            href="/urunler"
            className="mt-4 w-full border-2 border-gray-200 hover:border-orange-400 text-gray-600 hover:text-orange-500 font-semibold py-3 rounded-xl flex items-center justify-center transition-colors text-sm"
          >
            {t('continueShopping')}
          </Link>
        </div>
      </div>
    </main>
  );
}
