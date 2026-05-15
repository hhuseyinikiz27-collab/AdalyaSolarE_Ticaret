'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { ChevronDown, ChevronUp, Package, Phone, MapPin, MessageSquare, ExternalLink, Loader2, AlertCircle, Truck, X, Download } from 'lucide-react';
import Image from 'next/image';

const STATUS_OPTIONS = ['hazirlanıyor', 'kargoya-verildi', 'dagitimda', 'teslim-edildi', 'iptal'];
const STATUS_LABELS: Record<string, string> = {
  'hazirlanıyor': 'Processing',
  'kargoya-verildi': 'Shipped',
  'dagitimda': 'In Transit',
  'teslim-edildi': 'Delivered',
  'iptal': 'Cancelled',
};
const STATUS_COLORS: Record<string, string> = {
  'hazirlanıyor': 'bg-orange-100 text-orange-600',
  'kargoya-verildi': 'bg-purple-100 text-purple-600',
  'dagitimda': 'bg-blue-100 text-blue-600',
  'teslim-edildi': 'bg-green-100 text-green-600',
  'iptal': 'bg-red-100 text-red-600',
};
const CARGO_COMPANIES = ['Aras Kargo', 'Yurtiçi Kargo', 'PTT Kargo', 'MNG Kargo', 'Sürat Kargo', 'Other'];

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  productName: string;
  productImageUrl: string;
  product?: { name: string };
}

interface Order {
  id: number;
  total: number;
  status: string;
  createdAt: string;
  shippingFullName: string;
  shippingPhone: string;
  shippingAddress: string;
  note: string;
  trackingCode?: string;
  cargoCompany?: string;
  adminNote?: string | null;
  user: { name: string; email: string };
  items: OrderItem[];
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [statusError, setStatusError] = useState('');
  const [cargoModal, setCargoModal] = useState<{ orderId: number; userEmail: string; userName: string } | null>(null);
  const [cargoForm, setCargoForm] = useState({ trackingCode: '', cargoCompany: 'Aras Kargo' });
  const [cargoSaving, setCargoSaving] = useState(false);

