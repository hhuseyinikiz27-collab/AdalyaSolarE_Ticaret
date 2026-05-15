'use client';

import { useEffect, useState } from 'react';
import { api, AdminStats, MonthlyStatItem, DailyStatItem } from '@/lib/api';
import { Package, Users, ShoppingCart, MessageSquare, TrendingUp, Heart, ThumbsUp } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, ComposedChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PERIOD_OPTIONS = [
  { label: '1 Month',  value: 1 },
  { label: '2 Months', value: 2 },
  { label: '6 Months', value: 6 },
  { label: '1 Year',   value: 12 },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MonthlyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-sm">
      <p className="font-bold text-[#1B3A6B] mb-2">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-gray-500">{p.name === 'gelir' ? 'Revenue:' : 'Orders:'}</span>
          <span className="font-semibold text-gray-800">
            {p.name === 'gelir' ? `${Number(p.value).toLocaleString('tr-TR')} ₺` : `${p.value} pcs`}
          </span>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DailyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const gelir = payload.find((p: { dataKey: string }) => p.dataKey === 'gelir');
  const siparis = payload.find((p: { dataKey: string }) => p.dataKey === 'siparis');
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 text-sm min-w-[160px]">
      <p className="font-bold text-[#1B3A6B] mb-2 border-b pb-1.5">{label}</p>
      {siparis && (
        <div className="flex items-center justify-between gap-4 mb-1">
          <span className="flex items-center gap-1.5 text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1B3A6B] inline-block" />
            Orders
          </span>
          <span className="font-bold text-[#1B3A6B]">{siparis.value} pcs</span>
        </div>
      )}
      {gelir && (
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
            Revenue
          </span>
          <span className="font-bold text-orange-500">{Number(gelir.value).toLocaleString('tr-TR')} ₺</span>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [monthly, setMonthly] = useState<MonthlyStatItem[]>([]);
  const [daily, setDaily] = useState<DailyStatItem[]>([]);
  const [period, setPeriod] = useState(6);
  const [chartLoading, setChartLoading] = useState(false);

  const isDaily = period === 1;

  useEffect(() => {
    api.admin.stats.get().then(setStats).catch(() => setStats(null));
    const interval = setInterval(() => {
      api.admin.stats.get().then(setStats).catch(() => {});
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setChartLoading(true);
    if (isDaily) {
      api.admin.stats.daily(1)
        .then(setDaily)
        .catch(() => setDaily([]))
        .finally(() => setChartLoading(false));
    } else {
      api.admin.stats.monthly(period)
        .then(setMonthly)
        .catch(() => setMonthly([]))
        .finally(() => setChartLoading(false));
    }
  }, [period, isDaily]);

  const monthlyChartData = monthly.map(m => ({
    name: MONTHS[m.month - 1],
    gelir: Number(m.revenue.toFixed(0)),
    siparis: m.count,
  }));

  const dailyChartData = daily.map(d => ({
    name: new Date(d.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', timeZone: 'UTC' }),
    gelir: Number(d.revenue.toFixed(0)),
    siparis: d.count,
  }));

  const chartData = isDaily ? dailyChartData : monthlyChartData;

  const totalRevenue = isDaily
    ? daily.reduce((s, d) => s + d.revenue, 0)
    : monthly.reduce((s, m) => s + m.revenue, 0);
  const totalOrders = isDaily
    ? daily.reduce((s, d) => s + d.count, 0)
    : monthly.reduce((s, m) => s + m.count, 0);

  const cards = stats ? [
    { label: 'Total Products',   value: stats.totalProducts,                               icon: Package,       gradient: 'from-blue-500 to-blue-600' },
    { label: 'Total Users',      value: stats.totalUsers,                                  icon: Users,         gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'Total Orders',     value: stats.totalOrders,                                 icon: ShoppingCart,  gradient: 'from-orange-500 to-orange-600' },
    { label: 'Total Revenue',    value: `${stats.totalRevenue.toLocaleString('tr-TR')} ₺`, icon: TrendingUp,    gradient: 'from-violet-500 to-violet-600' },
    { label: 'Total Reviews',    value: stats.totalReviews,                                icon: MessageSquare, gradient: 'from-pink-500 to-pink-600' },
    { label: 'Total Favorites',  value: stats.totalFavorites,                              icon: Heart,         gradient: 'from-red-500 to-red-600' },
    { label: 'Total Likes',      value: stats.totalLikes,                                  icon: ThumbsUp,      gradient: 'from-indigo-500 to-indigo-600' },
  ] : [];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1B3A6B]">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Welcome to the Adalya Solar admin panel</p>
      </div>

      {/* Stat Cards */}
      {!stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map(({ label, value, icon: Icon, gradient }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`bg-gradient-to-br ${gradient} rounded-xl p-3 text-white shrink-0 shadow-sm`}>
                <Icon size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-medium truncate">{label}</p>
                <p className="text-xl font-extrabold text-[#1B3A6B] mt-0.5 truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-[#1B3A6B]">Revenue &amp; Orders Chart</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isDaily ? 'Last 30 days — each day separately' : `${PERIOD_OPTIONS.find(p => p.value === period)?.label} — monthly summary`}
            </p>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {PERIOD_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  period === opt.value
                    ? 'bg-white text-[#1B3A6B] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-xs text-gray-400">Period Revenue</p>
              <p className="text-lg font-extrabold text-[#1B3A6B]">{totalRevenue.toLocaleString('tr-TR')} ₺</p>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="text-center">
              <p className="text-xs text-gray-400">Period Orders</p>
              <p className="text-lg font-extrabold text-[#1B3A6B]">{totalOrders}</p>
            </div>
          </div>
        </div>

        {chartLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
            <span className="text-3xl">📭</span>
            No order data found for this period.
          </div>
        ) : isDaily ? (
          /* ── DAILY VIEW ── */
          <div>
            <div className="flex items-center gap-5 mb-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#1B3A6B] inline-block" />Order Count</span>
              <span className="flex items-center gap-1.5"><span className="w-6 h-0.5 bg-orange-500 inline-block rounded-full" />Revenue (₺)</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={chartData} margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  interval={Math.max(0, Math.floor(chartData.length / 8) - 1)}
                />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} width={36} />
                <Tooltip content={<DailyTooltip />} />
                <Bar yAxisId="left" dataKey="siparis" fill="#1B3A6B" radius={[4, 4, 0, 0]} maxBarSize={24} />
                <Line yAxisId="right" type="monotone" dataKey="gelir" stroke="#f97316" strokeWidth={2} dot={false} activeDot={{ r: 5, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Top 5 days */}
            {daily.length > 0 && (() => {
              const top5 = [...daily].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
              const maxRev = top5[0].revenue;
              return (
                <div className="mt-5 border-t pt-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Top 5 Days by Revenue</p>
                  <div className="space-y-2">
                    {top5.map(d => {
                      const label = new Date(d.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', timeZone: 'UTC' });
                      return (
                        <div key={d.date} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-28 shrink-0">{label}</span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div className="h-2 bg-orange-400 rounded-full transition-all" style={{ width: `${maxRev > 0 ? (d.revenue / maxRev) * 100 : 0}%` }} />
                          </div>
                          <span className="text-xs font-bold text-[#1B3A6B] w-24 text-right shrink-0">{d.revenue.toLocaleString('tr-TR')} ₺</span>
                          <span className="text-xs text-gray-400 w-16 text-right shrink-0">{d.count} orders</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          /* ── MONTHLY VIEW ── */
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />Revenue (₺)
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradGelir" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} width={36} />
                  <Tooltip content={<MonthlyTooltip />} />
                  <Area type="monotone" dataKey="gelir" stroke="#f97316" strokeWidth={2.5} fill="url(#gradGelir)"
                    dot={{ fill: '#f97316', r: 4, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1B3A6B] inline-block" />Order Count
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} width={28} />
                  <Tooltip content={<MonthlyTooltip />} />
                  <Bar dataKey="siparis" fill="#1B3A6B" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
