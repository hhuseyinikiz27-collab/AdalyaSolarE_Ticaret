'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Check, Phone, Mail, MapPin, Home, Building2, Tractor, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const PROJECT_TYPES = [
  { value: 'konut', label: 'Konut', icon: <Home size={20} /> },
  { value: 'isyeri', label: 'İşyeri', icon: <Building2 size={20} /> },
  { value: 'ciftlik', label: 'Çiftlik / Tarım', icon: <Tractor size={20} /> },
  { value: 'diger', label: 'Diğer', icon: <FileText size={20} /> },
];

const ROOF_TYPES = [
  { value: 'flat', label: 'Düz Çatı' },
  { value: 'sloped', label: 'Eğimli Çatı' },
  { value: 'ground', label: 'Zemin (Arazi)' },
];

const SYSTEM_SIZES = ['3 kW', '5 kW', '10 kW', '15 kW', '20 kW', '30 kW', '50 kW+', 'Belirsiz'];

export default function TeklifIstePage() {
  const { user } = useAuth();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    companyName: '',
    city: '',
    projectType: '',
    systemSize: '',
    roof: '',
    monthlyBill: '',
    note: '',
  });

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.projectType) { setError('Lütfen proje türü seçiniz.'); return; }
    if (!form.systemSize) { setError('Lütfen sistem büyüklüğü seçiniz.'); return; }
    if (!form.roof) { setError('Lütfen çatı/kurulum tipi seçiniz.'); return; }
    setLoading(true);
    setError(null);
    try {
      await api.quote.create({
        ...form,
        monthlyBill: form.monthlyBill ? parseFloat(form.monthlyBill) : undefined,
      });
      setStep('success');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1B3A6B] mb-3">Teklif Talebiniz Alındı!</h1>
        <p className="text-gray-500 mb-8">Fiyat teklifiniz başarıyla iletildi. Uzman ekibimiz 24 saat içinde sizinle iletişime geçecektir.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="border border-gray-200 text-gray-600 font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
            Ana Sayfaya Dön
          </Link>
          {user && (
            <Link href="/hesabim" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
              Hesabıma Git
            </Link>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 mb-6 transition-colors">
        <ArrowLeft size={16} /> Ana Sayfaya Dön
      </Link>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
          <FileText size={32} className="text-blue-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1B3A6B]">Ücretsiz Fiyat Teklifi</h1>
        <p className="text-gray-500 text-sm mt-2">Projenize özel, ücretsiz ve bağlayıcı olmayan fiyat teklifi alın.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* Contact Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-[#1B3A6B] text-base">İletişim Bilgileri</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Ad Soyad *</label>
              <input required value={form.fullName} onChange={e => set('fullName', e.target.value)}
                placeholder="Ad Soyad"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Firma Adı</label>
              <input value={form.companyName} onChange={e => set('companyName', e.target.value)}
                placeholder="Firma adı (opsiyonel)"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Telefon *</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input required type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-orange-400" />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">E-posta *</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="ornek@email.com"
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-orange-400" />
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Şehir *</label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input required value={form.city} onChange={e => set('city', e.target.value)}
                placeholder="İstanbul, Ankara..."
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-orange-400" />
            </div>
          </div>
        </div>

        {/* Project Type */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-[#1B3A6B] text-base mb-4">Proje Türü *</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PROJECT_TYPES.map(t => (
              <button key={t.value} type="button" onClick={() => set('projectType', t.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${form.projectType === t.value ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                <span className={form.projectType === t.value ? 'text-orange-500' : 'text-gray-400'}>{t.icon}</span>
                <p className="text-sm font-bold text-gray-800">{t.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* System & Roof */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <div>
            <h2 className="font-bold text-[#1B3A6B] text-base mb-3">Sistem Büyüklüğü *</h2>
            <div className="flex flex-wrap gap-2">
              {SYSTEM_SIZES.map(s => (
                <button key={s} type="button" onClick={() => set('systemSize', s)}
                  className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${form.systemSize === s ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-bold text-[#1B3A6B] text-base mb-3">Kurulum Yüzeyi *</h2>
            <div className="flex flex-wrap gap-2">
              {ROOF_TYPES.map(r => (
                <button key={r.value} type="button" onClick={() => set('roof', r.value)}
                  className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${form.roof === r.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              <span className="inline-flex items-center gap-1"><Zap size={14} className="text-yellow-500" /> Aylık Elektrik Faturası</span>
              <span className="text-gray-400 font-normal ml-1">(opsiyonel, daha doğru teklif için)</span>
            </label>
            <div className="relative">
              <input type="number" min="0" value={form.monthlyBill} onChange={e => set('monthlyBill', e.target.value)}
                placeholder="Örn: 1500"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 pr-10" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₺</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-[#1B3A6B] text-base mb-3">Ek Notlar</h2>
          <textarea rows={4} value={form.note} onChange={e => set('note', e.target.value)}
            placeholder="Projeniz hakkında ek bilgi verebilirsiniz..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 resize-none" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-[#1B3A6B] hover:bg-[#162f5a] disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <FileText size={18} />
          )}
          {loading ? 'Gönderiliyor...' : 'Ücretsiz Teklif Al'}
        </button>
      </form>
    </main>
  );
}
