'use client';

import { useState, useEffect } from 'react';
import { Mail, MailOpen, Trash2, ChevronDown, ChevronUp, Building2, MessageSquare } from 'lucide-react';
import { api, ApiContactMessage } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

type Filter = 'tumu' | 'kurumsal' | 'iletisim';

function isCorporate(msg: ApiContactMessage) {
  return msg.subject?.includes('Kurumsal');
}

function parseCorpMessage(raw: string): { firma: string; yetkili: string; urunler: string[]; teslimat: string; notlar: string } | null {
  try {
    const lines = raw.split('\n');
    const get = (prefix: string) => lines.find((l) => l.startsWith(prefix))?.replace(prefix, '').trim() ?? '';
    const firma = get('Firma: ');
    if (!firma) return null;
    const yetkili = get('Yetkili: ');
    const teslimat = get('Teslimat Adresi: ');
    const notlarRaw = lines.find((l) => l.startsWith('Ek Notlar: '))?.replace('Ek Notlar: ', '').trim() ?? '';
    const startIdx = lines.findIndex((l) => l === 'Talep Edilen Ürünler:');
    const urunler = startIdx >= 0
      ? lines.slice(startIdx + 1).filter((l) => l.startsWith('•')).map((l) => l.replace('• ', ''))
      : [];
    return { firma, yetkili, urunler, teslimat, notlar: notlarRaw };
  } catch {
    return null;
  }
}

export default function AdminMesajlarPage() {
  const { error } = useToast();
  const [messages, setMessages] = useState<ApiContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>('tumu');

  const load = () => {
    setLoadError('');
    api.admin.messages.getAll()
      .then(setMessages)
      .catch(e => setLoadError(e instanceof Error ? e.message : 'Messages could not be loaded.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleExpand = async (msg: ApiContactMessage) => {
    if (expanded === msg.id) { setExpanded(null); return; }
    setExpanded(msg.id);
    if (!msg.isRead) {
      await api.admin.messages.markAsRead(msg.id);
      setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, isRead: true } : m));
      window.dispatchEvent(new Event('message-read'));
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.admin.messages.delete(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (expanded === id) setExpanded(null);
    } catch {
      error('Message could not be deleted.');
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;
  const kurumsalCount = messages.filter(isCorporate).length;
  const iletisimCount = messages.filter((m) => !isCorporate(m)).length;

  const filtered = filter === 'kurumsal'
    ? messages.filter(isCorporate)
    : filter === 'iletisim'
      ? messages.filter((m) => !isCorporate(m))
      : messages;

  const tabs: { id: Filter; label: string; count: number; icon: React.ReactNode }[] = [
    { id: 'tumu', label: 'All', count: messages.length, icon: <Mail size={15} /> },
    { id: 'kurumsal', label: 'Corporate Requests', count: kurumsalCount, icon: <Building2 size={15} /> },
    { id: 'iletisim', label: 'Contact Form', count: iletisimCount, icon: <MessageSquare size={15} /> },
  ];

  return (
    <div className="p-6 max-w-4xl">
      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6 flex items-center justify-between">
          <span>{loadError}</span>
          <button onClick={load} className="font-semibold underline ml-4">Try Again</button>
        </div>
      )}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1B3A6B]">Message Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? (
              <span className="text-orange-500 font-semibold">{unreadCount} unread message{unreadCount > 1 ? 's' : ''}</span>
            ) : (
              'All messages read'
            )}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 font-semibold text-sm border-b-2 -mb-px transition-colors ${
              filter === t.id
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon}
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              filter === t.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-16 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
          <Mail size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No messages in this category yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((msg) => {
            const corp = isCorporate(msg) ? parseCorpMessage(msg.message) : null;
            return (
              <div
                key={msg.id}
                className={`bg-white rounded-2xl border transition-all ${
                  msg.isRead ? 'border-gray-100' : isCorporate(msg) ? 'border-blue-200 shadow-sm' : 'border-orange-200 shadow-sm'
                }`}
              >
                {/* Header row */}
                <div
                  className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
                  onClick={() => handleExpand(msg)}
                >
                  <div className="shrink-0">
                    {isCorporate(msg)
                      ? <Building2 size={18} className={msg.isRead ? 'text-gray-400' : 'text-blue-500'} />
                      : msg.isRead
                        ? <MailOpen size={18} className="text-gray-400" />
                        : <Mail size={18} className="text-orange-500" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-sm ${msg.isRead ? 'text-gray-700' : 'text-[#1B3A6B]'}`}>
                        {corp ? corp.firma : msg.name}
                      </span>
                      <span className="text-xs text-gray-400">{msg.email}</span>
                      {!msg.isRead && (
                        <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">New</span>
                      )}
                      {isCorporate(msg) && (
                        <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Building2 size={10} /> Corporate
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {corp
                        ? `${corp.urunler.length} product request${corp.teslimat && corp.teslimat !== 'Belirtilmedi' ? ` · ${corp.teslimat}` : ''}`
                        : msg.subject
                      }
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">
                    {new Date(msg.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <div className="shrink-0 text-gray-400">
                    {expanded === msg.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {/* Expanded content */}
                {expanded === msg.id && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                    {corp ? (
                      /* Corporate message: structured view */
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                          <InfoCell label="Company" value={corp.firma} />
                          <InfoCell label="Contact" value={corp.yetkili || msg.name} />
                          <InfoCell label="Email">
                            <a href={`mailto:${msg.email}`} className="font-medium text-orange-500 hover:underline">{msg.email}</a>
                          </InfoCell>
                          {msg.phone && <InfoCell label="Phone">
                            <a href={`tel:${msg.phone}`} className="font-medium text-gray-700">{msg.phone}</a>
                          </InfoCell>}
                          {corp.teslimat && corp.teslimat !== 'Belirtilmedi' && (
                            <InfoCell label="Delivery Address" value={corp.teslimat} />
                          )}
                        </div>

                        {corp.urunler.length > 0 && (
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Requested Products</p>
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                              {corp.urunler.map((u, i) => (
                                <div key={i} className="flex items-start gap-2 text-sm">
                                  <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                    {i + 1}
                                  </span>
                                  <span className="text-gray-700">{u}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {corp.notlar && (
                          <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Additional Notes</p>
                            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                              {corp.notlar}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Regular contact message */
                      <div>
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                          <InfoCell label="Full Name" value={msg.name} />
                          <InfoCell label="Email">
                            <a href={`mailto:${msg.email}`} className="font-medium text-orange-500 hover:underline">{msg.email}</a>
                          </InfoCell>
                          {msg.phone && <InfoCell label="Phone">
                            <a href={`tel:${msg.phone}`} className="font-medium text-gray-700">{msg.phone}</a>
                          </InfoCell>}
                          <InfoCell label="Subject" value={msg.subject || '—'} />
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">
                          {msg.message}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-400">
                        {new Date(msg.createdAt).toLocaleString('tr-TR')}
                      </span>
                      <div className="flex gap-2">
                        <a
                          href={`mailto:${msg.email}?subject=Re: ${msg.subject}`}
                          className="flex items-center gap-1.5 text-xs bg-[#1B3A6B] hover:bg-[#152d55] text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Mail size={13} />
                          Reply
                        </a>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="flex items-center gap-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-600 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InfoCell({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div>
      <span className="text-xs text-gray-400 uppercase tracking-wide block mb-0.5">{label}</span>
      {children ?? <span className="font-medium text-gray-700 text-sm">{value}</span>}
    </div>
  );
}
