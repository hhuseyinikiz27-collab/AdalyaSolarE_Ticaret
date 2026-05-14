'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') ?? '';

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) setError('Geçersiz veya eksik sıfırlama bağlantısı. Lütfen tekrar talep edin.');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { setError('Şifre en az 6 karakter olmalıdır.'); return; }
    if (form.password !== form.confirm) { setError('Şifreler eşleşmiyor.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.auth.resetPassword(token, form.password);
      setDone(true);
      setTimeout(() => router.push('/giris'), 3000);
    } catch {
      setError('Bağlantı geçersiz veya süresi dolmuş. Lütfen yeni bir sıfırlama talep edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#1B3A6B]">Yeni Şifre Belirle</h1>
          <p className="text-gray-500 text-sm mt-2">Hesabınız için yeni bir şifre oluşturun.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {done ? (
            <div className="text-center">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-gray-800 mb-2">Şifreniz Güncellendi</h2>
              <p className="text-gray-500 text-sm mb-1">Yeni şifrenizle giriş yapabilirsiniz.</p>
              <p className="text-xs text-gray-400 mb-6">3 saniye içinde giriş sayfasına yönlendiriliyorsunuz...</p>
              <Link
                href="/giris"
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
              >
                Giriş Yap
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Yeni Şifre</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                    placeholder="En az 6 karakter"
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-10 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Yeni Şifre (Tekrar)</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={form.confirm}
                    onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                    required
                    placeholder="Şifrenizi tekrar girin"
                    className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                  />
                </div>
                {form.confirm && form.password !== form.confirm && (
                  <p className="text-xs text-red-500 mt-1">Şifreler eşleşmiyor.</p>
                )}
                {form.confirm && form.password === form.confirm && form.password.length >= 6 && (
                  <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                    <CheckCircle size={12} /> Şifreler eşleşiyor.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : 'Şifremi Güncelle'
                }
              </button>

              <Link
                href="/sifremi-unuttum"
                className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors"
              >
                <ArrowLeft size={14} />
                Yeni sıfırlama bağlantısı talep et
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SifreSifirlaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetForm />
    </Suspense>
  );
}
