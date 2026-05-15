'use client';

import { useEffect, useState } from 'react';
import { api, ApiBulkOrderRequest } from '@/lib/api';
import { ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_OPTIONS = ['beklemede', 'inceleniyor', 'teklif-gonderildi', 'tamamlandi', 'reddedildi'];
const STATUS_LABELS: Record<string, string> = {
  beklemede: 'Beklemede',
  inceleniyor: 'İnceleniyor',
  'teklif-gonderildi': 'Teklif Gönderildi',
  tamamlandi: 'Tamamlandı',
  reddedildi: 'Reddedildi',
};
const STATUS_COLORS: Record<string, string> = {
  beklemede: 'bg-yellow-100 text-yellow-700',
  inceleniyor: 'bg-blue-100 text-blue-700',
  'teklif-gonderildi': 'bg-purple-100 text-purple-700',
  tamamlandi: 'bg-green-100 text-green-700',
  reddedildi: 'bg-red-100 text-red-700',
};

export default function AdminBulkOrders() {
  const [items, setItems] = useState<ApiBulkOrderRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [saving, setSaving] = useState<number | null>(null);
  const [editNote, setEditNote] = useState<Record<number, string>>({});
  const [editStatus, setEditStatus] = useState<Record<number, string>>({});

  async function load() {
    setLoading(true);
    try {
      const res = await api.bulkOrder.adminGetAll(filter || undefined, page);
      setItems(res.items);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [filter, page]);

  function toggle(id: number, item: ApiBulkOrderRequest) {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    setEditStatus(prev => ({ ...prev, [id]: item.status }));
    setEditNote(prev => ({ ...prev, [id]: item.adminNote ?? '' }));
  }

  async function save(id: number) {
    setSaving(id);
    try {
      const updated = await api.bulkOrder.adminUpdate(id, {
        status: editStatus[id],
        adminNote: editNote[id],
      });
      setItems(prev => prev.map(i => i.id === id ? { ...i, status: updated.status, adminNote: updated.adminNote } : i));
    } finally {
      setSaving(null);
    }
  }

  function getItems(json: string) {
    try { return JSON.parse(json) as { productName: string; quantity: number; note: string }[]; }
    catch { return []; }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Toplu Siparişler</h1>
        <span className="text-sm text-gray-500">{total} talep</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => { setFilter(''); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-sm ${!filter ? 'bg-[#1B3A6B] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>Tümü</button>
        {STATUS_OPTIONS.map(s => (
          <button key={s} onClick={() => { setFilter(s); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-sm ${filter === s ? 'bg-[#1B3A6B] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">Talep bulunamadı.</div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left" onClick={() => toggle(item.id, item)}>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900">{item.companyName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[item.status]}`}>{STATUS_LABELS[item.status]}</span>
                  {item.adminNote && <span className="text-xs text-gray-400 italic">[Not var]</span>}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{item.city}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
                  {expanded === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {expanded === item.id && (
                <div className="border-t border-gray-100 p-4 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div><p className="text-gray-500">İlgili Kişi</p><p className="font-medium">{item.contactName}</p></div>
                    <div><p className="text-gray-500">E-posta</p><p className="font-medium">{item.email}</p></div>
                    <div><p className="text-gray-500">Telefon</p><p className="font-medium">{item.phone}</p></div>
                    <div><p className="text-gray-500">Şehir</p><p className="font-medium">{item.city}</p></div>
                    <div className="col-span-2"><p className="text-gray-500">Teslimat Adresi</p><p className="font-medium">{item.deliveryAddress}</p></div>
                    {item.note && <div className="col-span-3"><p className="text-gray-500">Müşteri Notu</p><p className="font-medium">{item.note}</p></div>}
                    {item.userName && <div><p className="text-gray-500">Üye</p><p className="font-medium">{item.userName} ({item.userEmail})</p></div>}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Ürün Listesi</p>
                    <div className="border border-gray-100 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left px-3 py-2 text-gray-500">Ürün</th>
                            <th className="text-right px-3 py-2 text-gray-500">Adet</th>
                            <th className="text-left px-3 py-2 text-gray-500">Not</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getItems(item.itemsJson).map((p, i) => (
                            <tr key={i} className="border-t border-gray-50">
                              <td className="px-3 py-2 font-medium">{p.productName}</td>
                              <td className="px-3 py-2 text-right">{p.quantity}</td>
                              <td className="px-3 py-2 text-gray-500">{p.note || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Durum</label>
                      <select value={editStatus[item.id] ?? item.status} onChange={e => setEditStatus(prev => ({ ...prev, [item.id]: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </div>
                    <div className="flex-[2]">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Admin Notu</label>
                      <input value={editNote[item.id] ?? ''} onChange={e => setEditNote(prev => ({ ...prev, [item.id]: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" placeholder="İç not..." />
                    </div>
                    <button onClick={() => save(item.id)} disabled={saving === item.id} className="px-4 py-2 bg-[#1B3A6B] text-white rounded-lg text-sm hover:bg-[#152d54] disabled:opacity-50">
                      {saving === item.id ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {total > 20 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50">Önceki</button>
          <span className="px-3 py-2 text-sm text-gray-600">{page} / {Math.ceil(total / 20)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 20)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50">Sonraki</button>
        </div>
      )}
    </div>
  );
}
