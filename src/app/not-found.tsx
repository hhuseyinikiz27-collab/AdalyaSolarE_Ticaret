'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-[120px] font-extrabold text-orange-500 leading-none select-none">
          404
        </div>
        <h1 className="text-2xl font-bold text-[#1B3A6B] mt-2 mb-3">
          Page Not Found
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          The page you are looking for may have been moved, deleted, or never existed.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <Home size={18} />
            Return to Home
          </Link>
          <Link
            href="/urunler"
            className="flex items-center justify-center gap-2 border-2 border-[#1B3A6B] text-[#1B3A6B] hover:bg-[#1B3A6B] hover:text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            <Search size={18} />
            Browse Products
          </Link>
        </div>
        <button
          onClick={() => window.history.back()}
          className="mt-4 flex items-center justify-center gap-1.5 text-sm text-gray-400 hover:text-orange-500 transition-colors mx-auto"
        >
          <ArrowLeft size={15} />
          Go Back
        </button>
      </div>
    </main>
  );
}
