'use client';

import { useState, useEffect } from 'react';
import { api, ApiReturnRequest } from '@/lib/api';
import { AlertCircle, CheckCircle, XCircle, Clock, Package, ChevronDown } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  beklemede:  'Pending',
  onaylandi:  'Approved',
  reddedildi: 'Rejected',
  tamamlandi: 'Completed',
};

const STATUS_STYLES: Record<string, string> = {
  beklemede:  'bg-amber-50 text-amber-700 border-amber-200',
  onaylandi:  'bg-green-50 text-green-700 border-green-200',
  reddedildi: 'bg-red-50 text-red-700 border-red-200',
  tamamlandi: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function AdminReturnsPage() {
  const [requests, setRequests] = useState<ApiReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [actionModal, setActionModal] = useState<{ req: ApiReturnRequest } | null>(null);
  const [actionForm, setActionForm] = useState({ status: 'onaylandi', adminNote: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    api.admin.returns.getAll(filter || undefined)
      .then(setRequests)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 20_000);
    return () => clearInterval(interval);
  }, [filter]);

  const openAction = (req: ApiReturnRequest) => {
    setActionForm({ status: 'onaylandi', adminNote: '' });
    setActionModal({ req });
  };

  const submitAction = async () => {
    if (!actionModal) return;
    setSubmitting(true);
    try {
      await api.admin.returns.updateStatus(actionModal.req.id, actionForm.status, actionForm.adminNote || undefined);
      setRequests(prev => prev.map(r =>
        r.id === actionModal.req.id
          ? { ...r, status: actionForm.status as ApiReturnRequest['status'], adminNote: actionForm.adminNote || null }
          : r
      ));
      // If the request is approved or completed, reverse the earned loyalty points
      if (actionForm.status === 'onaylandi' || actionForm.status === 'tamamlandi') {
        api.admin.loyalty.deductForOrder(actionModal.req.orderId).catch(() => {});
      }
      window.dispatchEvent(new Event('return-processed'));
      setActionModal(null);
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  };

  const pending = requests.filter(r => r.status === 'beklemede').length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1B3A6B]">Return / Cancellation Management</h1>
          {pending > 0 && (
            <p className="text-sm text-amber-600 font-medium mt-0.5">
              {pending} pending request{pending > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {['', 'beklemede', 'onaylandi', 'reddedildi', 'tamamlandi'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === s
                  ? 'bg-[#1B3A6B] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s === '' ? 'All' : STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package size={48} className="mx-auto mb-3 text-gray-200" />
          <p className="font-semibold">No requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    req.type === 'iade' ? 'bg-purple-50' : 'bg-red-50'
                  }`}>
                    {req.type === 'iade'
                      ? <AlertCircle size={18} className="text-purple-500" />
                      : <XCircle size={18} className="text-red-500" />
                    }
                  </div>
                  <div>
                    <p className="font-bold text-[#1B3A6B] text-sm">
                      {req.type === 'iade' ? 'Return Request' : 'Cancellation Request'}
                      {' — '}Order #{req.orderId}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {req.userName} · {req.userEmail}
                    </p>
                    <p className="text-sm text-gray-600 mt-2 bg-gray-50 rounded-lg px-3 py-2">{req.reason}</p>
                    {req.adminNote && (
                      <p className="text-xs text-gray-500 mt-1 italic">Admin note: {req.adminNote}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(req.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${STATUS_STYLES[req.status]}`}>
                    {STATUS_LABELS[req.status]}
                  </span>
                  {req.status === 'beklemede' && (
                    <button
                      onClick={() => openAction(req)}
                      className="flex items-center gap-1.5 bg-[#1B3A6B] hover:bg-[#2d5282] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <ChevronDown size={13} />
                      Take Action
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-[#1B3A6B] mb-4">
              Order #{actionModal.req.orderId} — Process Request
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {['onaylandi', 'reddedildi', 'tamamlandi'].map(s => (
                    <button
                      key={s}
                      onClick={() => setActionForm(p => ({ ...p, status: s }))}
                      className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        actionForm.status === s
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Admin Note (optional)</label>
                <textarea
                  value={actionForm.adminNote}
                  onChange={e => setActionForm(p => ({ ...p, adminNote: e.target.value }))}
                  rows={3}
                  placeholder="Note to be communicated to the user..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setActionModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={submitAction}
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
