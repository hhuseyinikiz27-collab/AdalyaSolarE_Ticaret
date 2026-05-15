'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Package, Truck, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';

interface TrackResult {
  id: number;
  status: string;
  total: number;
  createdAt: string;
  shippingFullName: string;
  shippingAddress: string;
  trackingCode?: string;
  cargoCompany?: string;
  items: { productId: number; quantity: number; unitPrice: number; productName: string }[];
}

interface CargoEvent {
  date: string;
  time: string;
  location: string;
  description: string;
}

interface CargoTrackResult {
  statusLabel: string;
  estimatedDelivery?: string;
  events: CargoEvent[];
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode; step: number }> = {
  'hazirlanıyor':    { label: 'Preparing',      color: 'text-orange-600', bg: 'bg-orange-100', icon: <Package size={18} />,     step: 1 },
  'kargoya-verildi': { label: 'Shipped',         color: 'text-purple-600', bg: 'bg-purple-100', icon: <Truck size={18} />,       step: 2 },
  'dagitimda':       { label: 'Out for Delivery',color: 'text-blue-600',   bg: 'bg-blue-100',   icon: <Truck size={18} />,       step: 3 },
  'teslim-edildi':   { label: 'Delivered',       color: 'text-green-600',  bg: 'bg-green-100',  icon: <CheckCircle size={18} />, step: 4 },
  'iptal':           { label: 'Cancelled',       color: 'text-red-600',    bg: 'bg-red-100',    icon: <XCircle size={18} />,     step: 0 },
};

const steps = [
  { label: 'Preparing',       icon: <Package size={15} /> },
  { label: 'Shipped',         icon: <Truck size={15} /> },
  { label: 'Out for Delivery',icon: <Truck size={15} /> },
  { label: 'Delivered',       icon: <CheckCircle size={15} /> },
];

