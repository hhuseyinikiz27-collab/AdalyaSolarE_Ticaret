'use client';

import { useCompare } from '@/context/CompareContext';
import Link from 'next/link';
import { X, GitCompare } from 'lucide-react';
import Image from 'next/image';

export default function CompareBar() {
  const { items, remove, clear } = useCompare();
  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-orange-500 shadow-2xl z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        <div className="flex items-center gap-2 flex-1">
          <GitCompare size={18} className="text-orange-500 shrink-0" />
          <span className="text-sm font-semibold text-gray-700 shrink-0">Compare ({items.length}/3)</span>
          <div className="flex gap-2 overflow-x-auto">
            {items.map(p => (
              <div key={p.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5 shrink-0">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-100">
                  <Image src={p.images[0]} alt={p.name} fill className="object-cover" sizes="32px" />
                </div>
                <span className="text-xs font-medium text-gray-700 max-w-[100px] truncate">{p.name}</span>
                <button onClick={() => remove(p.id)} className="text-gray-300 hover:text-red-400 transition-colors ml-1">
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={clear} className="text-sm text-gray-400 hover:text-gray-600 font-semibold px-3 py-1.5 transition-colors">
            Clear
          </button>
          <Link
            href="/karsilastir"
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors"
          >
            Compare
          </Link>
        </div>
      </div>
    </div>
  );
}
