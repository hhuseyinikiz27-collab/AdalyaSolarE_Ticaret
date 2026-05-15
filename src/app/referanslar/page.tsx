'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Zap, Calendar, ChevronRight, Building2, Home, Tractor } from 'lucide-react';
import { api, ApiProjectReference } from '@/lib/api';

const typeIcon: Record<string, React.ReactNode> = {
  Residential: <Home size={14} />,
  Commercial: <Building2 size={14} />,
  Industrial: <Building2 size={14} />,
  Agricultural: <Tractor size={14} />,
  Public: <Building2 size={14} />,
  Ticari: <Building2 size={14} />,
  Endüstriyel: <Building2 size={14} />,
  Konut: <Home size={14} />,
  Tarımsal: <Tractor size={14} />,
  Kamu: <Building2 size={14} />,
};

const typeColor: Record<string, string> = {
  Residential: 'bg-green-100 text-green-700',
  Commercial: 'bg-blue-100 text-blue-700',
  Industrial: 'bg-purple-100 text-purple-700',
  Agricultural: 'bg-amber-100 text-amber-700',
  Public: 'bg-orange-100 text-orange-700',
  Ticari: 'bg-blue-100 text-blue-700',
  Endüstriyel: 'bg-purple-100 text-purple-700',
  Konut: 'bg-green-100 text-green-700',
  Tarımsal: 'bg-amber-100 text-amber-700',
  Kamu: 'bg-orange-100 text-orange-700',
};

export default function ReferencesPage() {
  const [projects, setProjects] = useState<ApiProjectReference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.projects.getAll().then(setProjects).finally(() => setLoading(false));
  }, []);

  const totalKwp = projects.reduce((a, p) => a + parseInt(p.capacity) || 0, 0);
  const totalPanels = projects.reduce((a, p) => a + (p.panels || 0), 0);

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B3A6B] via-[#2d5282] to-[#1B3A6B] text-white py-16 px-4 text-center">
        <span className="inline-block bg-orange-500/20 border border-orange-400/30 text-orange-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
          Completed Projects
        </span>
        <h1 className="text-4xl font-extrabold mb-3">Our Reference Projects</h1>
        <p className="text-gray-300 max-w-xl mx-auto text-sm leading-relaxed mb-10">
          Solar energy projects we have completed across Turkey.
          Solutions at every scale — from residential to industrial, agricultural to public.
        </p>
        {!loading && (
          <div className="flex flex-wrap justify-center gap-10">
            {[
              { value: `${projects.length}+`, label: 'Completed Projects' },
              { value: `${totalKwp} kWp`, label: 'Total Installed Capacity' },
              { value: `${totalPanels.toLocaleString('en-US')}+`, label: 'Panels Installed' },
              { value: `${new Set(projects.map(p => p.city)).size}+`, label: 'Cities' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-extrabold text-white">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Projects grid */}
      <div className="max-w-7xl mx-auto px-4 py-14">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-80 bg-gray-100 rounded-3xl animate-pulse" />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p>No reference projects found yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((p) => (
              <div key={p.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-52 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs font-semibold">
                    <MapPin size={13} />
                    {p.city}
                  </div>
                  <span className={`absolute top-3 right-3 flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${typeColor[p.type] || 'bg-gray-100 text-gray-700'}`}>
                    {typeIcon[p.type] || <Building2 size={14} />}{p.type}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-extrabold text-[#1B3A6B] text-base mb-2">{p.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{p.description}</p>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-orange-50 rounded-xl p-2.5 text-center">
                      <Zap size={14} className="text-orange-500 mx-auto mb-1" />
                      <p className="text-xs font-bold text-[#1B3A6B]">{p.capacity}</p>
                      <p className="text-xs text-gray-400">Capacity</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-2.5 text-center">
                      <Building2 size={14} className="text-blue-500 mx-auto mb-1" />
                      <p className="text-xs font-bold text-[#1B3A6B]">{p.panels}</p>
                      <p className="text-xs text-gray-400">Panels</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-2.5 text-center">
                      <Calendar size={14} className="text-green-500 mx-auto mb-1" />
                      <p className="text-xs font-bold text-[#1B3A6B]">{p.year}</p>
                      <p className="text-xs text-gray-400">Year</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400">Estimated Savings</p>
                      <p className="text-sm font-extrabold text-green-600">{p.savings}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-br from-[#1B3A6B] to-[#2d5282] rounded-3xl p-10 text-center text-white">
          <h2 className="text-2xl font-extrabold mb-3">Join the List</h2>
          <p className="text-gray-300 text-sm mb-6 max-w-md mx-auto">
            Get a free site survey and quote for your home, business, or farm.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/teklif-iste"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm flex items-center gap-2"
            >
              Get a Quote <ChevronRight size={16} />
            </Link>
            <Link
              href="/iletisim"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
