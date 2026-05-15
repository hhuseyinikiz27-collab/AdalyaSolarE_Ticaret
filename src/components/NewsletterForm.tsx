'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Mail, CheckCircle } from 'lucide-react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus('error');
      setMessage('Lütfen e-posta adresinizi girin.');
      return;
    }
    setStatus('loading');
    try {
      const res = await api.newsletter.subscribe(email.trim());
      setStatus('success');
      setMessage(res.message);
      setEmail('');
    } catch (err: unknown) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Bir hata oluştu.');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 bg-green-500/20 border border-green-400/30 rounded-xl px-4 py-3">
        <CheckCircle size={18} className="text-green-400 shrink-0" />
        <p className="text-sm text-green-300">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex overflow-hidden rounded-xl border border-white/20 focus-within:border-orange-400 transition-colors">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="E-posta adresiniz..."
          className="flex-1 bg-white/10 text-white placeholder-gray-400 px-4 py-2.5 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 px-4 text-white transition-colors shrink-0"
        >
          <Mail size={16} />
        </button>
      </div>
      {status === 'error' && <p className="text-xs text-red-400">{message}</p>}
      <p className="text-xs text-gray-400">Kampanya ve indirimlerden haberdar olun. İstediğiniz zaman çıkabilirsiniz.</p>
    </form>
  );
}
