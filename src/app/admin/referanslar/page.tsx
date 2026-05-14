'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import { api, ApiProjectReference } from '@/lib/api';

const EMPTY: Omit<ApiProjectReference, 'id'> = {
  title: '', city: '', type: 'Ticari', capacity: '', panels: 0,
  year: new Date().getFullYear().toString(), description: '', imageUrl: '', savings: '',
  isPublished: true, sortOrder: 0,
};

const TYPE_OPTIONS = ['Konut', 'Ticari', 'Endüstriyel', 'Tarımsal', 'Kamu'];

export default function AdminReferanslar() {
  const [items, setItems] = useState<ApiProjectReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: 'new' | 'edit'; form: Omit<ApiProjectReference, 'id'>; id?: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    api.projects.adminGetAll().then(setItems).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => setModal({ mode: 'new', form: { ...EMPTY, sortOrder: items.length + 1 } });
  const openEdit = (item: ApiProjectReference) => setModal({ mode: 'edit', form: { ...item }, id: item.id });

  const save = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      if (modal.mode === 'new') {
        const created = await api.projects.adminCreate(modal.form);
        setItems(prev => [...prev, created]);
      } else if (modal.id) {
        const updated = await api.projects.adminUpdate(modal.id, modal.form);
        setItems(prev => prev.map(i => i.id === modal.id ? updated : i));
      }
      setModal(null);
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: number) => {
    if (!confirm('Bu referansı silmek istediğinize emin misiniz?')) return;
    setDeleting(id);
    try {
      await api.projects.adminDelete(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const setField = <K extends keyof Omit<ApiProjectReference, 'id'>>(k: K, v: Omit<ApiProjectReference, 'id'>[K]) => {
    setModal(m => m ? { ...m, form: { ...m.form, [k]: v } } : m);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Referans Projeler</h1>
          <p className="text-sm text-gray-500">{items.length} proje</p>
        </div>
        <button onClick={openNew} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors">
          <Plus size={16} /> Yeni Proje
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <ImageIcon size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400">Henüz proje yok. İlk projeyi ekleyin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${!item.isPublished ? 'opacity-60 border-dashed' : 'border-gray-100'}`}>
              {item.imageUrl && (
                <div className="h-36 overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  {!item.isPublished && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-xs font-bold bg-gray-700 px-2 py-1 rounded-full">Gizli</span>
                    </div>
                  )}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="font-bold text-gray-800 text-sm">{item.title}</p>
                  <span className="text-xs text-gray-400 shrink-0">#{item.sortOrder}</span>
                </div>
                <p className="text-xs text-gray-400 mb-3">{item.city} · {item.type} · {item.capacity} · {item.year}</p>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(item)} className="flex-1 flex items-center justify-center gap-1.5 border border-gray-200 text-gray-600 font-semibold py-1.5 rounded-xl text-xs hover:bg-gray-50 transition-colors">
                    <Edit2 size={12} /> Düzenle
                  </button>
                  <button
                    onClick={async () => {
                      const updated = await api.projects.adminUpdate(item.id, { ...item, isPublished: !item.isPublished });
                      setItems(prev => prev.map(i => i.id === item.id ? updated : i));
                    }}
                    className="border border-gray-200 text-gray-500 py-1.5 px-3 rounded-xl hover:bg-gray-50 transition-colors"
                    title={item.isPublished ? 'Gizle' : 'Yayınla'}
                  >
                    {item.isPublished ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  <button onClick={() => del(item.id)} disabled={deleting === item.id} className="border border-red-200 text-red-500 py-1.5 px-3 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-[#1B3A6B] text-lg mb-4">
              {modal.mode === 'new' ? 'Yeni Proje Ekle' : 'Projeyi Düzenle'}
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Proje Adı *</label>
                  <input value={modal.form.title} onChange={e => setField('title', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Şehir *</label>
                  <input value={modal.form.city} onChange={e => setField('city', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Tür</label>
                  <select value={modal.form.type} onChange={e => setField('type', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400">
                    {TYPE_OPTIONS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Kapasite</label>
                  <input value={modal.form.capacity} onChange={e => setField('capacity', e.target.value)}
                    placeholder="120 kWp"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Panel Sayısı</label>
                  <input type="number" value={modal.form.panels} onChange={e => setField('panels', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Yıl</label>
                  <input value={modal.form.year} onChange={e => setField('year', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Tasarruf</label>
                  <input value={modal.form.savings} onChange={e => setField('savings', e.target.value)}
                    placeholder="18.000 ₺/ay"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Sıra</label>
                  <input type="number" value={modal.form.sortOrder} onChange={e => setField('sortOrder', parseInt(e.target.value) || 0)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Görsel URL</label>
                <input value={modal.form.imageUrl} onChange={e => setField('imageUrl', e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">Açıklama</label>
                <textarea rows={3} value={modal.form.description} onChange={e => setField('description', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={modal.form.isPublished} onChange={e => setField('isPublished', e.target.checked)}
                  className="w-4 h-4 accent-orange-500" />
                <span className="text-sm font-semibold text-gray-700">Yayınlansın</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setModal(null)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 text-sm transition-colors">İptal</button>
              <button onClick={save} disabled={saving || !modal.form.title || !modal.form.city}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
