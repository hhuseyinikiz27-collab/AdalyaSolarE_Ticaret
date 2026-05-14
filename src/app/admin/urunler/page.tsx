'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { api, ApiProduct, ApiProductImage, ApiCategory, ApiProductDocument } from '@/lib/api';
import { revalidateAfterProductChange } from '@/lib/revalidate';
import { Plus, Pencil, Trash2, Upload, X, Check, Star, Heart, ImageIcon, Link2, ChevronDown, ChevronUp, Layers, Zap, FileText } from 'lucide-react';
import { ApiProductVariant } from '@/lib/api';

function FlashBadge({ endsAt }: { endsAt: string }) {
  const calc = () => {
    const diff = new Date(endsAt).getTime() - Date.now();
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1_000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };
  const [label, setLabel] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setLabel(calc()), 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  if (!label) return <span className="bg-gray-100 text-gray-400 text-xs px-2 py-0.5 rounded-full font-medium">Flash Bitti</span>;
  return (
    <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">
      <Zap size={10} className="fill-red-500" />
      {label}
    </span>
  );
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5207';

const empty = { name: '', description: '', price: 0, discountPrice: '' as string | number, category: '', brand: '', stock: 0, isFeatured: false, isNew: false };

export default function AdminProducts() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ApiProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [specRows, setSpecRows] = useState<{ key: string; value: string }[]>([]);
  const [specsOpen, setSpecsOpen] = useState(false);
  const [volumeTiers, setVolumeTiers] = useState<{ minQty: number; discountPct: number }[]>([]);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [flashSalePrice, setFlashSalePrice] = useState('');
  const [flashSaleEndsAt, setFlashSaleEndsAt] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState(24);

  // Çoklu fotoğraf yönetimi
  const [images, setImages] = useState<ApiProductImage[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [addingUrl, setAddingUrl] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const imgFileRef = useRef<HTMLInputElement>(null);

  // Teknik doküman yönetimi
  const [documents, setDocuments] = useState<ApiProductDocument[]>([]);
  const [docsOpen, setDocsOpen] = useState(false);
  const [docName, setDocName] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const docFileRef = useRef<HTMLInputElement>(null);

  // Varyant yönetimi
  const [variants, setVariants] = useState<ApiProductVariant[]>([]);
  const [variantsOpen, setVariantsOpen] = useState(false);
  const [variantForm, setVariantForm] = useState({ groupName: '', value: '', priceAdjustment: 0, stock: 0, isDefault: false, sortOrder: 0 });
  const [savingVariant, setSavingVariant] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ApiProductVariant | null>(null);

  // Eski tek-fotoğraf yükleme (tablo satırından)
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [pendingImageId, setPendingImageId] = useState<number | null>(null);

  const [loadError, setLoadError] = useState('');

  // Bulk edit
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkModal, setBulkModal] = useState(false);
  const [bulkForm, setBulkForm] = useState({ price: '', discountPrice: '', clearDiscount: false, stock: '', isFeatured: '' as '' | 'true' | 'false', isNew: '' as '' | 'true' | 'false' });
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkMsg, setBulkMsg] = useState('');

  const load = () => {
    setLoadError('');
    api.admin.products.getAll()
      .then(setProducts)
      .catch(e => setLoadError(e instanceof Error ? e.message : 'Ürünler yüklenemedi.'))
      .finally(() => setLoading(false));
  };

  async function handleBulkUpdate() {
    if (selected.size === 0) return;
    setBulkSaving(true);
    setBulkMsg('');
    try {
      const payload: Parameters<typeof api.admin.products.bulkUpdate>[0] = { ids: [...selected] };
      if (bulkForm.price) payload.price = parseFloat(bulkForm.price);
      if (bulkForm.clearDiscount) payload.clearDiscount = true;
      else if (bulkForm.discountPrice) payload.discountPrice = parseFloat(bulkForm.discountPrice);
      if (bulkForm.stock) payload.stock = parseInt(bulkForm.stock);
      if (bulkForm.isFeatured !== '') payload.isFeatured = bulkForm.isFeatured === 'true';
      if (bulkForm.isNew !== '') payload.isNew = bulkForm.isNew === 'true';
      const res = await api.admin.products.bulkUpdate(payload);
      setBulkMsg(`${res.updated} ürün güncellendi.`);
      setSelected(new Set());
      setBulkForm({ price: '', discountPrice: '', clearDiscount: false, stock: '', isFeatured: '', isNew: '' });
      load();
      setTimeout(() => setBulkModal(false), 1200);
    } catch (e: unknown) {
      setBulkMsg(e instanceof Error ? e.message : 'Hata oluştu.');
    } finally {
      setBulkSaving(false);
    }
  }

  useEffect(() => {
    load();
    api.admin.categories.getAll().then(setCategories).catch(() => setCategories([]));
  }, []);

  const openEdit = (p: ApiProduct) => {
    setEditing(p);
    setCreating(false);
    setForm({ name: p.name, description: p.description, price: p.price, discountPrice: p.discountPrice ?? '', category: p.category, brand: p.brand, stock: p.stock, isFeatured: p.isFeatured, isNew: p.isNew });
    // API specs varsa kullan, yoksa localStorage'dan oku
    const apiSpecs = p.specs && Object.keys(p.specs).length > 0 ? p.specs : null;
    const localRaw = typeof window !== 'undefined' ? localStorage.getItem(`adalya_specs_${p.id}`) : null;
    const localSpecs: Record<string, string> = localRaw ? JSON.parse(localRaw) : {};
    const merged = apiSpecs ?? (Object.keys(localSpecs).length > 0 ? localSpecs : null);
    setSpecRows(merged ? Object.entries(merged).map(([key, value]) => ({ key, value })) : []);
    setVolumeTiers(p.volumeDiscountsJson ? (() => { try { return JSON.parse(p.volumeDiscountsJson!); } catch { return []; } })() : []);
    setFlashSalePrice(p.flashSalePrice ? String(p.flashSalePrice) : '');
    setFlashSaleEndsAt(p.flashSaleEndsAt ? p.flashSaleEndsAt.slice(0, 16) : '');
    setWarrantyMonths(p.warrantyMonths ?? 24);
    setSpecsOpen(false);
    setVolumeOpen(false);
    setVariantsOpen(false);
    setEditingVariant(null);
    setVariantForm({ groupName: '', value: '', priceAdjustment: 0, stock: 0, isDefault: false, sortOrder: 0 });
    api.admin.products.getImages(p.id).then(setImages).catch(() => setImages([]));
    api.admin.variants.getByProduct(p.id).then(setVariants).catch(() => setVariants([]));
    api.admin.documents.getByProduct(p.id).then(setDocuments).catch(() => setDocuments([]));
  };

  const openCreate = () => {
    setEditing(null);
    setCreating(true);
    setForm({ ...empty, category: categories[0]?.slug ?? '' });
    setImages([]);
    setSpecRows([]);
    setVolumeTiers([]);
    setFlashSalePrice('');
    setFlashSaleEndsAt('');
    setWarrantyMonths(24);
    setSpecsOpen(false);
    setVolumeOpen(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const discountVal = form.discountPrice === '' ? null : Number(form.discountPrice);
      const specs = specRows.reduce<Record<string, string>>((acc, row) => {
        if (row.key.trim()) acc[row.key.trim()] = row.value;
        return acc;
      }, {});
      const volumeDiscountsJson = volumeTiers.length > 0 ? JSON.stringify(volumeTiers) : 'null';
      if (creating) {
        const created = await api.admin.products.create({ ...form, discountPrice: discountVal, specs });
        if (Object.keys(specs).length > 0) {
          localStorage.setItem(`adalya_specs_${created.id}`, JSON.stringify(specs));
        }
        if (volumeTiers.length > 0)
          await api.admin.products.update(created.id, { volumeDiscountsJson });
      } else if (editing) {
        const clearDiscount = discountVal === null && editing.discountPrice !== null;
        const flashPrice = flashSalePrice ? Number(flashSalePrice) : undefined;
        const flashEnds = flashSaleEndsAt ? new Date(flashSaleEndsAt).toISOString() : undefined;
        const clearFlashSale = !flashSalePrice;
        await api.admin.products.update(editing.id, {
          ...form, discountPrice: discountVal, clearDiscount, specs, volumeDiscountsJson,
          flashSalePrice: flashPrice, flashSaleEndsAt: flashEnds, clearFlashSale,
          warrantyMonths,
        });
        // Flash sale yeni ayarlandıysa favorileyenlere bildirim + email gönder (backend halleder)
        if (flashPrice && flashEnds) {
          api.admin.products.notifyFlashSale(editing.id, {
            flashPrice,
            originalPrice: Number(form.price),
            endsAt: flashEnds,
          }).catch(() => {});
        }
        if (Object.keys(specs).length > 0) {
          localStorage.setItem(`adalya_specs_${editing.id}`, JSON.stringify(specs));
        } else {
          localStorage.removeItem(`adalya_specs_${editing.id}`);
        }
      }
      setEditing(null);
      setCreating(false);
      await load();
      await revalidateAfterProductChange();
      window.dispatchEvent(new Event('product-changed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    await api.admin.products.delete(id);
    await load();
    await revalidateAfterProductChange();
    window.dispatchEvent(new Event('product-changed'));
  };

  const handleOldUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingImageId) return;
    setUploadingId(pendingImageId);
    try {
      await api.admin.products.uploadImage(pendingImageId, file);
      await load();
    } finally {
      setUploadingId(null);
      setPendingImageId(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleAddUrl = async () => {
    if (!editing || !urlInput.trim()) return;
    setAddingUrl(true);
    try {
      const img = await api.admin.products.addImageByUrl(editing.id, urlInput.trim());
      setImages((prev) => [...prev, img]);
      setUrlInput('');
    } finally {
      setAddingUrl(false);
    }
  };

  const handleImgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    setUploadingImg(true);
    try {
      const img = await api.admin.products.addImageByUpload(editing.id, file);
      setImages((prev) => [...prev, img]);
    } finally {
      setUploadingImg(false);
      if (imgFileRef.current) imgFileRef.current.value = '';
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!editing) return;
    await api.admin.products.deleteImage(editing.id, imageId);
    setImages((prev) => prev.filter((i) => i.id !== imageId));
  };

  const isOpen = editing !== null || creating;

  return (
    <div className="p-8">
      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6 flex items-center justify-between">
          <span>{loadError}</span>
          <button onClick={load} className="font-semibold underline ml-4">Tekrar Dene</button>
        </div>
      )}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-extrabold text-[#1B3A6B]">Ürün Yönetimi</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors">
          <Plus size={18} /> Yeni Ürün
        </button>
      </div>

      {/* Form Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-[#1B3A6B]">{creating ? 'Yeni Ürün Ekle' : 'Ürünü Düzenle'}</h2>
              <button onClick={() => { setEditing(null); setCreating(false); }} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Ürün Adı</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Açıklama</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Fiyat (₺)</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">İndirimli Fiyat (₺)</label>
                  <input type="number" placeholder="Boş = indirim yok" value={form.discountPrice} onChange={e => setForm(f => ({ ...f, discountPrice: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Stok</label>
                  <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Kategori</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 bg-white">
                    {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Marka</label>
                  <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400" />
                </div>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="w-4 h-4 accent-orange-500" />
                  <span className="text-sm font-medium text-gray-700">Öne Çıkan</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isNew} onChange={e => setForm(f => ({ ...f, isNew: e.target.checked }))} className="w-4 h-4 accent-orange-500" />
                  <span className="text-sm font-medium text-gray-700">Yeni</span>
                </label>
              </div>

              {/* Teknik özellikler */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setSpecsOpen(o => !o)}
                  className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#1B3A6B]">Teknik Özellikler</span>
                    {specRows.length > 0 && (
                      <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {specRows.length}
                      </span>
                    )}
                  </div>
                  {specsOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>

                {specsOpen && (
                  <div className="p-4 space-y-3 bg-white">
                    {specRows.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-2">Henüz özellik eklenmedi.</p>
                    )}

                    {/* Kolon başlıkları */}
                    {specRows.length > 0 && (
                      <div className="flex gap-2 px-1">
                        <span className="flex-1 text-xs font-semibold text-gray-400 uppercase">Özellik Adı</span>
                        <span className="flex-1 text-xs font-semibold text-gray-400 uppercase">Değer</span>
                        <span className="w-8" />
                      </div>
                    )}

                    {specRows.map((row, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          value={row.key}
                          onChange={e => setSpecRows(prev => prev.map((r, j) => j === i ? { ...r, key: e.target.value } : r))}
                          placeholder="örn: Güç"
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-colors"
                        />
                        <input
                          value={row.value}
                          onChange={e => setSpecRows(prev => prev.map((r, j) => j === i ? { ...r, value: e.target.value } : r))}
                          placeholder="örn: 400W"
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setSpecRows(prev => prev.filter((_, j) => j !== i))}
                          className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => setSpecRows(prev => [...prev, { key: '', value: '' }])}
                      className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-orange-200 hover:border-orange-400 text-orange-500 hover:text-orange-600 font-semibold text-sm py-2.5 rounded-lg transition-colors mt-1"
                    >
                      <Plus size={15} /> Özellik Ekle
                    </button>
                  </div>
                )}
              </div>

              {/* Toplu sipariş indirimi */}
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setVolumeOpen(o => !o)}
                  className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#1B3A6B]">Toplu Sipariş İndirimi</span>
                    {volumeTiers.length > 0 && (
                      <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
                        {volumeTiers.length} kademeli
                      </span>
                    )}
                  </div>
                  {volumeOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </button>

                {volumeOpen && (
                  <div className="p-4 space-y-3 bg-white">
                    {volumeTiers.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-2">Henüz indirim kademesi eklenmedi.</p>
                    )}
                    {volumeTiers.length > 0 && (
                      <div className="flex gap-2 px-1">
                        <span className="flex-1 text-xs font-semibold text-gray-400 uppercase">Min. Adet</span>
                        <span className="flex-1 text-xs font-semibold text-gray-400 uppercase">İndirim %</span>
                        <span className="w-8" />
                      </div>
                    )}
                    {volumeTiers.map((tier, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          type="number"
                          value={tier.minQty}
                          min={1}
                          onChange={e => setVolumeTiers(prev => prev.map((t, j) => j === i ? { ...t, minQty: Number(e.target.value) } : t))}
                          placeholder="5"
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-colors"
                        />
                        <input
                          type="number"
                          value={tier.discountPct}
                          min={1}
                          max={99}
                          onChange={e => setVolumeTiers(prev => prev.map((t, j) => j === i ? { ...t, discountPct: Number(e.target.value) } : t))}
                          placeholder="5"
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-gray-50 focus:bg-white transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setVolumeTiers(prev => prev.filter((_, j) => j !== i))}
                          className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setVolumeTiers(prev => [...prev, { minQty: 5, discountPct: 5 }])}
                      className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-blue-200 hover:border-blue-400 text-blue-500 hover:text-blue-600 font-semibold text-sm py-2.5 rounded-lg transition-colors mt-1"
                    >
                      <Plus size={15} /> Kademe Ekle
                    </button>
                  </div>
                )}
              </div>

              {/* Flash Sale */}
              {editing && (
                <div className="border border-red-100 rounded-xl p-4 space-y-3 bg-red-50/30">
                  <p className="text-sm font-bold text-red-600 flex items-center gap-1.5">⚡ Flash İndirim</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Flash Fiyat (₺)</label>
                      <input
                        type="number"
                        value={flashSalePrice}
                        onChange={e => setFlashSalePrice(e.target.value)}
                        placeholder="Boş bırakırsan iptal edilir"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 block mb-1">Bitiş Zamanı</label>
                      <input
                        type="datetime-local"
                        value={flashSaleEndsAt}
                        onChange={e => setFlashSaleEndsAt(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400"
                      />
                    </div>
                  </div>
                  {flashSalePrice && (
                    <button type="button" onClick={() => { setFlashSalePrice(''); setFlashSaleEndsAt(''); }}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold">✕ Flash İndirimi Kaldır</button>
                  )}
                </div>
              )}

              {/* Garanti Süresi */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Garanti Süresi (Ay)</label>
                <input
                  type="number"
                  value={warrantyMonths}
                  min={0}
                  onChange={e => setWarrantyMonths(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                />
              </div>

              {/* Fotoğraf yönetimi — sadece düzenleme modunda */}
              {editing && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Ürün Fotoğrafları</label>

                  {/* Mevcut fotoğraflar */}
                  {images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {images.map((img) => (
                        <div key={img.id} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                          <Image
                            src={img.url.startsWith('/') ? `${BASE_URL}${img.url}` : img.url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="80px"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/80x80/e5e7eb/9ca3af?text=?'; }}
                          />
                          <button
                            onClick={() => handleDeleteImage(img.id)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          >
                            <X size={18} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* URL ile ekle */}
                  <div className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://... fotoğraf URL'si"
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddUrl(); }}
                    />
                    <button
                      onClick={handleAddUrl}
                      disabled={addingUrl || !urlInput.trim()}
                      className="flex items-center gap-1.5 bg-[#1B3A6B] hover:bg-[#152d54] disabled:bg-gray-300 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      <Link2 size={14} />
                      {addingUrl ? '...' : 'Ekle'}
                    </button>
                  </div>

                  {/* Dosya yükle */}
                  <button
                    onClick={() => imgFileRef.current?.click()}
                    disabled={uploadingImg}
                    className="flex items-center gap-2 border border-dashed border-gray-300 hover:border-orange-400 text-gray-500 hover:text-orange-500 px-4 py-2 rounded-lg text-sm transition-colors w-full justify-center"
                  >
                    <Upload size={15} />
                    {uploadingImg ? 'Yükleniyor...' : 'Bilgisayardan Yükle'}
                  </button>
                  <input ref={imgFileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImgUpload} />

                  {images.length === 0 && (
                    <p className="text-xs text-gray-400 mt-2">Henüz fotoğraf yok. URL girin veya dosya yükleyin.</p>
                  )}
                </div>
              )}

              {/* Varyant Yönetimi — sadece düzenleme modunda */}
              {editing && (
                <div>
                  <button
                    type="button"
                    onClick={() => setVariantsOpen(v => !v)}
                    className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Layers size={15} className="text-orange-500" />
                      <span className="text-sm font-bold text-[#1B3A6B]">Varyantlar</span>
                      {variants.length > 0 && (
                        <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">{variants.length}</span>
                      )}
                    </div>
                    {variantsOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </button>

                  {variantsOpen && (
                    <div className="mt-3 space-y-3">
                      {/* Mevcut varyantlar */}
                      {variants.length > 0 && (
                        <div className="space-y-2">
                          {[...new Set(variants.map(v => v.groupName))].map(group => (
                            <div key={group}>
                              <p className="text-xs font-bold text-gray-500 uppercase mb-1.5">{group}</p>
                              <div className="flex flex-wrap gap-2">
                                {variants.filter(v => v.groupName === group).map(v => (
                                  <div key={v.id} className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold">
                                    <span className="text-gray-700">{v.value}</span>
                                    {v.priceAdjustment !== 0 && (
                                      <span className="text-gray-400">({v.priceAdjustment > 0 ? '+' : ''}{v.priceAdjustment}₺)</span>
                                    )}
                                    <span className="text-gray-400 ml-1">Stok: {v.stock}</span>
                                    {v.isDefault && <span className="text-orange-500 ml-1">★</span>}
                                    <button
                                      onClick={() => {
                                        setEditingVariant(v);
                                        setVariantForm({ groupName: v.groupName, value: v.value, priceAdjustment: v.priceAdjustment, stock: v.stock, isDefault: v.isDefault, sortOrder: v.sortOrder });
                                      }}
                                      className="ml-1 text-blue-400 hover:text-blue-600"
                                    >
                                      <Pencil size={11} />
                                    </button>
                                    <button
                                      onClick={async () => {
                                        await api.admin.variants.delete(v.id);
                                        setVariants(prev => prev.filter(x => x.id !== v.id));
                                      }}
                                      className="text-red-400 hover:text-red-600"
                                    >
                                      <X size={11} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Yeni/düzenleme formu */}
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <p className="text-xs font-bold text-gray-500">{editingVariant ? 'Varyant Düzenle' : 'Yeni Varyant Ekle'}</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Grup (örn: Güç, Renk)</label>
                            <input
                              value={variantForm.groupName}
                              onChange={e => setVariantForm(p => ({ ...p, groupName: e.target.value }))}
                              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-orange-400"
                              placeholder="Güç"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Değer (örn: 300W)</label>
                            <input
                              value={variantForm.value}
                              onChange={e => setVariantForm(p => ({ ...p, value: e.target.value }))}
                              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-orange-400"
                              placeholder="300W"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Fiyat Farkı (₺)</label>
                            <input
                              type="number"
                              value={variantForm.priceAdjustment}
                              onChange={e => setVariantForm(p => ({ ...p, priceAdjustment: Number(e.target.value) }))}
                              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-orange-400"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">Stok</label>
                            <input
                              type="number"
                              value={variantForm.stock}
                              onChange={e => setVariantForm(p => ({ ...p, stock: Number(e.target.value) }))}
                              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-orange-400"
                            />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                          <input type="checkbox" checked={variantForm.isDefault} onChange={e => setVariantForm(p => ({ ...p, isDefault: e.target.checked }))} />
                          Varsayılan seçenek
                        </label>
                        <div className="flex gap-2">
                          {editingVariant && (
                            <button
                              onClick={() => { setEditingVariant(null); setVariantForm({ groupName: '', value: '', priceAdjustment: 0, stock: 0, isDefault: false, sortOrder: 0 }); }}
                              className="flex-1 border border-gray-200 rounded-lg py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                            >
                              Vazgeç
                            </button>
                          )}
                          <button
                            disabled={savingVariant || !variantForm.groupName.trim() || !variantForm.value.trim()}
                            onClick={async () => {
                              if (!editing || !variantForm.groupName.trim() || !variantForm.value.trim()) return;
                              setSavingVariant(true);
                              try {
                                if (editingVariant) {
                                  const updated = await api.admin.variants.update(editingVariant.id, variantForm);
                                  setVariants(prev => prev.map(v => v.id === editingVariant.id ? updated : v));
                                  setEditingVariant(null);
                                } else {
                                  const created = await api.admin.variants.create(editing.id, variantForm);
                                  setVariants(prev => [...prev, created]);
                                }
                                setVariantForm({ groupName: '', value: '', priceAdjustment: 0, stock: 0, isDefault: false, sortOrder: 0 });
                              } finally {
                                setSavingVariant(false);
                              }
                            }}
                            className="flex-1 bg-[#1B3A6B] hover:bg-[#2d5282] disabled:bg-gray-300 text-white rounded-lg py-2 text-xs font-semibold transition-colors"
                          >
                            {savingVariant ? '...' : editingVariant ? 'Güncelle' : 'Ekle'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Teknik Doküman Yönetimi — sadece düzenleme modunda */}
              {editing && (
                <div>
                  <button
                    type="button"
                    onClick={() => setDocsOpen(v => !v)}
                    className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={15} className="text-orange-500" />
                      <span className="text-sm font-bold text-[#1B3A6B]">Teknik Belgeler</span>
                      {documents.length > 0 && (
                        <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-0.5 rounded-full">{documents.length}</span>
                      )}
                    </div>
                    {docsOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                  </button>

                  {docsOpen && (
                    <div className="mt-3 space-y-3">
                      {documents.length > 0 && (
                        <div className="space-y-2">
                          {documents.map(doc => (
                            <div key={doc.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-2.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-lg">{doc.fileType === 'pdf' ? '📄' : doc.fileType === 'zip' ? '🗜️' : '📎'}</span>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-gray-700 truncate">{doc.name}</p>
                                  <p className="text-[10px] text-gray-400">{doc.fileType.toUpperCase()} · {doc.sizeBytes > 0 ? (doc.sizeBytes / 1024 / 1024).toFixed(1) + ' MB' : ''}</p>
                                </div>
                              </div>
                              <button
                                onClick={async () => {
                                  await api.admin.documents.delete(editing.id, doc.id);
                                  setDocuments(prev => prev.filter(d => d.id !== doc.id));
                                }}
                                className="text-red-400 hover:text-red-600 ml-2 shrink-0"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                        <p className="text-xs font-bold text-gray-500">Yeni Belge Yükle</p>
                        <input
                          type="text"
                          value={docName}
                          onChange={e => setDocName(e.target.value)}
                          placeholder="Belge adı (örn: Teknik Veri Sayfası)"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-orange-400"
                        />
                        <input
                          ref={docFileRef}
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.dwg"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file || !editing) return;
                            setUploadingDoc(true);
                            try {
                              const uploaded = await api.admin.documents.upload(editing.id, file, docName || file.name.replace(/\.[^.]+$/, ''));
                              setDocuments(prev => [...prev, uploaded]);
                              setDocName('');
                            } catch { /* ignore */ } finally {
                              setUploadingDoc(false);
                              if (docFileRef.current) docFileRef.current.value = '';
                            }
                          }}
                        />
                        <button
                          type="button"
                          disabled={uploadingDoc}
                          onClick={() => docFileRef.current?.click()}
                          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 hover:border-orange-400 rounded-lg py-2.5 text-xs font-semibold text-gray-500 hover:text-orange-500 transition-colors disabled:opacity-50"
                        >
                          {uploadingDoc ? 'Yükleniyor...' : <><Upload size={13} /> PDF, DOC, XLS, ZIP, DWG yükle</>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t">
              <button onClick={() => { setEditing(null); setCreating(false); }} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">İptal</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                {saving ? 'Kaydediliyor...' : <><Check size={16} /> Kaydet</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Eski tek-fotoğraf upload (tablo satırı) */}
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleOldUpload} />

      {/* Bulk Edit Modal */}
      {bulkModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setBulkModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Toplu Düzenleme</h3>
            <p className="text-sm text-gray-500 mb-4">{selected.size} ürün seçili. Boş bırakılan alanlar değiştirilmez.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Yeni Fiyat (₺)</label>
                <input type="number" value={bulkForm.price} onChange={e => setBulkForm(f => ({ ...f, price: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" placeholder="Boş bırakırsan değişmez" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">İndirimli Fiyat (₺)</label>
                <div className="flex gap-2">
                  <input type="number" value={bulkForm.discountPrice} onChange={e => setBulkForm(f => ({ ...f, discountPrice: e.target.value, clearDiscount: false }))} disabled={bulkForm.clearDiscount} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] disabled:opacity-50" placeholder="Boş bırakırsan değişmez" />
                  <label className="flex items-center gap-1 text-xs text-red-600 cursor-pointer whitespace-nowrap">
                    <input type="checkbox" checked={bulkForm.clearDiscount} onChange={e => setBulkForm(f => ({ ...f, clearDiscount: e.target.checked, discountPrice: '' }))} /> İndirimi kaldır
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Stok</label>
                <input type="number" value={bulkForm.stock} onChange={e => setBulkForm(f => ({ ...f, stock: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" placeholder="Boş bırakırsan değişmez" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Öne Çıkan</label>
                  <select value={bulkForm.isFeatured} onChange={e => setBulkForm(f => ({ ...f, isFeatured: e.target.value as '' | 'true' | 'false' }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
                    <option value="">Değiştirme</option>
                    <option value="true">Evet</option>
                    <option value="false">Hayır</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Yeni Ürün</label>
                  <select value={bulkForm.isNew} onChange={e => setBulkForm(f => ({ ...f, isNew: e.target.value as '' | 'true' | 'false' }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]">
                    <option value="">Değiştirme</option>
                    <option value="true">Evet</option>
                    <option value="false">Hayır</option>
                  </select>
                </div>
              </div>
            </div>
            {bulkMsg && <p className={`text-sm mt-3 ${bulkMsg.includes('güncellendi') ? 'text-green-600' : 'text-red-600'}`}>{bulkMsg}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setBulkModal(false)} className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">İptal</button>
              <button onClick={handleBulkUpdate} disabled={bulkSaving} className="flex-1 py-2 bg-[#1B3A6B] text-white rounded-lg text-sm hover:bg-[#152d54] disabled:opacity-50">
                {bulkSaving ? 'Güncelleniyor...' : `${selected.size} Ürünü Güncelle`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions Bar */}
      {selected.size > 0 && (
        <div className="bg-[#1B3A6B] text-white rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium">{selected.size} ürün seçildi</span>
          <div className="flex gap-2">
            <button onClick={() => setSelected(new Set())} className="text-sm text-blue-200 hover:text-white">Seçimi Kaldır</button>
            <button onClick={() => setBulkModal(true)} className="px-3 py-1.5 bg-white text-[#1B3A6B] rounded-lg text-sm font-semibold hover:bg-blue-50">Toplu Düzenle</button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-4">
                  <input type="checkbox" checked={selected.size === products.length && products.length > 0} onChange={e => setSelected(e.target.checked ? new Set(products.map(p => p.id)) : new Set())} className="rounded" />
                </th>
                <th className="text-left px-6 py-4 font-semibold text-gray-500">Ürün</th>
                <th className="text-left px-4 py-4 font-semibold text-gray-500">Kategori</th>
                <th className="text-left px-4 py-4 font-semibold text-gray-500">Fiyat</th>
                <th className="text-left px-4 py-4 font-semibold text-gray-500">Stok</th>
                <th className="text-left px-4 py-4 font-semibold text-gray-500">Favori</th>
                <th className="text-left px-4 py-4 font-semibold text-gray-500">Durum</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-500">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(p => (
                <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${selected.has(p.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-4 py-4">
                    <input type="checkbox" checked={selected.has(p.id)} onChange={e => setSelected(prev => { const s = new Set(prev); e.target.checked ? s.add(p.id) : s.delete(p.id); return s; })} className="rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-[#1B3A6B] line-clamp-1">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.brand}</p>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{categories.find(c => c.slug === p.category)?.name || p.category}</td>
                  <td className="px-4 py-4">
                    {(() => {
                      const flashActive = !!(p.flashSalePrice && p.flashSaleEndsAt && new Date(p.flashSaleEndsAt) > new Date());
                      if (flashActive) return (
                        <div>
                          <span className="font-semibold text-red-600">{p.flashSalePrice!.toLocaleString('tr-TR')} ₺</span>
                          <span className="text-xs text-gray-400 line-through ml-1">{p.price.toLocaleString('tr-TR')} ₺</span>
                        </div>
                      );
                      if (p.discountPrice) return (
                        <div>
                          <span className="font-semibold text-red-600">{p.discountPrice.toLocaleString('tr-TR')} ₺</span>
                          <span className="text-xs text-gray-400 line-through ml-1">{p.price.toLocaleString('tr-TR')} ₺</span>
                        </div>
                      );
                      return <span className="font-semibold text-[#1B3A6B]">{p.price.toLocaleString('tr-TR')} ₺</span>;
                    })()}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`font-semibold ${p.stock > 10 ? 'text-green-600' : p.stock > 0 ? 'text-orange-500' : 'text-red-500'}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-1 text-sm font-semibold text-red-500">
                      <Heart size={13} className="fill-red-400 text-red-400" />
                      {p.favoriteCount ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {p.isFeatured && <span className="bg-orange-100 text-orange-600 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Star size={10} />Öne Çıkan</span>}
                      {p.isNew && <span className="bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full font-medium">Yeni</span>}
                      {p.flashSalePrice && p.flashSaleEndsAt && new Date(p.flashSaleEndsAt) > new Date() && (
                        <FlashBadge endsAt={p.flashSaleEndsAt} />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        title="Düzenle / Fotoğraf Ekle"
                        className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => { setPendingImageId(p.id); fileRef.current?.click(); }}
                        disabled={uploadingId === p.id}
                        title="Hızlı Resim Yükle"
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        {uploadingId === p.id ? <span className="text-xs">...</span> : <ImageIcon size={16} />}
                      </button>
                      <button onClick={() => handleDelete(p.id)} title="Sil" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
