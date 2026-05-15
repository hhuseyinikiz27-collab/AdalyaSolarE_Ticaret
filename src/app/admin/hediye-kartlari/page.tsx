'use client';

import { useEffect, useState } from 'react';
import { api, ApiGiftCard } from '@/lib/api';
import { Gift, Plus, Trash2, Loader2, Copy, Check } from 'lucide-react';

export default function AdminGiftCards() {
  const [cards, setCards] = useState<ApiGiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ amount: '', code: '', expiresAt: '', note: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const load = () => {
    api.giftCards.adminGetAll()
      .then(setCards)
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.amount || Number(form.amount) <= 0) { setError('Please enter a valid amount.'); return; }
    setSaving(true);
    setError('');
    try {
      await api.giftCards.adminCreate({
        amount: Number(form.amount),
        code: form.code || undefined,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
        note: form.note || undefined,
      });
      setForm({ amount: '', code: '', expiresAt: '', note: '' });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this gift card?')) return;
    await api.giftCards.adminDelete(id);
    load();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <Gift size={24} className="text-orange-500" />
        <div>
          <h1 className="text-2xl font-extrabold text-[#1B3A6B]">Gift Card Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">Create and send to users</p>
        </div>
      </div>

      {/* Create form */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="font-bold text-[#1B3A6B] mb-4">New Gift Card</h2>
        {error && <p className="text-red-500 text-sm mb-3 bg-red-50 px-3 py-2 rounded-xl">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Amount (₺) *</label>
            <input
              type="number"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              placeholder="100"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Code (empty = auto)</label>
            <input
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="ADALYA-XXXX"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Expiry Date</label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1">Note</label>
            <input
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Customer name etc."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"
            />
          </div>
        </div>
        <button
          onClick={handleCreate}
          disabled={saving}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          Create
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : cards.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-white rounded-2xl">
          <Gift size={36} className="mx-auto mb-3 text-gray-200" />
          <p>No gift cards created yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Code', 'Amount', 'Balance', 'Expiry Date', 'Note', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cards.map(gc => (
                <tr key={gc.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#1B3A6B] text-xs">{gc.code}</span>
                      <button onClick={() => copyCode(gc.code)} className="text-gray-300 hover:text-orange-500 transition-colors">
                        {copied === gc.code ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{gc.amount.toLocaleString('tr-TR')} ₺</td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${gc.balance === 0 ? 'text-gray-400' : 'text-green-600'}`}>
                      {gc.balance.toLocaleString('tr-TR')} ₺
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {gc.expiresAt ? new Date(gc.expiresAt).toLocaleDateString('tr-TR') : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{gc.note || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gc.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                      {gc.isActive ? 'Active' : 'Exhausted'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(gc.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
