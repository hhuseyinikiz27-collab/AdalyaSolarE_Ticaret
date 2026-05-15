'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface Props {
  endsAt: string;
  price: number;
  originalPrice: number;
  size?: 'sm' | 'lg';
}

function calcRemaining(endsAt: string) {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  return { h, m, s };
}

export default function FlashSaleCountdown({ endsAt, price, originalPrice, size = 'sm' }: Props) {
  const [remaining, setRemaining] = useState(() => calcRemaining(endsAt));

  useEffect(() => {
    const id = setInterval(() => setRemaining(calcRemaining(endsAt)), 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  if (!remaining) return null;

  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  const pad = (n: number) => String(n).padStart(2, '0');

  if (size === 'lg') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={16} className="fill-red-500 text-red-500" />
          <span className="text-red-600 font-bold text-sm">Flash Sale — {discount}% Off!</span>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl font-extrabold text-red-600">{price.toLocaleString('tr-TR')} ₺</span>
          <span className="text-sm text-gray-400 line-through">{originalPrice.toLocaleString('tr-TR')} ₺</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 font-medium">Ends:</span>
          {[pad(remaining.h), pad(remaining.m), pad(remaining.s)].map((val, i) => (
            <span key={i} className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">{val}</span>
          )).reduce<React.ReactNode[]>((acc, el, i) => i === 0 ? [el] : [...acc, <span key={`sep${i}`} className="text-red-400 font-bold text-xs">:</span>, el], [])}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-2 left-2 right-2 bg-red-600/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center justify-between">
      <div className="flex items-center gap-1">
        <Zap size={11} className="fill-white text-white" />
        <span className="text-white text-xs font-bold">%{discount}</span>
      </div>
      <span className="text-white text-xs font-mono">
        {pad(remaining.h)}:{pad(remaining.m)}:{pad(remaining.s)}
      </span>
    </div>
  );
}
