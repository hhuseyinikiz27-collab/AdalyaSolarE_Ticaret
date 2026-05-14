'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wrench, Check, MapPin, Phone, Mail, Home, Building2, Tractor } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const INSTALLATION_TYPES = [
  { value: 'konut', label: 'Konut', icon: <Home size={20} />, desc: 'Ev ve villa kurulumları' },
  { value: 'isyeri', label: 'İşyeri', icon: <Building2 size={20} />, desc: 'Ticari ve sanayi tesisleri' },
  { value: 'ciftlik', label: 'Çiftlik / Tarım', icon: <Tractor size={20} />, desc: 'Tarımsal işletmeler' },
  { value: 'diger', label: 'Diğer', icon: <Wrench size={20} />, desc: 'Özel projeler' },
];

const SYSTEM_SIZES = ['3 kW', '5 kW', '10 kW', '15 kW', '20 kW', '30 kW', '50 kW+', 'Belirsiz'];

export default function KurulumTalebiPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    installationType: '',
    systemSize: '',
    note: '',
  });

  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.installationType) { setError('Lütfen kurulum türü seçiniz.'); return; }
    if (!form.systemSize) { setError('Lütfen sistem büyüklüğü seçiniz.'); return; }
    setLoading(true);
    setError(null);
    try {
      await api.installation.create(form);
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
        <h1 className="text-2xl font-extrabold text-[#1B3A6B] mb-3">Talebiniz Alındı!</h1>
        <p className="text-gray-500 mb-8">Kurulum hizmeti talebiniz başarıyla iletildi. Ekibimiz en kısa sürede sizi arayacaktır.</p>
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
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-4">
          <Wrench size={32} className="text-orange-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1B3A6B]">Kurulum Hizmeti Talebi</h1>
        <p className="text-gray-500 text-sm mt-2">Uzman ekibimiz evinize veya işyerinize güneş enerjisi sistemi kurar.</p>
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
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  value={form.fullName}
                  onChange={e => set('fullName', e.target.value)}
                  placeholder="Ad Soyad"
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-orange-400"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Telefon *</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="05XX XXX XX XX"
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-orange-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">E-posta *</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="ornek@email.com"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Şehir *</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                  placeholder="İstanbul, Ankara..."
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-orange-400"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Adres</label>
              <input
                value={form.address}
                onChange={e => set('address', e.target.value)}
                placeholder="Mahalle, sokak..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>
          </div>
        </div>

        {/* Installation Type */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-[#1B3A6B] text-base mb-4">Kurulum Türü *</h2>
          <div className="grid grid-cols-2 gap-3">
            {INSTALLATION_TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => set('installationType', t.value)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                  form.installationType === t.value
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className={form.installationType === t.value ? 'text-orange-500' : 'text-gray-400'}>
                  {t.icon}
                </span>
                <div>
                  <p className="text-sm font-bold text-gray-800">{t.label}</p>
                  <p className="text-xs text-gray-400">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* System Size */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-[#1B3A6B] text-base mb-4">Sistem Büyüklüğü *</h2>
          <div className="flex flex-wrap gap-2">
            {SYSTEM_SIZES.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => set('systemSize', s)}
                className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                  form.systemSize === s
                    ? 'border-orange-500 bg-orange-50 text-orange-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-[#1B3A6B] text-base mb-3">Ek Notlar</h2>
          <textarea
            rows={4}
            value={form.note}
            onChange={e => set('note', e.target.value)}
            placeholder="Projeniz hakkında ek bilgi, özel istekler..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Wrench size={18} />
          )}
          {loading ? 'Gönderiliyor...' : 'Kurulum Talebi Gönder'}
        </button>
      </form>
    </main>
  );
}
