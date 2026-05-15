'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Zap, Sun, Leaf, TrendingDown, ArrowRight, RotateCcw, Calculator } from 'lucide-react';
import { api, ApiProduct } from '@/lib/api';
import { makeProductSlug } from '@/lib/productMapper';

const cities = [
  { name: 'Antalya', hours: 5.5 },
  { name: 'Adana', hours: 5.3 },
  { name: 'Mersin', hours: 5.4 },
  { name: 'İzmir', hours: 5.0 },
  { name: 'Diyarbakır', hours: 5.5 },
  { name: 'Gaziantep', hours: 5.2 },
  { name: 'Konya', hours: 5.0 },
  { name: 'Kayseri', hours: 4.8 },
  { name: 'Ankara', hours: 4.5 },
  { name: 'Bursa', hours: 4.2 },
  { name: 'İstanbul', hours: 4.0 },
  { name: 'Trabzon', hours: 3.5 },
  { name: 'Other', hours: 4.5 },
];

const panelTypes = [
  { label: 'Economy (400W)', value: 'eco', watt: 400, pricePerKw: 18000 },
  { label: 'Standard (450W)', value: 'std', watt: 450, pricePerKw: 22000 },
  { label: 'Premium (550W)', value: 'prm', watt: 550, pricePerKw: 28000 },
];

