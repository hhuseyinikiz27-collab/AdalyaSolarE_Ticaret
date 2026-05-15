'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function KvkkBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('kvkk_consent')) setVisible(true);
  }, []);

  const handle = (val: 'accepted' | 'rejected') => {
    localStorage.setItem('kvkk_consent', val);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-[#1B3A6B] text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm flex-1 leading-relaxed">
          Bu site, size daha iyi hizmet sunabilmek için çerez kullanmaktadır.
          Devam ederek{' '}
          <Link href="/gizlilik-politikasi" className="underline text-orange-300 hover:text-orange-200 transition-colors">
            KVKK Aydınlatma Metni
          </Link>
          &apos;ni kabul etmiş sayılırsınız.
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => handle('rejected')}
            className="px-4 py-2 text-sm border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
          >
            Reddet
          </button>
          <button
            onClick={() => handle('accepted')}
            className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 rounded-lg font-semibold transition-colors"
          >
            Kabul Et
          </button>
        </div>
      </div>
    </div>
  );
}
