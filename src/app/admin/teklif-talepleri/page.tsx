'use client';

import { useState, useEffect } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { api, ApiQuoteRequest } from '@/lib/api';

const STATUS_OPTIONS = [
  { value: 'beklemede', label: 'Pending', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'inceleniyor', label: 'Under Review', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: 'teklif-gonderildi', label: 'Quote Sent', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { value: 'tamamlandi', label: 'Completed', color: 'text-green-600 bg-green-50 border-green-200' },
  { value: 'reddedildi', label: 'Rejected', color: 'text-red-600 bg-red-50 border-red-200' },
];

const TYPE_LABELS: Record<string, string> = {
  konut: 'Residential', isyeri: 'Commercial', ciftlik: 'Farm / Agriculture', diger: 'Other',
};

const ROOF_LABELS: Record<string, string> = {
  flat: 'Flat Roof', sloped: 'Sloped Roof', ground: 'Ground',
};

export default function AdminTeklifTalepleri() {
  const [items, setItems] = useState<ApiQuoteRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNote, setEditNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.quote.adminGetAll(filterStatus || undefined);
      setItems(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterStatus]);

  const openEdit = (item: ApiQuoteRequest) => {
    setEditId(item.id);
    setEditStatus(item.status);
    setEditNote(item.adminNote || '');
  };

  const saveEdit = async () => {
    if (!editId) return;
    setSaving(true);
    try {
      const updated = await api.quote.adminUpdate(editId, { status: editStatus, adminNote: editNote });
      setItems(prev => prev.map(i => i.id === editId ? { ...i, status: updated.status, adminNote: updated.adminNote } : i));
      setEditId(null);
    } finally {
      setSaving(false);
    }
  };

  const statusStyle = (s: string) => STATUS_OPTIONS.find(o => o.value === s)?.color || 'text-gray-600 bg-gray-50 border-gray-200';
  const statusLabel = (s: string) => STATUS_OPTIONS.find(o => o.value === s)?.label || s;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText size={24} className="text-blue-600" />
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Quote Requests</h1>
            <p className="text-sm text-gray-500">{total} request{total !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400">
          <option value="">All</option>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <FileText size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400">No quote requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpanded(p => p === item.id ? null : item.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-bold text-gray-800">{item.fullName}</p>
                    {item.companyName && <p className="text-xs text-gray-500">({item.companyName})</p>}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusStyle(item.status)}`}>
                      {statusLabel(item.status)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {TYPE_LABELS[item.projectType] || item.projectType} · {item.systemSize} · {item.city}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(item.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {expanded === item.id ? <ChevronUp size={16} className="text-gray-400 shrink-0" /> : <ChevronDown size={16} className="text-gray-400 shrink-0" />}
              </div>

              {expanded === item.id && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-4 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    <div><p className="text-gray-400 text-xs">Phone</p><p className="font-semibold">{item.phone}</p></div>
                    <div><p className="text-gray-400 text-xs">Email</p><p className="font-semibold">{item.email}</p></div>
                    <div><p className="text-gray-400 text-xs">City</p><p className="font-semibold">{item.city}</p></div>
                    <div><p className="text-gray-400 text-xs">Roof Type</p><p className="font-semibold">{ROOF_LABELS[item.roof] || item.roof}</p></div>
                    {item.monthlyBill && <div><p className="text-gray-400 text-xs">Monthly Bill</p><p className="font-semibold">{item.monthlyBill.toLocaleString('tr-TR')} ₺</p></div>}
                  </div>
                  {item.note && (
                    <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700">
                      <p className="text-xs font-semibold text-gray-400 mb-1">Customer Note</p>
                      {item.note}
                    </div>
                  )}
                  {item.adminNote && editId !== item.id && (
                    <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
                      <p className="text-xs font-semibold text-blue-400 mb-1">Admin Note</p>
                      {item.adminNote}
                    </div>
                  )}

                  {editId === item.id ? (
                    <div className="space-y-3">
                      <div className="flex gap-2 flex-wrap">
                        {STATUS_OPTIONS.map(o => (
                          <button key={o.value} onClick={() => setEditStatus(o.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${editStatus === o.value ? o.color : 'border-gray-200 text-gray-500'}`}>
                            {o.label}
                          </button>
                        ))}
                      </div>
                      <textarea rows={3} value={editNote} onChange={e => setEditNote(e.target.value)}
                        placeholder="Quote details or note (a notification will be sent to the customer)"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none" />
                      <div className="flex gap-2">
                        <button onClick={() => setEditId(null)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors">Cancel</button>
                        <button onClick={saveEdit} disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-2 rounded-xl text-sm transition-colors">
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => openEdit(item)} className="bg-[#1B3A6B] hover:bg-[#162f5a] text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
                      Update Status
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