  // Order admin note
  const [noteOrderId, setNoteOrderId] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteMsg, setNoteMsg] = useState('');

  const [loadError, setLoadError] = useState('');

  const load = () => {
    setLoadError('');
    api.admin.orders.getAll()
      .then(data => setOrders(data as Order[]))
      .catch(e => setLoadError(e instanceof Error ? e.message : 'Orders could not be loaded.'))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleStatus = async (id: number, status: string) => {
    if (status === 'kargoya-verildi') {
      const order = orders.find(o => o.id === id);
      setCargoModal({ orderId: id, userEmail: order?.user?.email ?? '', userName: order?.shippingFullName ?? '' });
      setCargoForm({ trackingCode: order?.trackingCode ?? '', cargoCompany: order?.cargoCompany ?? 'Aras Kargo' });
      return;
    }
    const prev = orders.find(o => o.id === id)?.status;
    setOrders(p => p.map(o => o.id === id ? { ...o, status } : o));
    setSavingId(id);
    try {
      await api.admin.orders.updateStatus(id, status);
      // If order is cancelled, reverse the earned loyalty points
      if (status === 'iptal') {
        api.admin.loyalty.deductForOrder(id).catch(() => {});
      }
      window.dispatchEvent(new Event('order-status-updated'));
    } catch (e: unknown) {
      setOrders(p => p.map(o => o.id === id ? { ...o, status: prev ?? o.status } : o));
      const msg = e instanceof Error ? e.message : 'Status could not be updated.';
      setStatusError(msg);
      setTimeout(() => setStatusError(''), 4000);
    } finally {
      setSavingId(null);
    }
  };

  const handleNoteSave = async () => {
    if (noteOrderId === null) return;
    setNoteSaving(true);
    setNoteMsg('');
    try {
      await api.admin.orders.updateNote(noteOrderId, noteText || null);
      setOrders(prev => prev.map(o => o.id === noteOrderId ? { ...o, adminNote: noteText || null } : o));
      setNoteMsg('Note saved.');
      setTimeout(() => { setNoteOrderId(null); setNoteMsg(''); }, 700);
    } catch {
      setNoteMsg('Could not be saved.');
    } finally {
      setNoteSaving(false);
    }
  };

  const handleCargoConfirm = async () => {
    if (!cargoModal) return;
    if (!cargoForm.trackingCode.trim()) return;
    setCargoSaving(true);
    const prev = orders.find(o => o.id === cargoModal.orderId)?.status;
    setOrders(p => p.map(o => o.id === cargoModal.orderId
      ? { ...o, status: 'kargoya-verildi', trackingCode: cargoForm.trackingCode, cargoCompany: cargoForm.cargoCompany }
      : o
    ));
    try {
      await api.admin.orders.updateStatus(cargoModal.orderId, 'kargoya-verildi', {
        trackingCode: cargoForm.trackingCode,
        cargoCompany: cargoForm.cargoCompany,
      });
      if (cargoModal.userEmail) {
        import('@/app/actions/email')
          .then(m => m.notifyShipment({
            to:              cargoModal.userEmail,
            customerName:    cargoModal.userName,
            orderId:         cargoModal.orderId,
            trackingCode:    cargoForm.trackingCode,
            cargoCompany:    cargoForm.cargoCompany,
          }))
          .catch(() => {});
      }
      setCargoModal(null);
    } catch (e: unknown) {
      setOrders(p => p.map(o => o.id === cargoModal.orderId ? { ...o, status: prev ?? o.status } : o));
      const msg = e instanceof Error ? e.message : 'Shipping info could not be saved.';
      setStatusError(msg);
      setTimeout(() => setStatusError(''), 4000);
      setCargoModal(null);
    } finally {
      setCargoSaving(false);
    }
  };

  const filtered = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);

  const totalRevenue = orders.filter(o => o.status !== 'iptal').reduce((s, o) => s + o.total, 0);

  const downloadCSV = () => {
    const headers = ['Order No', 'Date', 'Customer', 'Email', 'Total (₺)', 'Status', 'Address', 'Products'];
    const rows = filtered.map(o => [
      o.id,
      new Date(o.createdAt).toLocaleDateString('tr-TR'),
      o.shippingFullName,
      o.user?.email ?? '',
      o.total.toFixed(2).replace('.', ','),
      STATUS_LABELS[o.status] ?? o.status,
      `"${o.shippingAddress.replace(/"/g, '""')}"`,
      `"${(o.items ?? []).map(i => `${i.productName} x${i.quantity}`).join('; ')}"`,
    ]);
    const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">

      {/* Shipping code modal */}
      {cargoModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#1B3A6B] flex items-center gap-2">
                <Truck size={20} className="text-purple-500" />
                Shipping Details — #{cargoModal.orderId}
              </h3>
              <button onClick={() => setCargoModal(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Shipping Company</label>
                <select
                  value={cargoForm.cargoCompany}
                  onChange={e => setCargoForm(p => ({ ...p, cargoCompany: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                >
                  {CARGO_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Tracking Code *</label>
                <input
                  type="text"
                  value={cargoForm.trackingCode}
                  onChange={e => setCargoForm(p => ({ ...p, trackingCode: e.target.value }))}
                  placeholder="Cargo tracking number"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                />
              </div>
              {cargoModal.userEmail && (
                <p className="text-xs text-gray-400 bg-blue-50 rounded-lg px-3 py-2">
                  Shipping notification will be sent automatically to <strong>{cargoModal.userEmail}</strong>.
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setCargoModal(null)}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCargoConfirm}
                disabled={cargoSaving || !cargoForm.trackingCode.trim()}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
              >
                {cargoSaving ? <Loader2 size={15} className="animate-spin" /> : <Truck size={15} />}
                Ship Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error notification */}
      {statusError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-red-600 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg">
          <AlertCircle size={16} />
          {statusError}
        </div>
      )}

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6 flex items-center justify-between">
          <span>{loadError}</span>
          <button onClick={load} className="font-semibold underline ml-4">Try Again</button>
        </div>
      )}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1B3A6B]">Order Management</h1>
          <p className="text-sm text-gray-400 mt-1">{orders.length} orders · {totalRevenue.toLocaleString('tr-TR')} ₺ total revenue</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadCSV}
            disabled={filtered.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <Download size={15} />
            Download CSV
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Filter:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-orange-400"
            >
              <option value="all">All</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400 bg-white rounded-2xl">
            <Package size={40} className="mx-auto mb-3 text-gray-200" />
            <p>No orders found.</p>
          </div>
        ) : (
          filtered.map(order => {
            const isExpanded = expanded === order.id;
            const subtotal = order.items?.reduce((s, i) => s + i.unitPrice * i.quantity, 0) ?? 0;
            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Header row */}
                <div className="flex flex-wrap items-center gap-4 px-6 py-4">
                  <div className="min-w-[80px]">
                    <p className="font-bold text-[#1B3A6B]">#{order.id}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <p className="font-medium text-gray-700">{order.user?.name ?? order.shippingFullName}</p>
                    <p className="text-xs text-gray-400">{order.user?.email}</p>
                  </div>
                  <div className="text-right min-w-[100px]">
                    <p className="font-extrabold text-[#1B3A6B]">{order.total.toLocaleString('tr-TR')} ₺</p>
                    <p className="text-xs text-gray-400">{order.items?.length ?? 0} items</p>
                  </div>
                  <div>
                    <div className="relative inline-block">
                      <select
                        value={order.status}
                        onChange={e => handleStatus(order.id, e.target.value)}
                        disabled={savingId === order.id}
                        className={`text-xs px-3 py-1.5 pr-7 rounded-full font-semibold appearance-none cursor-pointer border-0 outline-none disabled:opacity-60 ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                      {savingId === order.id
                        ? <Loader2 size={11} className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin pointer-events-none" />
                        : <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                      }
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <Link
                      href={`/siparis-takip?id=${order.id}`}
                      target="_blank"
                      className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-semibold"
                    >
                      <ExternalLink size={13} />Track
                    </Link>
                    <button
                      onClick={() => setExpanded(isExpanded ? null : order.id)}
                      className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-600 font-semibold"
                    >
                      {isExpanded ? <><ChevronUp size={14} />Hide</> : <><ChevronDown size={14} />Details</>}
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Products */}
                    <div className="lg:col-span-2 space-y-2">
                      <p className="text-xs font-bold text-gray-400 uppercase mb-3">Products</p>
                      {order.items?.map((item) => {
                        const imgUrl = item.productImageUrl && !item.productImageUrl.startsWith('/')
                          ? item.productImageUrl
                          : 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=80&h=80&fit=crop';
                        return (
                          <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                              <Image src={imgUrl} alt={item.productName} fill className="object-cover" sizes="48px" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#1B3A6B] truncate">{item.productName}</p>
                              <p className="text-xs text-gray-400">{item.quantity} pcs × {item.unitPrice.toLocaleString('tr-TR')} ₺</p>
                            </div>
                            <p className="font-bold text-[#1B3A6B] text-sm shrink-0">{(item.unitPrice * item.quantity).toLocaleString('tr-TR')} ₺</p>
                          </div>
                        );
                      })}
                      {/* Price breakdown */}
                      <div className="bg-white rounded-xl p-4 space-y-1.5 mt-2">
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Subtotal</span>
                          <span>{subtotal.toLocaleString('tr-TR')} ₺</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Shipping</span>
                          <span>{(order.total - subtotal) === 0 ? <span className="text-green-600">Free</span> : `${(order.total - subtotal).toLocaleString('tr-TR')} ₺`}</span>
                        </div>
                        <div className="flex justify-between font-extrabold text-[#1B3A6B] border-t pt-2">
                          <span>Grand Total</span>
                          <span>{order.total.toLocaleString('tr-TR')} ₺</span>
                        </div>
                      </div>
                    </div>

                    {/* Customer & shipping info */}
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-gray-400 uppercase">Customer Info</p>
                      <div className="bg-white rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Package size={14} className="text-orange-500 shrink-0" />
                          <span className="font-semibold text-gray-700">{order.shippingFullName}</span>
                        </div>
                        {order.shippingPhone && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone size={14} className="text-orange-500 shrink-0" />
                            <span>{order.shippingPhone}</span>
                          </div>
                        )}
                        {order.shippingAddress && (
                          <div className="flex items-start gap-2 text-sm text-gray-500">
                            <MapPin size={14} className="text-orange-500 shrink-0 mt-0.5" />
                            <span>{order.shippingAddress}</span>
                          </div>
                        )}
                        {order.note && (
                          <div className="flex items-start gap-2 text-sm text-gray-500 border-t pt-2">
                            <MessageSquare size={14} className="text-orange-500 shrink-0 mt-0.5" />
                            <span className="italic">{order.note}</span>
                          </div>
                        )}
                      </div>

                      {/* Admin Internal Note */}
                      <p className="text-xs font-bold text-gray-400 uppercase">Internal Note</p>
                      {noteOrderId === order.id ? (
                        <div className="bg-white rounded-xl p-3 space-y-2">
                          <textarea
                            value={noteText}
                            onChange={e => setNoteText(e.target.value)}
                            rows={2}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
                            placeholder="Internal note..."
                          />
                          {noteMsg && <p className="text-xs text-green-600">{noteMsg}</p>}
                          <div className="flex gap-2">
                            <button onClick={() => setNoteOrderId(null)} className="flex-1 text-xs py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button onClick={handleNoteSave} disabled={noteSaving} className="flex-1 text-xs py-1.5 bg-[#1B3A6B] text-white rounded-lg hover:bg-[#152d54] disabled:opacity-50">
                              {noteSaving ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setNoteOrderId(order.id); setNoteText(order.adminNote ?? ''); setNoteMsg(''); }}
                          className={`w-full text-left p-3 rounded-xl text-sm border transition-colors ${order.adminNote ? 'bg-yellow-50 border-yellow-200 text-gray-700' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'}`}
                        >
                          {order.adminNote || '+ Add internal note'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
