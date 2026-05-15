'use client';

import { useState, useEffect } from 'react';
import { api, ApiCoupon, ApiCampaign } from '@/lib/api';
import { Plus, Trash2, ToggleLeft, ToggleRight, X, Ticket } from 'lucide-react';

const EMPTY_FORM = {
  code: '',
  discountType: 'percentage',
  discountValue: 10,
  minOrderAmount: 0,
  maxUses: 100,
  expiresAt: '',
  campaignId: '',
};

function getEffectiveStatus(coupon: ApiCoupon): {
  label: string;
  reason: string | null;
  color: 'green' | 'red' | 'orange' | 'gray';
} {
  const now = Date.now();
  const expired = coupon.expiresAt ? new Date(coupon.expiresAt).getTime() < now : false;
  const limitReached = coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses;

  if (!coupon.isActive) {
    if (expired) return { label: 'Inactive', reason: 'Expired', color: 'red' };
    if (limitReached) return { label: 'Inactive', reason: 'Limit reached', color: 'orange' };
    return { label: 'Inactive', reason: 'Manually deactivated', color: 'gray' };
  }
  // isActive = true but effectively invalid
  if (expired) return { label: 'Active (Expired!)', reason: 'Expired — please deactivate', color: 'red' };
  if (limitReached) return { label: 'Active (Limit Reached!)', reason: 'Usage limit reached — please deactivate', color: 'orange' };
  return { label: 'Active', reason: null, color: 'green' };
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<ApiCoupon[]>([]);
  const [campaigns, setCampaigns] = useState<ApiCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const all = await api.admin.coupons.getAll();
      // Auto-inactivate expired or limit-reached active coupons
      const now = Date.now();
      const toInactivate = all.filter(c =>
        c.isActive && (
          (c.expiresAt && new Date(c.expiresAt).getTime() < now) ||
          (c.maxUses > 0 && c.usedCount >= c.maxUses)
        )
      );
      const updated = [...all];
      await Promise.allSettled(
        toInactivate.map(async c => {
          try {
            const result = await api.admin.coupons.toggle(c.id);
            const idx = updated.findIndex(x => x.id === c.id);
            if (idx >= 0) updated[idx] = { ...updated[idx], isActive: result.isActive };
          } catch { /* ignore individual toggle failures */ }
        })
      );
      setCoupons(updated);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Could not load coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    api.admin.campaigns.getAll().then(setCampaigns).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openForm = () => {
    setForm({ ...EMPTY_FORM });
    setError('');
    setShowForm(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) { setError('Coupon code cannot be empty.'); return; }
    setSaving(true);
    setError('');
    try {
      const created = await api.admin.coupons.create({
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount),
        maxUses: Number(form.maxUses),
        expiresAt: form.expiresAt ? `${form.expiresAt}T20:59:59Z` : undefined,
        campaignId: form.campaignId ? Number(form.campaignId) : null,
      });
      setCoupons(prev => [created, ...prev]);
      setShowForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not create coupon.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      const result = await api.admin.coupons.toggle(id);
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: result.isActive } : c));
    } catch {
      setError('Could not change status.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.admin.coupons.delete(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
    } catch {
      setError('Could not delete coupon.');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="p-8">
      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6 flex items-center justify-between">
          <span>{loadError}</span>
          <button onClick={load} className="font-semibold underline ml-4">Try Again</button>
        </div>
      )}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1B3A6B]">Coupon Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage discount coupons</p>
        </div>
        <button
          onClick={openForm}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          <Plus size={16} />
          New Coupon
        </button>
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-[#1B3A6B]">Create New Coupon</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl mb-4">{error}</p>}
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Coupon Code</label>
                <input
                  type="text"
                  value={form.code}
                  onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. ADALYA20"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 font-mono tracking-widest"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Discount Type</label>
                  <select
                    value={form.discountType}
                    onChange={e => setForm(p => ({ ...p, discountType: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₺)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">
                    Discount Value {form.discountType === 'percentage' ? '(%)' : '(₺)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={form.discountType === 'percentage' ? 100 : undefined}
                    value={form.discountValue || ''}
                    onFocus={e => e.target.select()}
                    onChange={e => setForm(p => ({ ...p, discountValue: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Min. Order (₺)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.minOrderAmount || ''}
                    onFocus={e => e.target.select()}
                    onChange={e => setForm(p => ({ ...p, minOrderAmount: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Max. Uses</label>
                  <input
                    type="number"
                    min={1}
                    value={form.maxUses || ''}
                    onFocus={e => e.target.select()}
                    onChange={e => setForm(p => ({ ...p, maxUses: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Expiry Date (optional)</label>
                <input
                  type="date"
                  value={form.expiresAt}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Campaign Restriction</label>
                <select
                  value={form.campaignId}
                  onChange={e => setForm(p => ({ ...p, campaignId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-white"
                >
                  <option value="">Not linked to a campaign (public)</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={String(c.id)}>{c.title}</option>
                  ))}
                </select>
                {form.campaignId && (
                  <p className="text-xs text-orange-600 mt-1">Only members enrolled in the selected campaign can use this code.</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">
                  {saving ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-2xl h-16 animate-pulse" />)}
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
          <Ticket size={50} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500">No coupons created yet.</p>
          <button onClick={openForm} className="mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-xl transition-colors text-sm">
            Create First Coupon
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Campaign</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Min. Order</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Usage</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Expiry</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map(coupon => (
                <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-mono font-bold text-[#1B3A6B] bg-blue-50 px-2 py-1 rounded-lg text-sm tracking-widest">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500">
                    {coupon.campaignId
                      ? <span className="bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">
                          {campaigns.find(c => c.id === coupon.campaignId)?.title || `Campaign ${coupon.campaignId}`}
                        </span>
                      : <span className="text-gray-400">Public</span>
                    }
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-orange-500">
                      {coupon.discountType === 'percentage'
                        ? `%${coupon.discountValue}`
                        : `${coupon.discountValue.toLocaleString('tr-TR')} ₺`}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {coupon.minOrderAmount > 0 ? `${coupon.minOrderAmount.toLocaleString('tr-TR')} ₺` : '—'}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    <span className={coupon.usedCount >= coupon.maxUses ? 'text-red-500 font-semibold' : ''}>
                      {coupon.usedCount} / {coupon.maxUses}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600">
                    {coupon.expiresAt
                      ? new Date(coupon.expiresAt).toLocaleDateString('tr-TR', { timeZone: 'Europe/Istanbul' })
                      : '—'}
                  </td>
                  <td className="px-5 py-4">
                    {(() => {
                      const status = getEffectiveStatus(coupon);
                      const btnColor =
                        status.color === 'green'  ? 'bg-green-50 text-green-600 hover:bg-green-100' :
                        status.color === 'red'    ? 'bg-red-50 text-red-600 hover:bg-red-100' :
                        status.color === 'orange' ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' :
                                                    'bg-gray-100 text-gray-500 hover:bg-gray-200';
                      const reasonColor =
                        status.color === 'red'    ? 'bg-red-50 text-red-600' :
                        status.color === 'orange' ? 'bg-orange-50 text-orange-600' :
                                                    'bg-gray-50 text-gray-400';
                      return (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleToggle(coupon.id)}
                            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors w-fit ${btnColor}`}
                          >
                            {coupon.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                            {status.label}
                          </button>
                          {status.reason && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${reasonColor}`}>
                              {status.reason}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
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
