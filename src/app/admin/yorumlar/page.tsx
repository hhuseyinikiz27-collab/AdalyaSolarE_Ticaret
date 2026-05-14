'use client';

import { useEffect, useState } from 'react';
import { api, AdminReview } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { Trash2, Send, Star, ThumbsUp } from 'lucide-react';

export default function AdminReviews() {
  const { error } = useToast();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [sending, setSending] = useState<number | null>(null);

  const [loadError, setLoadError] = useState('');

  const load = () => {
    setLoadError('');
    api.admin.reviews.getAll()
      .then(setReviews)
      .catch(e => setLoadError(e instanceof Error ? e.message : 'Yorumlar yüklenemedi.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleReply = async (id: number) => {
    const text = replyText[id]?.trim();
    if (!text) return;
    setSending(id);
    try {
      await api.admin.reviews.reply(id, text);
      const wasUnanswered = reviews.find(r => r.id === id)?.adminReply == null;
      setReviews(prev => prev.map(r => r.id === id ? { ...r, adminReply: text } : r));
      setReplyText(r => ({ ...r, [id]: '' }));
      if (wasUnanswered) window.dispatchEvent(new Event('review-replied'));
    } catch {
      error('Yanıt gönderilemedi.');
    } finally {
      setSending(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
    try {
      await api.admin.reviews.delete(id);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch {
      error('Yorum silinemedi.');
    }
  };

  return (
    <div className="p-8">
      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6 flex items-center justify-between">
          <span>{loadError}</span>
          <button onClick={load} className="font-semibold underline ml-4">Tekrar Dene</button>
        </div>
      )}
      <h1 className="text-2xl font-extrabold text-[#1B3A6B] mb-8">Yorum Yönetimi</h1>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-2xl h-36 animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-2xl">
          <Star size={40} className="mx-auto mb-3 text-gray-200" />
          <p>Henüz yorum yok.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-[#1B3A6B]">{r.userName}</p>
                  <p className="text-xs text-gray-400">{r.userEmail} · {new Date(r.createdAt).toLocaleDateString('tr-TR')}</p>
                  <p className="text-xs text-orange-500 font-medium mt-0.5">Ürün: {r.productName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < r.rating ? 'fill-orange-400 text-orange-400' : 'text-gray-200'} />
                    ))}
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">
                    <ThumbsUp size={11} />
                    {r.likeCount}
                  </span>
                  <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-700 mb-4 leading-relaxed">{r.comment}</p>

              {r.adminReply && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-4">
                  <p className="text-xs font-semibold text-orange-600 mb-1">Admin Yanıtı:</p>
                  <p className="text-sm text-gray-700">{r.adminReply}</p>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  value={replyText[r.id] || ''}
                  onChange={e => setReplyText(prev => ({ ...prev, [r.id]: e.target.value }))}
                  placeholder={r.adminReply ? 'Yanıtı güncelle...' : 'Yanıt yaz...'}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                  onKeyDown={e => e.key === 'Enter' && handleReply(r.id)}
                />
                <button
                  onClick={() => handleReply(r.id)}
                  disabled={sending === r.id || !replyText[r.id]?.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 text-white px-4 rounded-xl transition-colors flex items-center gap-2 text-sm font-semibold"
                >
                  <Send size={14} />
                  {sending === r.id ? '...' : 'Yanıtla'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
