'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Plus, ChevronRight, ShoppingCart, CheckCircle, Check, Truck, Shield, CreditCard } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { api, ApiAddress, ApiSavedCard } from '@/lib/api';
import { processPayment } from '@/app/actions/payment';

type PaymentGate =
  | { type: 'iyzico'; html: string }
  | { type: 'paytr'; url: string };

export default function CheckoutPage() {
  const { items, totalPrice, coupon, discount, finalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddr, setNewAddr] = useState({ title: '', fullName: '', phone: '', city: '', district: '', neighborhood: '', street: '', isDefault: false });
  const [savingAddr, setSavingAddr] = useState(false);
  const [addrError, setAddrError] = useState('');
  const [invoiceType, setInvoiceType] = useState<'bireysel' | 'kurumsal'>('bireysel');
  const [companyName, setCompanyName] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ id: number; total: number } | null>(null);
  const [paymentGate, setPaymentGate] = useState<PaymentGate | null>(null);

  // Card state
  const [savedCards, setSavedCards] = useState<ApiSavedCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | 'new' | null>(null);
  const [saveCard, setSaveCard] = useState(false);
  const [cardForm, setCardForm] = useState({ number: '', holder: '', expiry: '', cvv: '' });
  const [cardFormError, setCardFormError] = useState('');

  const [shippingCost, setShippingCost] = useState(99);
  const [shippingFree, setShippingFree] = useState(500);
  const [giftCardCode, setGiftCardCode] = useState<string | null>(null);
  const [giftCardDiscount, setGiftCardDiscount] = useState(0);
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0);
  const kargo = finalPrice >= shippingFree ? 0 : shippingCost;
  const genel = Math.max(0, finalPrice + kargo - giftCardDiscount - loyaltyDiscount);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5207'}/api/settings/shipping`)
      .then(r => r.json())
      .then(d => { setShippingCost(d.cost); setShippingFree(d.freeAbove); })
      .catch(() => {});
    const stored = localStorage.getItem('appliedGiftCard');
    if (stored) {
      try {
        const { code, discount } = JSON.parse(stored);
        setGiftCardCode(code);
        setGiftCardDiscount(discount);
      } catch { /* ignore */ }
    }
    const storedLoyalty = localStorage.getItem('appliedLoyalty');
    if (storedLoyalty) {
      try {
        const { discount } = JSON.parse(storedLoyalty);
        setLoyaltyDiscount(discount);
      } catch { /* ignore */ }
    }
  }, []);

  useEffect(() => {
    if (!user) { router.replace('/giris?redirect=/odeme'); return; }
    if (items.length === 0 && !success) { router.replace('/sepet'); return; }
    api.addresses.getAll().then((list) => {
      setAddresses(list);
      const def = list.find((a) => a.isDefault);
      if (def) setSelectedAddressId(def.id);
      else if (list.length > 0) setSelectedAddressId(list[0].id);
    });
    api.cards.getAll().then((list) => {
      setSavedCards(list);
      const def = list.find((c) => c.isDefault);
      if (def) setSelectedCardId(def.id);
      else if (list.length > 0) setSelectedCardId(list[0].id);
      else setSelectedCardId('new');
    });
  }, [user, items.length, router, success]);

  const detectCardType = (num: string) => {
    const n = num.replace(/\s/g, '');
    if (n.startsWith('4')) return 'Visa';
    if (n.startsWith('5') || n.startsWith('2')) return 'Mastercard';
    if (n.startsWith('9')) return 'Troy';
    return 'Visa';
  };

  const formatCardNumber = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const handleSaveNewAddress = async () => {
    if (!newAddr.title.trim() || !newAddr.fullName.trim() || !newAddr.phone.trim() || !newAddr.city.trim() || !newAddr.district.trim() || !newAddr.street.trim()) {
      setAddrError('Lütfen zorunlu alanları doldurun.');
      return;
    }
    setSavingAddr(true);
    setAddrError('');
    try {
      const saved = await api.addresses.create(newAddr);
      setAddresses((prev) => [...prev, saved]);
      setSelectedAddressId(saved.id);
      setShowNewAddress(false);
      setNewAddr({ title: '', fullName: '', phone: '', city: '', district: '', neighborhood: '', street: '', isDefault: false });
    } catch {
      setAddrError('Adres kaydedilemedi.');
    } finally {
      setSavingAddr(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) { setError(showNewAddress ? 'Lütfen önce "Adresi Kaydet ve Kullan" butonuna basın.' : 'Lütfen bir teslimat adresi seçin.'); return; }

    // Kart validasyonu
    if (selectedCardId === 'new') {
      const digits = cardForm.number.replace(/\s/g, '');
      if (digits.length < 16) { setCardFormError('Geçerli bir kart numarası girin.'); return; }
      if (!cardForm.holder.trim()) { setCardFormError('Kart üzerindeki ismi girin.'); return; }
      if (cardForm.expiry.length < 5) { setCardFormError('Geçerli bir son kullanma tarihi girin.'); return; }
      if (cardForm.cvv.length < 3) { setCardFormError('CVV en az 3 haneli olmalıdır.'); return; }
    }
    setCardFormError('');

    const addr = addresses.find((a) => a.id === selectedAddressId)!;
    setPlacing(true);
    setError('');
    try {
      // Yeni kart kaydedilmek isteniyorsa kaydet
      if (selectedCardId === 'new' && saveCard) {
        const digits = cardForm.number.replace(/\s/g, '');
        const [em, ey] = cardForm.expiry.split('/');
        await api.cards.create({
          cardHolderName: cardForm.holder,
          last4: digits.slice(-4),
          expiryMonth: em,
          expiryYear: ey,
          cardType: detectCardType(digits),
          isDefault: savedCards.length === 0,
        });
      }

      const invoiceNote = invoiceType === 'kurumsal'
        ? `[KURUMSAL FATURA]\nŞirket: ${companyName}\nVergi No: ${taxNumber}\nVergi Dairesi: ${taxOffice}${note ? `\n\n${note}` : ''}`
        : note;

      const shippingAddress = `${addr.street}, ${addr.neighborhood}, ${addr.district} / ${addr.city}`;

      const result = await api.orders.create({
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        shippingFullName: addr.fullName,
        shippingPhone: addr.phone,
        shippingAddress,
        note: invoiceNote,
        couponCode: coupon?.code,
        giftCardCode: giftCardCode ?? undefined,
        loyaltyDiscount: loyaltyDiscount > 0 ? loyaltyDiscount : undefined,
      });

      // Ödeme işlemi — provider yapılandırılmamışsa demo modda devam eder
      const payResult = await processPayment(result.id, {
        amount: genel,
        customer: {
          name:    user?.name.split(' ')[0] ?? '',
          surname: user?.name.split(' ').slice(1).join(' ') ?? '',
          email:   user?.email ?? '',
          phone:   addr.phone,
          ip:      '0.0.0.0', // Server Action gerçek IP'yi otomatik alır
        },
        billingAddress: {
          fullName: addr.fullName,
          address:  addr.street,
          city:     addr.city,
          country:  'Turkey',
        },
        items: items.map((i) => ({
          name:     i.product.name,
          price:    i.product.price,
          quantity: i.quantity,
        })),
      });

      if (payResult.success) {
        // Demo mod veya ödeme onaylandı
        clearCart();
        localStorage.removeItem('appliedGiftCard');
        localStorage.removeItem('appliedLoyalty');
        if (user?.email) {
          const email = user.email;
          const name  = user.name;
          import('@/app/actions/email')
            .then(m => m.notifyOrderConfirmation({
              to:              email,
              customerName:    name,
              orderId:         result.id,
              items:           items.map(i => ({
                name:      i.product.name,
                quantity:  i.quantity,
                unitPrice: i.product.price,
              })),
              total:           result.total,
              shippingAddress,
            }))
            .catch(() => {});
        }
        setSuccess({ id: result.id, total: result.total });
      } else if (payResult.checkoutFormContent) {
        clearCart();
        localStorage.removeItem('appliedGiftCard');
        localStorage.removeItem('appliedLoyalty');
        setPaymentGate({ type: 'iyzico', html: payResult.checkoutFormContent });
      } else if (payResult.paymentPageUrl) {
        clearCart();
        localStorage.removeItem('appliedGiftCard');
        localStorage.removeItem('appliedLoyalty');
        setPaymentGate({ type: 'paytr', url: payResult.paymentPageUrl });
      } else {
        setError(payResult.errorMessage ?? 'Ödeme başlatılamadı. Lütfen tekrar deneyin.');
      }
    } catch (e: unknown) {
      const raw = e instanceof Error ? e.message : '';
      const lower = raw.toLowerCase();
      if (lower.includes('engel') || lower.includes('ban') || lower.includes('spam') || lower.includes('bekleyin') || lower.includes('çok fazla')) {
        setError(raw || 'Çok fazla sipariş işlemi gerçekleştirildi. Lütfen bir süre bekleyip tekrar deneyin.');
      } else {
        setError(raw || 'Sipariş oluşturulamadı. Lütfen tekrar deneyin.');
      }
    } finally {
      setPlacing(false);
    }
  };

  // İyzico checkout formu veya PayTR iframe
  if (paymentGate) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-xl font-extrabold text-[#1B3A6B] mb-6 text-center">Ödeme</h1>
        {paymentGate.type === 'iyzico' && (
          <div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
            dangerouslySetInnerHTML={{ __html: paymentGate.html }}
          />
        )}
        {paymentGate.type === 'paytr' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <iframe
              src={paymentGate.url}
              width="100%"
              height="600"
              frameBorder="0"
              scrolling="no"
              title="Güvenli Ödeme"
            />
          </div>
        )}
        <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-1">
          <Shield size={12} className="text-green-500" />
          256-bit SSL ile korunan güvenli ödeme sayfası
        </p>
      </main>
    );
  }

  if (success) {
    return (
      <main className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1B3A6B] mb-2">Siparişiniz Alındı!</h1>
          <p className="text-gray-500 mb-1">Sipariş No: <span className="font-bold text-[#1B3A6B]">#{success.id}</span></p>
          <p className="text-gray-500 mb-6">Toplam: <span className="font-bold text-orange-500">{success.total.toLocaleString('tr-TR')} ₺</span></p>
          <p className="text-sm text-gray-400 mb-8">Siparişiniz hazırlanmaya başlandı. Takip için hesabınızı kontrol edebilirsiniz.</p>
          <div className="flex flex-col gap-3">
            <Link href="/hesabim?tab=siparisler" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors">
              Siparişlerimi Gör
            </Link>
            <Link href="/urunler" className="border-2 border-gray-200 hover:border-orange-400 text-gray-600 font-semibold py-3 rounded-xl transition-colors text-sm">
              Alışverişe Devam Et
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const steps = [
    { label: 'Sepet', href: '/sepet', icon: ShoppingCart },
    { label: 'Sipariş Onayı', href: '/odeme', icon: MapPin },
    { label: 'Ödeme', href: '/odeme', icon: CreditCard },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Progress Stepper */}
      <div className="flex items-center justify-center mb-8 select-none">
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === 1;
          const isDone = i < 1;
          return (
            <div key={step.label} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                  isDone ? 'bg-green-500 text-white' :
                  isActive ? 'bg-orange-500 text-white ring-4 ring-orange-200' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {isDone ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <span className={`text-xs font-semibold whitespace-nowrap ${
                  isActive ? 'text-orange-500' : isDone ? 'text-green-600' : 'text-gray-400'
                }`}>{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-0.5 w-16 sm:w-24 mx-2 mb-4 transition-colors ${isDone ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      <h1 className="text-2xl font-extrabold text-[#1B3A6B] mb-6">Sipariş Onayı</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left */}
        <div className="flex-1 space-y-6">
          {/* Address Selection */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-[#1B3A6B] mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-orange-500" />
              Teslimat Adresi
            </h2>

            <div className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                    selectedAddressId === addr.id ? 'border-orange-400 bg-orange-50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === addr.id}
                    onChange={() => { setSelectedAddressId(addr.id); setShowNewAddress(false); }}
                    className="mt-1 accent-orange-500"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#1B3A6B] text-sm">{addr.title}</p>
                      {addr.isDefault && (
                        <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">Varsayılan</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{addr.fullName} · {addr.phone}</p>
                    <p className="text-sm text-gray-500">{addr.street}, {addr.neighborhood}, {addr.district} / {addr.city}</p>
                  </div>
                </label>
              ))}

              {/* Yeni Adres Ekle seçeneği */}
              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${showNewAddress ? 'border-orange-400 bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}>
                <input type="radio" name="address" checked={showNewAddress} onChange={() => { setShowNewAddress(true); setSelectedAddressId(null); }} className="accent-orange-500" />
                <div className="flex items-center gap-2">
                  <Plus size={14} className="text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">Yeni Adres Ekle</span>
                </div>
              </label>

              {/* Inline adres formu */}
              {showNewAddress && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Adres Başlığı *</label>
                      <input type="text" placeholder="Ev, İş..." value={newAddr.title} onChange={(e) => setNewAddr(p => ({ ...p, title: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Ad Soyad *</label>
                      <input type="text" placeholder="Ad Soyad" value={newAddr.fullName} onChange={(e) => setNewAddr(p => ({ ...p, fullName: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Telefon *</label>
                    <input type="tel" placeholder="05XX XXX XX XX" value={newAddr.phone} onChange={(e) => setNewAddr(p => ({ ...p, phone: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">İl *</label>
                      <input type="text" placeholder="İstanbul" value={newAddr.city} onChange={(e) => setNewAddr(p => ({ ...p, city: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">İlçe *</label>
                      <input type="text" placeholder="Kadıköy" value={newAddr.district} onChange={(e) => setNewAddr(p => ({ ...p, district: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Mahalle</label>
                    <input type="text" placeholder="Moda Mahallesi" value={newAddr.neighborhood} onChange={(e) => setNewAddr(p => ({ ...p, neighborhood: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Açık Adres *</label>
                    <input type="text" placeholder="Sokak, kapı no, daire no..." value={newAddr.street} onChange={(e) => setNewAddr(p => ({ ...p, street: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white" />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={newAddr.isDefault} onChange={(e) => setNewAddr(p => ({ ...p, isDefault: e.target.checked }))} className="accent-orange-500" />
                    <span className="text-sm text-gray-700">Varsayılan adres olarak kaydet</span>
                  </label>
                  {addrError && <p className="text-red-500 text-xs">{addrError}</p>}
                  <button
                    onClick={handleSaveNewAddress}
                    disabled={savingAddr}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                  >
                    {savingAddr ? 'Kaydediliyor...' : 'Adresi Kaydet ve Kullan'}
                  </button>
                </div>
              )}

              {addresses.length === 0 && !showNewAddress && (
                <p className="text-xs text-gray-400 text-center py-2">Kayıtlı adresiniz yok. Yukarıdan yeni adres ekleyin.</p>
              )}
            </div>
          </div>

          {/* Invoice Type */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-[#1B3A6B] mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-orange-500" />
              Fatura Türü
            </h2>
            <div className="flex gap-4 mb-4">
              {(['bireysel', 'kurumsal'] as const).map((type) => (
                <label key={type} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 cursor-pointer flex-1 transition-colors ${invoiceType === type ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" name="invoiceType" value={type} checked={invoiceType === type} onChange={() => setInvoiceType(type)} className="accent-orange-500" />
                  <span className="font-semibold text-sm capitalize text-[#1B3A6B]">{type === 'bireysel' ? 'Bireysel' : 'Kurumsal'}</span>
                </label>
              ))}
            </div>
            {invoiceType === 'kurumsal' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Şirket Adı *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Şirket adını girin"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Vergi Numarası *</label>
                    <input
                      type="text"
                      value={taxNumber}
                      onChange={(e) => setTaxNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="10 haneli vergi no"
                      maxLength={11}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Vergi Dairesi *</label>
                    <input
                      type="text"
                      value={taxOffice}
                      onChange={(e) => setTaxOffice(e.target.value)}
                      placeholder="Vergi dairesi adı"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Note */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-[#1B3A6B] mb-3">Sipariş Notu <span className="text-gray-400 font-normal text-sm">(isteğe bağlı)</span></h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Teslimat veya ürünle ilgili bir notunuz varsa yazabilirsiniz..."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 resize-none"
            />
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-[#1B3A6B] mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-orange-500" />
              Ödeme Yöntemi
            </h2>

            <div className="space-y-3">
              {/* Saved Cards */}
              {savedCards.map((card) => (
                <label key={card.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedCardId === card.id ? 'border-orange-400 bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <input type="radio" name="card" checked={selectedCardId === card.id} onChange={() => setSelectedCardId(card.id)} className="accent-orange-500" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${card.cardType === 'Visa' ? 'bg-blue-100 text-blue-700' : card.cardType === 'Mastercard' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{card.cardType}</span>
                      <span className="text-sm font-semibold text-[#1B3A6B]">**** **** **** {card.last4}</span>
                      {card.isDefault && <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">Varsayılan</span>}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{card.cardHolderName} · {card.expiryMonth}/{card.expiryYear}</p>
                  </div>
                </label>
              ))}

              {/* New Card Option */}
              <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedCardId === 'new' ? 'border-orange-400 bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}>
                <input type="radio" name="card" checked={selectedCardId === 'new'} onChange={() => setSelectedCardId('new')} className="accent-orange-500" />
                <div className="flex items-center gap-2">
                  <Plus size={14} className="text-gray-500" />
                  <span className="text-sm font-semibold text-gray-700">Yeni Kart ile Öde</span>
                </div>
              </label>

              {/* New Card Form */}
              {selectedCardId === 'new' && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Kart Numarası</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="0000 0000 0000 0000"
                      value={cardForm.number}
                      onChange={(e) => setCardForm((p) => ({ ...p, number: formatCardNumber(e.target.value) }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 bg-white tracking-widest font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Kart Üzerindeki İsim</label>
                    <input
                      type="text"
                      placeholder="AD SOYAD"
                      value={cardForm.holder}
                      onChange={(e) => setCardForm((p) => ({ ...p, holder: e.target.value.toUpperCase() }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 bg-white uppercase"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Son Kullanma</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="AA/YY"
                        value={cardForm.expiry}
                        onChange={(e) => setCardForm((p) => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">CVV</label>
                      <input
                        type="password"
                        inputMode="numeric"
                        placeholder="•••"
                        maxLength={4}
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm((p) => ({ ...p, cvv: e.target.value.replace(/\D/g, '') }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 bg-white"
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} className="accent-orange-500" />
                    <span className="text-sm text-gray-700">Bu kartı kaydet</span>
                  </label>
                  {cardFormError && <p className="text-red-500 text-xs">{cardFormError}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Items Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-[#1B3A6B] mb-4 flex items-center gap-2">
              <ShoppingCart size={18} className="text-orange-500" />
              Ürünler ({items.length})
            </h2>
            <div className="space-y-3">
              {items.map(({ product, quantity }) => {
                const imgUrl = product.images[0];
                return (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                      <Image src={imgUrl} alt={product.name} fill className="object-cover" sizes="56px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#1B3A6B] line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-400">{quantity} adet × {product.price.toLocaleString('tr-TR')} ₺</p>
                    </div>
                    <p className="font-bold text-[#1B3A6B] text-sm shrink-0">{(product.price * quantity).toLocaleString('tr-TR')} ₺</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right - Summary */}
        <div className="lg:w-80 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
            <h2 className="font-bold text-[#1B3A6B] text-lg mb-4">Sipariş Özeti</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ürünler Toplamı</span>
                <span className="font-medium">{totalPrice.toLocaleString('tr-TR')} ₺</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-medium">Kupon ({coupon?.code})</span>
                  <span className="text-green-600 font-semibold">-{discount.toLocaleString('tr-TR')} ₺</span>
                </div>
              )}
              {loyaltyDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-purple-600 font-medium">Puan İndirimi</span>
                  <span className="text-purple-600 font-semibold">-{loyaltyDiscount.toLocaleString('tr-TR')} ₺</span>
                </div>
              )}
              {giftCardDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-orange-600 font-medium">Hediye Kartı ({giftCardCode})</span>
                  <span className="text-orange-600 font-semibold">-{giftCardDiscount.toLocaleString('tr-TR')} ₺</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Kargo</span>
                {kargo === 0
                  ? <span className="text-green-600 font-semibold">Ücretsiz</span>
                  : <span className="font-medium">{kargo} ₺</span>
                }
              </div>
            </div>

            <div className="border-t pt-3 mb-5">
              <div className="flex justify-between font-extrabold text-[#1B3A6B] text-lg">
                <span>Genel Toplam</span>
                <span>{genel.toLocaleString('tr-TR')} ₺</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">KDV dahildir</p>
              {genel >= 500 && (() => {
                const inst = genel >= 5000 ? 12 : genel >= 2000 ? 6 : 3;
                return (
                  <p className="text-xs text-green-700 font-semibold mt-2 bg-green-50 px-3 py-1.5 rounded-lg">
                    Aylık {(genel / inst).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺ × {inst} taksit
                  </p>
                );
              })()}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-2 mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={placing || (!selectedAddressId && !showNewAddress)}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {placing ? 'Sipariş Oluşturuluyor...' : (
                <><CheckCircle size={18} />Siparişi Onayla</>
              )}
            </button>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Shield size={14} className="text-green-500 shrink-0" />
                Güvenli sipariş
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Truck size={14} className="text-green-500 shrink-0" />
                Sigortalı kargo ile teslimat
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
