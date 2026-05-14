'use client';

import { useEffect, useState } from 'react';
import { api, ApiCategory } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { revalidateAfterCategoryChange } from '@/lib/revalidate';
import { Plus, Edit2, Trash2, X, GripVertical } from 'lucide-react';

const emptyForm = { name: '', slug: '', icon: '', description: '', sortOrder: 0 };

export default function AdminCategories() {
  const { error, success } = useToast();
  const [cats, setCats] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ApiCategory | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => api.admin.categories.getAll().then(setCats).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm, sortOrder: cats.length + 1 });
    setShowModal(true);
  };

  const openEdit = (cat: ApiCategory) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, icon: cat.icon, description: cat.description, sortOrder: cat.sortOrder });
    setShowModal(true);
  };

  const handleSlugify = (name: string) => {
    const slug = name.toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setForm(f => ({ ...f, name, slug }));
  };

  const save = async () => {
    if (!form.name || !form.slug) return;
    setSaving(true);
    try {
      if (editing) {
        const updated = await api.admin.categories.update(editing.id, form);
        setCats(prev => prev.map(c => c.id === updated.id ? updated : c));
      } else {
        const created = await api.admin.categories.create(form);
        setCats(prev => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
      }
      setShowModal(false);
      success(editing ? 'Kategori güncellendi.' : 'Kategori oluşturuldu.');
      await revalidateAfterCategoryChange();
      window.dispatchEvent(new Event('category-changed'));
    } catch {
      error('Kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
    try {
      await api.admin.categories.delete(id);
      setCats(prev => prev.filter(c => c.id !== id));
      await revalidateAfterCategoryChange();
      window.dispatchEvent(new Event('category-changed'));
    } catch {
      error('Kategori silinemedi. Bu kategoriye bağlı ürünler olabilir.');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1B3A6B]">Kategori Yönetimi</h1>
          <p className="text-sm text-gray-400 mt-1">Kategoriler navbar menüsüne anında yansır</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          <Plus size={18} />
          Yeni Kategori
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {cats.map((cat) => (
            <div key={cat.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 px-5 py-4">
              <GripVertical size={16} className="text-gray-300 shrink-0" />
              <span className="text-2xl shrink-0">{cat.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#1B3A6B]">{cat.name}</p>
                <p className="text-xs text-gray-400">/{cat.slug} · Sıra: {cat.sortOrder}</p>
                {cat.description && <p className="text-xs text-gray-500 truncate mt-0.5">{cat.description}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(cat)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                  <Edit2 size={15} />
                </button>
                <button onClick={() => remove(cat.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#1B3A6B]">{editing ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Kategori Adı *</label>
                <input
                  value={form.name}
                  onChange={e => handleSlugify(e.target.value)}
                  placeholder="örn: Güneş Panelleri"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Slug *</label>
                <input
                  value={form.slug}
                  onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="gunes-panelleri"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">İkon (emoji)</label>
                  <input
                    value={form.icon}
                    onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    placeholder="☀️"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Sıra</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={e => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Açıklama</label>
                <input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Kısa açıklama"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">İptal</button>
              <button onClick={save} disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
