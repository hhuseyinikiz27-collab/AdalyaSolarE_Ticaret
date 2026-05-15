'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { api, ApiBundle, ApiProduct } from '@/lib/api';
import { Plus, Trash2, Edit2, Layers, Check, X, Loader2 } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5207';
const toAbsolute = (url: string) => url && !url.startsWith('http') ? `${BASE_URL}${url}` : url;

const EMPTY_FORM = {
  name: '',
  description: '',
  bundlePrice: '',
  isActive: true,
  items: [] as { productId: number; quantity: number; productName: string; productImageUrl: string; productPrice: number }[],
};

export default function AdminBundles() {
  const [bundles, setBundles] = useState<ApiBundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const load = () => {
    setLoading(true);
    api.bundles.getAllAdmin().then(setBundles).catch(() => {});
    api.admin.products.getAll()
      .then(p => setProducts(p as ApiProduct[]))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM, items: [] });
    setShowForm(true);
    setError('');
  };

  const openEdit = (b: ApiBundle) => {
    setEditId(b.id);
    setForm({
      name: b.name,
      description: b.description,
      bundlePrice: b.bundlePrice.toString(),
      isActive: b.isActive,
      items: b.items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        productName: i.productName,
        productImageUrl: i.productImageUrl,
        productPrice: i.productPrice,
      })),
    });
    setShowForm(true);
    setError('');
  };

  const addItem = (product: ApiProduct) => {
    setForm(f => {
      const existing = f.items.find(i => i.productId === product.id);
      if (existing) {
        return { ...f, items: f.items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i) };
      }
      return {
        ...f,
        items: [...f.items, { productId: product.id, quantity: 1, productName: product.name, productImageUrl: product.imageUrl, productPrice: product.price }],
      };
    });
    setProductSearch('');
  };

  const removeItem = (productId: number) => {
    setForm(f => ({ ...f, items: f.items.filter(i => i.productId !== productId) }));
  };

  const updateQty = (productId: number, qty: number) => {
    if (qty < 1) return;
    setForm(f => ({ ...f, items: f.items.map(i => i.productId === productId ? { ...i, quantity: qty } : i) }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.bundlePrice || form.items.length < 2) {
      setError('Please enter a name, price, and add at least 2 products.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: form.name,
        description: form.description,
        bundlePrice: parseFloat(form.bundlePrice),
        isActive: form.isActive,
        items: form.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      };
      if (editId) {
        await api.bundles.update(editId, payload);
      } else {
        await api.bundles.create(payload);
      }
      setShowForm(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this bundle?')) return;
    await api.bundles.delete(id);
    load();
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) &&
    !form.items.some(i => i.productId === p.id)
  ).slice(0, 8);

  const originalTotal = form.items.reduce((s, i) => s + i.productPrice * i.quantity, 0);
  const bundlePrice = parseFloat(form.bundlePrice) || 0;
  const savingPct = originalTotal > 0 ? Math.round((1 - bundlePrice / originalTotal) * 100) : 0;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1B3A6B] flex items-center gap-2">
            <Layers size={24} className="text-orange-500" />
            Bundle / Kit Management
          </h1>
          <p className="text-sm text-gray-400 mt-1">Sell multiple products together as a discounted package</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus size={16} /> New Bundle
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="font-bold text-[#1B3A6B] mb-5">{editId ? 'Edit Bundle' : 'Create New Bundle'}</h2>

          {error && <p className="text-red-500 text-sm mb-4 bg-red-50 px-4 py-2 rounded-xl">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">Bundle Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Solar Energy Starter Kit"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600 block mb-1">Bundle Price (₺) *</label>
              <input
                type="number"
                value={form.bundlePrice}
                onChange={e => setForm(f => ({ ...f, bundlePrice: e.target.value }))}
                placeholder="0"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"
              />
              {originalTotal > 0 && bundlePrice > 0 && (
                <p className={`text-xs mt-1 ${savingPct > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  Original price: {originalTotal.toLocaleString('tr-TR')} ₺
                  {savingPct > 0 ? ` · ${savingPct}% savings` : ' · Price is higher than original!'}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-gray-600 block mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
                placeholder="Get started with home solar energy installation with this kit..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="rounded" />
            <label htmlFor="isActive" className="text-sm font-semibold text-gray-600">Active (show on site)</label>
          </div>

          {/* Product search */}
          <div className="mb-4">
            <label className="text-sm font-semibold text-gray-600 block mb-1">Add Products *</label>
            <input
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              placeholder="Search by product name..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 mb-2"
            />
            {productSearch.length > 0 && (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {filteredProducts.length === 0 ? (
                  <p className="text-sm text-gray-400 p-3">No products found.</p>
                ) : (
                  filteredProducts.map(p => (
                    <button
                      key={p.id}
                      onClick={() => addItem(p)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-orange-50 text-left transition-colors border-b border-gray-100 last:border-0"
                    >
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <Image src={toAbsolute(p.imageUrl) || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=40&h=40&fit=crop'} alt={p.name} fill className="object-cover" sizes="40px" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#1B3A6B] truncate">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.price.toLocaleString('tr-TR')} ₺</p>
                      </div>
                      <Plus size={14} className="text-orange-500 shrink-0" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Selected items */}
          {form.items.length > 0 && (
            <div className="space-y-2 mb-5">
              {form.items.map(item => (
                <div key={item.productId} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image src={toAbsolute(item.productImageUrl) || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=40&h=40&fit=crop'} alt={item.productName} fill className="object-cover" sizes="40px" />
                  </div>
                  <p className="flex-1 text-sm font-semibold text-[#1B3A6B] truncate">{item.productName}</p>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-100 text-sm">−</button>
                    <span className="px-3 text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-100 text-sm">+</button>
                  </div>
                  <p className="text-sm font-bold text-[#1B3A6B] w-20 text-right shrink-0">{(item.productPrice * item.quantity).toLocaleString('tr-TR')} ₺</p>
                  <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600 shrink-0">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {editId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : bundles.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-2xl">
          <Layers size={40} className="mx-auto mb-3 text-gray-200" />
          <p>No bundles created yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bundles.map(b => {
            const discount = b.originalPrice > 0 ? Math.round((1 - b.bundlePrice / b.originalPrice) * 100) : 0;
            return (
              <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-[#1B3A6B]">{b.name}</h3>
                      {!b.isActive && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>}
                      {discount > 0 && <span className="text-xs bg-green-100 text-green-600 font-bold px-2 py-0.5 rounded-full">{discount}% Off</span>}
                    </div>
                    {b.description && <p className="text-sm text-gray-500 mb-2">{b.description}</p>}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {b.items.map(item => (
                        <div key={item.id} className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-2 py-1">
                          <div className="relative w-6 h-6 rounded overflow-hidden shrink-0">
                            <Image src={toAbsolute(item.productImageUrl) || 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=24&h=24&fit=crop'} alt={item.productName} fill className="object-cover" sizes="24px" />
                          </div>
                          <span className="text-xs text-gray-600">{item.productName}</span>
                          {item.quantity > 1 && <span className="text-xs font-bold text-orange-500">×{item.quantity}</span>}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-extrabold text-[#1B3A6B]">{b.bundlePrice.toLocaleString('tr-TR')} ₺</span>
                      {b.originalPrice > b.bundlePrice && (
                        <span className="text-sm text-gray-400 line-through">{b.originalPrice.toLocaleString('tr-TR')} ₺</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openEdit(b)} className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:text-orange-500 hover:border-orange-300 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
