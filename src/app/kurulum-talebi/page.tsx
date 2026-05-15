'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wrench, Check, MapPin, Phone, Mail, Home, Building2, Tractor } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const INSTALLATION_TYPES = [
  { value: 'konut', label: 'Residential', icon: <Home size={20} />, desc: 'Home and villa installations' },
  { value: 'isyeri', label: 'Business', icon: <Building2 size={20} />, desc: 'Commercial and industrial facilities' },
  { value: 'ciftlik', label: 'Farm / Agriculture', icon: <Tractor size={20} />, desc: 'Agricultural operations' },
  { value: 'diger', label: 'Other', icon: <Wrench size={20} />, desc: 'Special projects' },
];

const SYSTEM_SIZES = ['3 kW', '5 kW', '10 kW', '15 kW', '20 kW', '30 kW', '50 kW+', 'Undecided'];

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
    if (!form.installationType) { setError('Please select an installation type.'); return; }
    if (!form.systemSize) { setError('Please select a system size.'); return; }
    setLoading(true);
    setError(null);
    try {
      await api.installation.create(form);
      setStep('success');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'An error occurred.');
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
        <h1 className="text-2xl font-extrabold text-[#1B3A6B] mb-3">Your Request Has Been Received!</h1>
        <p className="text-gray-500 mb-8">Your installation service request has been successfully submitted. Our team will call you as soon as possible.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="border border-gray-200 text-gray-600 font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
            Return to Home
          </Link>
          {user && (
            <Link href="/hesabim" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
              Go to My Account
            </Link>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 mb-6 transition-colors">
        <ArrowLeft size={16} /> Return to Home
      </Link>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-4">
          <Wrench size={32} className="text-orange-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1B3A6B]">Installation Service Request</h1>
        <p className="text-gray-500 text-sm mt-2">Our expert team installs solar energy systems at your home or business.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        {/* Contact Info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-[#1B3A6B] text-base">Contact Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Full Name *</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  value={form.fullName}
                  onChange={e => set('fullName', e.target.value)}
                  placeholder="Full Name"
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-orange-400"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Phone *</label>
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
            <label className="text-sm font-semibold text-gray-700 block mb-1">Email *</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="example@email.com"
                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">City *</label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  value={form.city}
                  onChange={e => set('city', e.target.value)}
                  placeholder="Istanbul, Ankara..."
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-orange-400"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Address</label>
              <input
                value={form.address}
                onChange={e => set('address', e.target.value)}
                placeholder="Neighborhood, street..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>
          </div>
        </div>

        {/* Installation Type */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-[#1B3A6B] text-base mb-4">Installation Type *</h2>
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
          <h2 className="font-bold text-[#1B3A6B] text-base mb-4">System Size *</h2>
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
          <h2 className="font-bold text-[#1B3A6B] text-base mb-3">Additional Notes</h2>
          <textarea
            rows={4}
            value={form.note}
            onChange={e => set('note', e.target.value)}
            placeholder="Additional information about your project, special requests..."
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
          {loading ? 'Submitting...' : 'Submit Installation Request'}
        </button>
      </form>
    </main>
  );
}
