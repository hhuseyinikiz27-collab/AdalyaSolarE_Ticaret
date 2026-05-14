'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Medal, Star, Users, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface LeaderboardEntry { name: string; points: number; referralCount: number; }

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<{ rank: number; points: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.loyalty.getLeaderboard().then(setData).finally(() => setLoading(false));
    if (user) api.loyalty.getMyRank().then(setMyRank).catch(() => {});
  }, [user]);

  const rankIcon = (i: number) => {
    if (i === 0) return <Trophy size={20} className="text-yellow-500 fill-yellow-400" />;
    if (i === 1) return <Medal size={20} className="text-gray-400 fill-gray-300" />;
    if (i === 2) return <Medal size={20} className="text-amber-600 fill-amber-500" />;
    return <span className="text-sm font-bold text-gray-400 w-5 text-center">{i + 1}</span>;
  };

  const rankBg = (i: number) => {
    if (i === 0) return 'bg-yellow-50 border-yellow-200';
    if (i === 1) return 'bg-gray-50 border-gray-200';
    if (i === 2) return 'bg-amber-50 border-amber-200';
    return 'bg-white border-gray-100';
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/hesabim" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 mb-6 transition-colors">
        <ArrowLeft size={16} /> Hesabıma Dön
      </Link>

      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-4">
          <Trophy size={32} className="text-orange-500" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1B3A6B]">Puan Liderlik Tablosu</h1>
        <p className="text-gray-500 text-sm mt-2">En çok sadakat puanı kazanan Adalya Solar müşterileri</p>
      </div>

      {/* My rank card */}
      {myRank && (
        <div className="bg-[#1B3A6B] text-white rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-200">Sıralamadaki Yeriniz</p>
            <p className="text-3xl font-extrabold">#{myRank.rank}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-200">Toplam Puanınız</p>
            <p className="text-3xl font-extrabold text-orange-400">{myRank.points.toLocaleString('tr-TR')}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p>Henüz lider tablosu boş.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((entry, i) => (
            <div key={i} className={`flex items-center gap-4 p-4 border rounded-2xl transition-all ${rankBg(i)}`}>
              <div className="w-8 flex items-center justify-center shrink-0">{rankIcon(i)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 truncate">{entry.name}</p>
                {entry.referralCount > 0 && (
                  <p className="text-xs text-gray-400">{entry.referralCount} davet</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="font-extrabold text-[#1B3A6B]">{entry.points.toLocaleString('tr-TR')}</p>
                <p className="text-xs text-gray-400">puan</p>
              </div>
              {i < 3 && <Star size={14} className={i === 0 ? 'text-yellow-500 fill-yellow-400' : i === 1 ? 'text-gray-400 fill-gray-300' : 'text-amber-600 fill-amber-500'} />}
            </div>
          ))}
        </div>
      )}

      {!user && (
        <div className="mt-8 text-center bg-orange-50 border border-orange-200 rounded-2xl p-6">
          <p className="text-sm text-gray-600 mb-3">Sıralamanızı görmek için giriş yapın.</p>
          <Link href="/giris" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
            Giriş Yap
          </Link>
        </div>
      )}
    </main>
  );
}
