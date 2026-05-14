'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, CheckCircle, Gift } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import GoogleLoginButton from '@/components/GoogleLoginButton';

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register, googleLogin, isLoading } = useAuth();
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setReferralCode(ref);
  }, [searchParams]);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Ad soyad en az 2 karakter olmalıdır.';
    if (!form.email.includes('@')) errs.email = 'Geçerli bir e-posta girin.';
    if (form.phone.replace(/\D/g, '').length < 10) errs.phone = 'Geçerli bir telefon numarası girin.';
    if (form.password.length < 6) errs.password = 'Şifre en az 6 karakter olmalıdır.';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Şifreler eşleşmiyor.';
    if (!agree) errs.agree = 'Devam etmek için koşulları kabul etmelisiniz.';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    await register(form.name, form.email, form.password, form.phone, referralCode || undefined);
    router.push('/hesabim');
  };

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: 'Zayıf', color: 'bg-red-500', width: '33%' };
    if (p.length < 10 || !/[A-Z]/.test(p) || !/\d/.test(p)) return { label: 'Orta', color: 'bg-orange-400', width: '66%' };
    return { label: 'Güçlü', color: 'bg-green-500', width: '100%' };
  };
  const strength = passwordStrength();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-3xl font-extrabold">A</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#1B3A6B]">Hesap Oluşturun</h1>
          <p className="text-gray-500 text-sm mt-1">Ücretsiz kayıt olun, avantajlardan yararlanın</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Ad Soyad</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Adınız Soyadınız"
                  className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all ${errors.name ? 'border-red-400' : 'border-gray-200'}`}
                />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">E-posta Adresi</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="ornek@email.com"
                  className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all ${errors.email ? 'border-red-400' : 'border-gray-200'}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Telefon Numarası</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="0532 000 00 00"
                  className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all ${errors.phone ? 'border-red-400' : 'border-gray-200'}`}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Şifre</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  className={`w-full border rounded-xl pl-10 pr-12 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all ${errors.password ? 'border-red-400' : 'border-gray-200'}`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {strength && (
                <div className="mt-1.5">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} transition-all`} style={{ width: strength.width }} />
                  </div>
                  <p className={`text-xs mt-0.5 ${strength.color.replace('bg-', 'text-')}`}>{strength.label} şifre</p>
                </div>
              )}
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1.5">Şifre Tekrar</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="••••••••"
                  className={`w-full border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200'}`}
                />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <CheckCircle size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-500" />
                )}
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Agreement */}
            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="accent-orange-500 mt-0.5"
                />
                <span className="text-sm text-gray-600">
                  <Link href="/kullanim-kosullari" className="text-orange-500 hover:underline">Kullanım Koşulları</Link>
                  {' '}ve{' '}
                  <Link href="/gizlilik-politikasi" className="text-orange-500 hover:underline">Gizlilik Politikası</Link>
                  &apos;nı okudum ve kabul ediyorum.
                </span>
              </label>
              {errors.agree && <p className="text-xs text-red-500 mt-1">{errors.agree}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Kayıt Ol'
              )}
            </button>
          </form>

          {referralCode && (
            <div className="mt-4 flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 text-sm text-orange-700">
              <Gift size={16} className="shrink-0" />
              <span>Davet koduyla kayıt oluyorsunuz. Kayıt sonrası <strong>50 puan</strong> kazanacaksınız!</span>
            </div>
          )}

          <div className="relative my-6">
            <hr className="border-gray-200" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-gray-400">
              veya
            </span>
          </div>

          <GoogleLoginButton
            onToken={async (idToken) => {
              const ok = await googleLogin(idToken);
              if (ok) router.push('/hesabim');
            }}
          />

          <p className="text-center text-sm text-gray-500 mt-5">
            Zaten hesabınız var mı?{' '}
            <Link href="/giris" className="text-orange-500 font-semibold hover:text-orange-600">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() { return (<Suspense><RegisterPageContent /></Suspense>); }
