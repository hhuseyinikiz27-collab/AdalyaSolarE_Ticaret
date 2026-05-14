'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Truck, Shield } from 'lucide-react';

function BasariliContent() {
  const params = useSearchParams();
  const id = params.get('id');

  return (
    <main className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1B3A6B] mb-2">Ödeme Başarılı!</h1>
        {id && (
          <p className="text-gray-500 mb-1">
            Sipariş No: <span className="font-bold text-[#1B3A6B]">#{id}</span>
          </p>
        )}
        <p className="text-sm text-gray-400 mb-3">
          Ödemeniz onaylandı. Siparişiniz hazırlanmaya başlandı.
        </p>
        <p className="text-xs text-gray-400 mb-8">
          Onay e-postası kayıtlı adresinize gönderildi.
        </p>

        <div className="flex justify-center gap-8 mb-8">
          <div className="flex flex-col items-center gap-1.5 text-xs text-gray-500">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle size={20} className="text-green-500" />
            </div>
            Ödeme Alındı
          </div>
          <div className="flex flex-col items-center gap-1.5 text-xs text-gray-500">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <Truck size={20} className="text-blue-500" />
            </div>
            Hazırlanıyor
          </div>
          <div className="flex flex-col items-center gap-1.5 text-xs text-gray-500">
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center">
              <Shield size={20} className="text-orange-400" />
            </div>
            Sigortalı Kargo
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/hesabim?tab=siparisler"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Siparişlerimi Gör
          </Link>
          {id && (
            <Link
              href={`/siparis-takip?id=${id}`}
              className="border-2 border-orange-200 hover:border-orange-400 text-orange-600 font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              Sipariş Takip
            </Link>
          )}
          <Link
            href="/urunler"
            className="border-2 border-gray-200 hover:border-gray-300 text-gray-600 font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function OdemeBasariliPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <BasariliContent />
    </Suspense>
  );
}
