'use client';

import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.contact.submit(form);
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h3 className="text-xl font-extrabold text-[#1B3A6B] mb-2">Mesajınız Alındı!</h3>
        <p className="text-gray-500 text-sm mb-6">
          En kısa sürede size dönüş yapacağız. Teşekkür ederiz.
        </p>
        <button
          onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
        >
          Yeni Mesaj Gönder
        </button>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl font-extrabold text-[#1B3A6B] mb-6">Mesaj Gönderin</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Ad Soyad *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={set('name')}
              placeholder="Adınız Soyadınız"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1.5">Telefon</label>
            <input
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="0532 000 00 00"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">E-posta *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={set('email')}
            placeholder="ornek@email.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">Konu *</label>
          <select
            required
            value={form.subject}
            onChange={set('subject')}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all bg-white"
          >
            <option value="">Konu seçiniz...</option>
            <option>Ürün ve Fiyat Bilgisi</option>
            <option>Teknik Destek</option>
            <option>Sipariş Takibi</option>
            <option>İade ve Değişim</option>
            <option>Kurumsal Teklif</option>
            <option>Diğer</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">Mesajınız *</label>
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={set('message')}
            placeholder="Mesajınızı buraya yazın..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send size={17} />
              Mesaj Gönder
            </>
          )}
        </button>
      </form>
    </>
  );
}