function SiparisTakipContent() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState('');
  const [cargoInfo, setCargoInfo] = useState<CargoTrackResult | null>(null);
  const [cargoLoading, setCargoLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get('id');
    if (!id) return;
    setOrderId(id);
    const num = parseInt(id.trim());
    if (isNaN(num)) return;
    setLoading(true);
    setError('');
    api.orders.track(num)
      .then(data => {
        setResult(data);
        if (data.trackingCode && data.cargoCompany) {
          fetchCargoInfo(data.trackingCode, data.cargoCompany);
        }
      })
      .catch(() => setError('Order not found. Please check the number and try again.'))
      .finally(() => setLoading(false));

    // Poll every 15s so status updates appear without refresh
    const interval = setInterval(() => {
      api.orders.track(num)
        .then(data => setResult(data))
        .catch(() => {});
    }, 15_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCargoInfo = async (trackingCode: string, cargoCompany: string) => {
    setCargoLoading(true);
    setCargoInfo(null);
    try {
      const res = await fetch(`/api/kargo/track?code=${encodeURIComponent(trackingCode)}&company=${encodeURIComponent(cargoCompany)}`);
      if (res.ok) setCargoInfo(await res.json());
    } catch { /* silently skip until cargo API connects */ }
    finally { setCargoLoading(false); }
  };

  const handleTrack = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    const id = parseInt(orderId.trim());
    if (!orderId.trim()) { setError('Please enter an order number.'); return; }
    if (isNaN(id)) { setError('Please enter a valid order number.'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    setCargoInfo(null);
    try {
      const data = await api.orders.track(id);
      setResult(data);
      if (data.trackingCode && data.cargoCompany) {
        fetchCargoInfo(data.trackingCode, data.cargoCompany);
      }
    } catch {
      setError('Order not found. Please check the number and try again.');
    } finally {
      setLoading(false);
    }
  };

  const cfg = result ? (statusConfig[result.status] ?? statusConfig['hazirlanıyor']) : null;
  const currentStep = cfg?.step ?? 0;

  return (
    <main className="max-w-2xl mx-auto px-4 py-14">
      <div className="text-center mb-10">
        <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Package size={28} className="text-orange-500" />
        </div>
        <h1 className="text-3xl font-extrabold text-[#1B3A6B] mb-2">Order Tracking</h1>
        <p className="text-gray-500 text-sm">Enter your order number to check your order status.</p>
      </div>

      <form onSubmit={handleTrack} className="flex gap-3 mb-8">
        <input
          type="text"
          value={orderId}
          onChange={e => setOrderId(e.target.value)}
          placeholder="Order number (e.g.: 1042)"
          className="flex-1 border-2 border-gray-200 focus:border-orange-400 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold px-5 py-3 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <Search size={18} />
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">
          {error}
        </div>
      )}

      {result && cfg && (
        <div className="space-y-5">
          <div className={`flex items-center gap-4 ${cfg.bg} rounded-2xl px-6 py-5`}>
            <div className={cfg.color}>{cfg.icon}</div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Order #{result.id} · {new Date(result.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className={`text-lg font-extrabold ${cfg.color}`}>{cfg.label}</p>
            </div>
            <div className="ml-auto text-right shrink-0">
              <p className="text-xs text-gray-500">Total</p>
              <p className="font-extrabold text-[#1B3A6B]">₺{result.total.toLocaleString('en-US')}</p>
            </div>
          </div>

          {result.status !== 'iptal' && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="relative flex justify-between">
                <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200" />
                <div
                  className="absolute top-4 left-4 h-0.5 bg-orange-500 transition-all duration-700"
                  style={{ width: `calc(${Math.max(0, (currentStep - 1) / (steps.length - 1)) * 100}% - 2rem + 1rem)` }}
                />
                {steps.map((s, i) => {
                  const done = i + 1 <= currentStep;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                        done ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-gray-300 text-gray-400'
                      }`}>
                        {s.icon}
                      </div>
                      <span className={`text-xs text-center leading-tight font-medium w-14 ${done ? 'text-orange-500' : 'text-gray-400'}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {result.trackingCode && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Cargo Tracking</p>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <div>
                  <p className="text-sm font-semibold text-[#1B3A6B]">{result.cargoCompany}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{result.trackingCode}</p>
                </div>
                {cargoLoading && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <span className="w-3 h-3 border-2 border-gray-300 border-t-orange-400 rounded-full animate-spin inline-block" />
                    Querying...
                  </span>
                )}
              </div>
              {cargoInfo && (
                <div className="space-y-2 mt-3 border-t pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-700">{cargoInfo.statusLabel}</span>
                    {cargoInfo.estimatedDelivery && (
                      <span className="text-xs text-green-600 font-semibold">Est. delivery: {cargoInfo.estimatedDelivery}</span>
                    )}
                  </div>
                  {cargoInfo.events.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      {cargoInfo.events.slice(0, 5).map((ev, i) => (
                        <div key={i} className="flex gap-3 text-xs text-gray-500">
                          <span className="shrink-0 text-gray-400">{ev.date} {ev.time}</span>
                          <span className="shrink-0 font-medium text-gray-600">{ev.location}</span>
                          <span>{ev.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Delivery Information</p>
            <p className="font-semibold text-[#1B3A6B]">{result.shippingFullName}</p>
            <p className="text-sm text-gray-500 mt-1">{result.shippingAddress}</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Order Contents</p>
            <div className="space-y-3">
              {result.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                      <Package size={14} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.productName}</p>
                      <p className="text-xs text-gray-400">{item.quantity} units</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-[#1B3A6B] shrink-0">
                    ₺{(item.unitPrice * item.quantity).toLocaleString('en-US')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Link href="/hesabim?tab=siparisler" className="inline-flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-semibold">
              View all my orders <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {!result && !error && (
        <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-400">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Your order number can be found in your confirmation email and in your account order history.</p>
          <Link href="/hesabim?tab=siparisler" className="inline-flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-semibold mt-4">
            Go to my orders <ChevronRight size={14} />
          </Link>
        </div>
      )}
    </main>
  );
}

export default function SiparisTakipPage() {
  return (
    <Suspense>
      <SiparisTakipContent />
    </Suspense>
  );
}
