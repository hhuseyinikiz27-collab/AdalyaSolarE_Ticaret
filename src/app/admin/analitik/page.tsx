'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { TrendingUp, ShoppingCart, Users, Package, Download } from 'lucide-react';

interface DailyStat { date: string; revenue: number; count: number }
interface MonthlyStat { year: number; month: number; revenue: number; count: number }
interface TopProduct { productId: number; productName: string; totalQuantity: number; totalRevenue: number; orderCount: number }
interface AdminStats { totalProducts: number; totalUsers: number; totalOrders: number; totalRevenue: number; totalReviews: number }

const MONTH_NAMES = ['', 'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

export default function AdminAnalytics() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [daily, setDaily] = useState<DailyStat[]>([]);
  const [monthly, setMonthly] = useState<MonthlyStat[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'daily' | 'monthly'>('monthly');

  useEffect(() => {
    Promise.all([
      api.admin.stats.get(),
      api.admin.stats.daily(1),
      api.admin.stats.monthly(6),
      api.admin.stats.topProducts(30, 10),
    ]).then(([s, d, m, tp]) => {
      setStats(s);
      setDaily(d);
      setMonthly(m);
      setTopProducts(tp);
    }).finally(() => setLoading(false));
  }, []);

  const chartData = period === 'daily' ? daily : monthly.map(m => ({
    date: `${MONTH_NAMES[m.month]} ${m.year}`,
    revenue: m.revenue,
    count: m.count,
  }));

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

  function downloadCSV(url: string, filename: string) {
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
      });
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Analitik Dashboard</h1>
        <div className="flex gap-2">
          <button onClick={() => downloadCSV(api.admin.export.downloadOrders(), `siparisler_${new Date().toISOString().slice(0,10)}.csv`)} className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
            <Download className="w-4 h-4" /> Sipariş CSV
          </button>
          <button onClick={() => downloadCSV(api.admin.export.downloadCustomers(), `musteriler_${new Date().toISOString().slice(0,10)}.csv`)} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            <Download className="w-4 h-4" /> Müşteri CSV
          </button>
          <button onClick={() => downloadCSV(api.admin.export.downloadProducts(), `urunler_${new Date().toISOString().slice(0,10)}.csv`)} className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">
            <Download className="w-4 h-4" /> Ürün CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Toplam Gelir', value: `${stats.totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 0 })} ₺`, icon: TrendingUp, color: 'bg-green-50 text-green-700' },
            { label: 'Toplam Sipariş', value: stats.totalOrders.toLocaleString('tr-TR'), icon: ShoppingCart, color: 'bg-blue-50 text-blue-700' },
            { label: 'Toplam Üye', value: stats.totalUsers.toLocaleString('tr-TR'), icon: Users, color: 'bg-purple-50 text-purple-700' },
            { label: 'Toplam Ürün', value: stats.totalProducts.toLocaleString('tr-TR'), icon: Package, color: 'bg-orange-50 text-orange-700' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-900">Gelir Grafiği</h2>
          <div className="flex gap-2">
            <button onClick={() => setPeriod('daily')} className={`px-3 py-1 rounded-lg text-sm ${period === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Günlük</button>
            <button onClick={() => setPeriod('monthly')} className={`px-3 py-1 rounded-lg text-sm ${period === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Aylık</button>
          </div>
        </div>
        {chartData.length === 0 ? (
          <p className="text-center text-gray-400 py-12">Henüz veri yok.</p>
        ) : (
          <div className="flex items-end gap-1 h-48 overflow-x-auto pb-2">
            {chartData.map((d, i) => {
              const label = period === 'daily' ? d.date.slice(5) : d.date;
              const height = Math.max((d.revenue / maxRevenue) * 100, 2);
              return (
                <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0" style={{ minWidth: period === 'daily' ? 24 : 48 }}>
                  <div className="group relative flex flex-col items-center">
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                      {d.revenue.toLocaleString('tr-TR')} ₺ ({d.count} sipariş)
                    </div>
                    <div
                      className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition-all cursor-default"
                      style={{ height: `${height}%`, minHeight: 4 }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 rotate-45 origin-left mt-1 whitespace-nowrap">{label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">En Çok Satan Ürünler (Son 30 Gün)</h2>
        {topProducts.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Henüz veri yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-3 text-gray-500 font-medium">#</th>
                  <th className="text-left pb-3 text-gray-500 font-medium">Ürün</th>
                  <th className="text-right pb-3 text-gray-500 font-medium">Adet</th>
                  <th className="text-right pb-3 text-gray-500 font-medium">Sipariş</th>
                  <th className="text-right pb-3 text-gray-500 font-medium">Gelir</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={p.productId} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 text-gray-400 font-medium">{i + 1}</td>
                    <td className="py-3 font-medium text-gray-900">{p.productName}</td>
                    <td className="py-3 text-right text-gray-700">{p.totalQuantity}</td>
                    <td className="py-3 text-right text-gray-700">{p.orderCount}</td>
                    <td className="py-3 text-right font-semibold text-green-700">{p.totalRevenue.toLocaleString('tr-TR')} ₺</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
