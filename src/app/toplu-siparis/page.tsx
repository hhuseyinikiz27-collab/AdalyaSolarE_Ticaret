'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Plus, Trash2, CheckCircle, Building2, Package } from 'lucide-react';

interface BulkItem {
  id: number;
  productName: string;
  quantity: number;
  note: string;
}

export default function TopluSiparisPage() {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<BulkItem[]>([{ id: 1, productName: '', quantity: 1, note: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  function addItem() {
    setItems(prev => [...prev, { id: Date.now(), productName: '', quantity: 1, note: '' }]);
  }

  function removeItem(id: number) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  function updateItem(id: number, field: keyof BulkItem, value: string | number) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName || !contactName || !email || !phone || !city || !deliveryAddress) {
      setError('Please fill in all required fields.');
      return;
    }
    const validItems = items.filter(i => i.productName.trim());
    if (validItems.length === 0) {
      setError('Please add at least one product.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await api.bulkOrder.create({
        companyName,
        contactName,
        email,
        phone,
        city,
        deliveryAddress,
        note,
        itemsJson: JSON.stringify(validItems.map(i => ({
          productName: i.productName,
          quantity: i.quantity,
          note: i.note,
        }))),
      });
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your Request Has Been Received!</h2>
          <p className="text-gray-600 mb-6">Your bulk order request is under review. We will contact you as soon as possible.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="px-4 py-2 bg-[#1B3A6B] text-white rounded-lg text-sm font-medium hover:bg-[#152d54]">Home</Link>
            <Link href="/urunler" className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">Browse Products</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#1B3A6B] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Order Form</h1>
          <p className="text-gray-500 mt-2">Get a special price quote for corporate purchases. Our team will contact you as soon as possible.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" placeholder="e.g.: ABC Energy Inc." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                <input value={contactName} onChange={e => setContactName(e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" placeholder="Full Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" placeholder="example@company.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" placeholder="05xx xxx xx xx" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input value={city} onChange={e => setCity(e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" placeholder="Istanbul" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
                <input value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" placeholder="Full address" />
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Product List</h2>
              <button type="button" onClick={addItem} className="flex items-center gap-1 text-sm text-[#1B3A6B] font-medium hover:underline">
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className="flex gap-2 items-start">
                  <div className="flex items-center justify-center w-7 h-7 bg-gray-100 rounded-full text-xs font-semibold text-gray-500 flex-shrink-0 mt-2">
                    {idx + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input value={item.productName} onChange={e => updateItem(item.id, 'productName', e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B] sm:col-span-1" placeholder="Product name / code" />
                    <input type="number" min={1} value={item.quantity} onChange={e => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" placeholder="Quantity" />
                    <input value={item.note} onChange={e => updateItem(item.id, 'note', e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" placeholder="Special request (optional)" />
                  </div>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(item.id)} className="flex-shrink-0 mt-2 text-red-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]" placeholder="Delivery date, special requirements, etc..." />
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>}

          <button type="submit" disabled={submitting} className="w-full py-3 bg-[#1B3A6B] text-white rounded-xl font-semibold hover:bg-[#152d54] disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Submitting...</> : <><Package className="w-4 h-4" /> Request Quote</>}
          </button>
        </form>
      </div>
    </main>
  );
}