const ELECTRICITY_PRICE = 3.8; // TL/kWh
const SYSTEM_EFFICIENCY = 0.78;
const CO2_PER_KWH = 0.5; // kg

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        {icon}
      </div>
      <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-[#1B3A6B]">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function CalculatorPage() {
  const [billStr, setBillStr] = useState('1500');
  const bill = parseInt(billStr.replace(/\D/g, '')) || 0;
  const [cityIdx, setCityIdx] = useState(0);
  const [panelIdx, setPanelIdx] = useState(1);
  const [calculated, setCalculated] = useState(false);

  const [suggestedProducts, setSuggestedProducts] = useState<ApiProduct[]>([]);

  const city = cities[cityIdx];
  const panel = panelTypes[panelIdx];

  useEffect(() => {
    if (!calculated) return;
    api.products.getAll({ category: 'gunes-panelleri' })
      .then((data) => setSuggestedProducts(data.slice(0, 3)))
      .catch(() => {});
  }, [calculated]);

  const monthlyKwh = bill / ELECTRICITY_PRICE;
  const dailyKwh = monthlyKwh / 30;
  const requiredKw = dailyKwh / (city.hours * SYSTEM_EFFICIENCY);
  const panelCount = Math.ceil(requiredKw / (panel.watt / 1000));
  const systemKw = +(panelCount * (panel.watt / 1000)).toFixed(1);
  const annualSavings = Math.round(monthlyKwh * 12 * ELECTRICITY_PRICE);
  const systemCost = Math.round(systemKw * panel.pricePerKw);
  const payback = +(systemCost / annualSavings).toFixed(1);
  const annualCo2 = Math.round(monthlyKwh * 12 * CO2_PER_KWH);
  const trees = Math.round(annualCo2 / 21);

  const handleCalculate = () => setCalculated(true);
  const handleReset = () => { setCalculated(false); setBillStr('1500'); setCityIdx(0); setPanelIdx(1); };

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B3A6B] via-[#2d5282] to-[#1B3A6B] text-white py-16 px-4 text-center">
        <span className="inline-block bg-orange-500/20 border border-orange-400/30 text-orange-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
          Free Calculation
        </span>
        <h1 className="text-4xl font-extrabold mb-3">Solar Panel Calculator</h1>
        <p className="text-gray-300 max-w-xl mx-auto text-sm leading-relaxed">
          Enter your electricity bill and instantly calculate how many panels you need,
          how much you will save, and how quickly your system will pay for itself.
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-extrabold text-[#1B3A6B] mb-5 flex items-center gap-2">
                <Calculator size={20} className="text-orange-500" />
                Enter Your Details
              </h2>

              {/* Bill */}
              <div className="mb-5">
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Monthly Electricity Bill
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="1500"
                    value={billStr}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      setBillStr(raw);
                      setCalculated(false);
                    }}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-bold outline-none focus:border-orange-400 transition-all pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₺</span>
                </div>
                <input
                  type="range"
                  min={200}
                  max={100000}
                  step={500}
                  value={Math.min(bill, 100000)}
                  onChange={(e) => { setBillStr(e.target.value); setCalculated(false); }}
                  className="w-full mt-3 accent-orange-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>₺200</span>
                  <span>₺100,000+</span>
                </div>
              </div>

              {/* City */}
              <div className="mb-5">
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  City / Region
                </label>
                <select
                  value={cityIdx}
                  onChange={(e) => { setCityIdx(Number(e.target.value)); setCalculated(false); }}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 bg-white transition-all"
                >
                  {cities.map((c, i) => (
                    <option key={c.name} value={i}>{c.name} ({c.hours} hrs/day)</option>
                  ))}
                </select>
              </div>

              {/* Panel Type */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Panel Type
                </label>
                <div className="space-y-2">
                  {panelTypes.map((p, i) => (
                    <button
                      key={p.value}
                      onClick={() => { setPanelIdx(i); setCalculated(false); }}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                        panelIdx === i
                          ? 'border-orange-500 bg-orange-50 text-orange-700 font-semibold'
                          : 'border-gray-200 hover:border-orange-300 text-gray-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCalculate}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-base"
              >
                <Zap size={18} />
                Calculate
              </button>

              {calculated && (
                <button
                  onClick={handleReset}
                  className="w-full mt-2 text-gray-400 hover:text-gray-600 text-sm flex items-center justify-center gap-1 py-2 transition-colors"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {!calculated ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-5">
                  <Sun size={48} className="text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-[#1B3A6B] mb-2">Ready to Calculate</h3>
                <p className="text-gray-400 text-sm max-w-xs">
                  Fill in the form on the left and click &quot;Calculate&quot;.
                  Results will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Summary Banner */}
                <div className="bg-gradient-to-r from-[#1B3A6B] to-[#2d5282] rounded-2xl p-6 text-white">
                  <p className="text-orange-300 text-sm font-semibold mb-1">Recommended System for {city.name}</p>
                  <div className="flex items-end gap-3">
                    <p className="text-5xl font-extrabold">{panelCount}</p>
                    <div className="pb-1">
                      <p className="text-lg font-bold">Solar Panels</p>
                      <p className="text-gray-300 text-sm">{panel.watt}W × {panelCount} = {systemKw} kWp system</p>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <StatCard
                    icon={<TrendingDown size={22} className="text-green-600" />}
                    label="Monthly Savings"
                    value={`${Math.round(bill).toLocaleString('tr-TR')} ₺`}
                    sub="full bill amount"
                    color="bg-green-100"
                  />
                  <StatCard
                    icon={<Zap size={22} className="text-orange-500" />}
                    label="Annual Savings"
                    value={`${annualSavings.toLocaleString('tr-TR')} ₺`}
                    sub={`${Math.round(monthlyKwh * 12).toLocaleString('tr-TR')} kWh/year`}
                    color="bg-orange-100"
                  />
                  <StatCard
                    icon={<Sun size={22} className="text-yellow-500" />}
                    label="Estimated System Cost"
                    value={`${systemCost.toLocaleString('tr-TR')} ₺`}
                    sub="estimated incl. installation"
                    color="bg-yellow-100"
                  />
                  <StatCard
                    icon={<Leaf size={22} className="text-emerald-600" />}
                    label="CO₂ Reduction"
                    value={`${annualCo2} kg`}
                    sub={`≈ equivalent to planting ${trees} trees`}
                    color="bg-emerald-100"
                  />
                </div>

                {/* Payback */}
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-[#1B3A6B]">Payback Period</p>
                    <span className="text-2xl font-extrabold text-orange-500">{payback} years</span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-3">
                    <div
                      className="bg-orange-500 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min((payback / 15) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1.5">
                    <span>0 years</span>
                    <span>Panel lifespan: 25 years</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Your system pays for itself in {payback} years, generating a total profit of{' '}
                    <strong>{((25 - payback) * annualSavings).toLocaleString('tr-TR')} ₺</strong> over the remaining{' '}
                    <strong>{Math.round(25 - payback)} years</strong>.
                  </p>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-gray-400 leading-relaxed">
                  * Calculations are based on an average electricity price of {ELECTRICITY_PRICE} ₺/kWh, {city.hours} hours/day of sunshine,
                  and {Math.round(SYSTEM_EFFICIENCY * 100)}% system efficiency.
                  Actual values may vary depending on installation conditions.
                </p>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/urunler?kategori=gunes-panelleri"
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    Browse Panels
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/iletisim"
                    className="flex-1 border-2 border-[#1B3A6B] text-[#1B3A6B] hover:bg-[#1B3A6B] hover:text-white font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    Get Expert Advice
                  </Link>
                </div>

                {/* Suggested Products */}
                {suggestedProducts.length > 0 && (
                  <div>
                    <h3 className="text-base font-extrabold text-[#1B3A6B] mb-3 flex items-center gap-2">
                      <Sun size={18} className="text-orange-500" />
                      Products That Suit You
                    </h3>
                    <div className="space-y-3">
                      {suggestedProducts.map((p) => (
                        <Link
                          key={p.id}
                          href={`/urunler/${makeProductSlug(p.name, p.id)}`}
                          className="flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-3 hover:border-orange-300 hover:shadow-md transition-all group"
                        >
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-50">
                            <Image
                              src={p.imageUrl && !p.imageUrl.startsWith('/') ? p.imageUrl : 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=200&h=200&fit=crop'}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-orange-600 transition-colors">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.brand}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-extrabold text-[#1B3A6B]">{p.price.toLocaleString('tr-TR')} ₺</p>
                            <p className="text-xs text-orange-500 font-semibold">View →</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
