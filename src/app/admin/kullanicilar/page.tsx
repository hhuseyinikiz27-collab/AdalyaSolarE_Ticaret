'use client';

import { useEffect, useState } from 'react';
import { api, AdminUser, ApiUserSecurity } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  Trash2, ShoppingBag, ShieldCheck, User as UserIcon, X,
  Shield, Lock, LockOpen, LogIn, KeyRound, AlertTriangle, Loader2, StickyNote,
} from 'lucide-react';

const ACTION_LABELS: Record<string, { label: string; color: string; Icon: React.FC<{ size: number }> }> = {
  login:            { label: 'Logged in',               color: 'text-green-600 bg-green-50',  Icon: LogIn },
  password_changed: { label: 'Password changed',        color: 'text-blue-600 bg-blue-50',    Icon: KeyRound },
  locked_out:       { label: 'Account locked',          color: 'text-red-600 bg-red-50',      Icon: Lock },
  admin_unlocked:   { label: 'Admin removed lock',      color: 'text-orange-600 bg-orange-50', Icon: LockOpen },
};

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function AdminUsers() {
  const { error } = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Orders modal
  const [viewOrders, setViewOrders] = useState<{ user: AdminUser; orders: unknown[] } | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Security modal
  const [viewSecurity, setViewSecurity] = useState<{ user: AdminUser; security: ApiUserSecurity } | null>(null);
  const [secLoading, setSecLoading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [clearingBan, setClearingBan] = useState(false);

  // Note modal
  const [noteModal, setNoteModal] = useState<{ user: AdminUser; note: string } | null>(null);
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteMsg, setNoteMsg] = useState('');

  const load = () => api.admin.users.getAll().then(setUsers).finally(() => setLoading(false));
  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    await api.admin.users.delete(id);
    await load();
  };

  const handleRoleToggle = async (user: AdminUser) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await api.admin.users.updateRole(user.id, newRole);
      await load();
    } catch {
      error('Role could not be updated.');
    }
  };

  const handleViewOrders = async (user: AdminUser) => {
    setOrdersLoading(true);
    const orders = await api.admin.users.getOrders(user.id).catch(() => []);
    setViewOrders({ user, orders: orders as unknown[] });
    setOrdersLoading(false);
  };

  const handleViewSecurity = async (user: AdminUser) => {
    setSecLoading(true);
    const security = await api.admin.security.getUserSecurity(user.id).catch(() => null);
    if (security) setViewSecurity({ user, security });
    setSecLoading(false);
  };

  const handleUnlock = async () => {
    if (!viewSecurity) return;
    setUnlocking(true);
    try {
      await api.admin.security.unlockUser(viewSecurity.user.id);
      const security = await api.admin.security.getUserSecurity(viewSecurity.user.id);
      setViewSecurity({ user: viewSecurity.user, security });
    } finally {
      setUnlocking(false);
    }
  };

  const handleClearSpamBan = async () => {
    if (!viewSecurity) return;
    setClearingBan(true);
    try {
      await api.admin.security.clearSpamBan(viewSecurity.user.id);
      const security = await api.admin.security.getUserSecurity(viewSecurity.user.id);
      setViewSecurity({ user: viewSecurity.user, security });
    } finally {
      setClearingBan(false);
    }
  };

  const handleSaveNote = async () => {
    if (!noteModal) return;
    setNoteSaving(true);
    setNoteMsg('');
    try {
      await api.admin.users.updateNote(noteModal.user.id, noteModal.note || null);
      setNoteMsg('Note saved.');
      setUsers(prev => prev.map(u => u.id === noteModal.user.id ? { ...u, adminNote: noteModal.note || null } : u));
      setTimeout(() => setNoteModal(null), 800);
    } catch {
      setNoteMsg('Could not be saved.');
    } finally {
      setNoteSaving(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-[#1B3A6B] mb-8">User Management</h1>

      {/* Admin Note Modal */}
      {noteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[#1B3A6B]">Admin Note</h2>
              <button onClick={() => setNoteModal(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-3">{noteModal.user.name} — internal note (not visible to customer)</p>
            <textarea
              value={noteModal.note}
              onChange={e => setNoteModal(n => n ? { ...n, note: e.target.value } : null)}
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B3A6B]"
              placeholder="Write your internal note about this customer..."
            />
            {noteMsg && <p className="text-sm mt-2 text-green-600">{noteMsg}</p>}
            <div className="flex gap-2 mt-4">
              <button onClick={() => setNoteModal(null)} className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm">Cancel</button>
              <button onClick={handleSaveNote} disabled={noteSaving} className="flex-1 py-2 bg-[#1B3A6B] text-white rounded-lg text-sm hover:bg-[#152d54] disabled:opacity-50">
                {noteSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order History Modal */}
      {viewOrders && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-bold text-[#1B3A6B]">{viewOrders.user.name}</h2>
                <p className="text-sm text-gray-400">{viewOrders.user.email} — Order History</p>
              </div>
              <button onClick={() => setViewOrders(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6">
              {viewOrders.orders.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No orders yet.</p>
              ) : (
                <div className="space-y-3">
                  {(viewOrders.orders as { id: number; total: number; status: string; createdAt: string; items: { productName: string; quantity: number; unitPrice: number }[] }[]).map((order) => (
                    <div key={order.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-[#1B3A6B] text-sm">#{order.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          order.status === 'paid' ? 'bg-green-100 text-green-600' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-600' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>{order.status}</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
                      {order.items?.map((item, i) => (
                        <p key={i} className="text-xs text-gray-600">• {item.productName} × {item.quantity} — {item.unitPrice?.toLocaleString('tr-TR')} ₺</p>
                      ))}
                      <p className="text-sm font-bold text-[#1B3A6B] mt-2">{order.total.toLocaleString('tr-TR')} ₺</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Security Details Modal */}
      {viewSecurity && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b shrink-0">
              <div>
                <h2 className="text-lg font-bold text-[#1B3A6B] flex items-center gap-2">
                  <Shield size={18} className="text-orange-500" />
                  {viewSecurity.user.name}
                </h2>
                <p className="text-sm text-gray-400">{viewSecurity.user.email} — Security Details</p>
              </div>
              <button onClick={() => setViewSecurity(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><LogIn size={11} /> Last Login</p>
                  <p className="text-sm font-semibold text-gray-800">{fmtDate(viewSecurity.security.lastLoginAt)}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><KeyRound size={11} /> Last Password Change</p>
                  <p className="text-sm font-semibold text-gray-800">{fmtDate(viewSecurity.security.passwordChangedAt)}</p>
                </div>
              </div>

              {/* Lock status */}
              {viewSecurity.security.isLocked ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-red-700 text-sm">Account Locked</p>
                    <p className="text-xs text-red-600 mt-0.5">{viewSecurity.security.lockoutReason}</p>
                    <p className="text-xs text-red-500 mt-0.5">
                      Lock expires: {fmtDate(viewSecurity.security.lockoutUntil)}
                    </p>
                  </div>
                  <button
                    onClick={handleUnlock}
                    disabled={unlocking}
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0"
                  >
                    {unlocking ? <Loader2 size={12} className="animate-spin" /> : <LockOpen size={12} />}
                    Unlock
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                  <LockOpen size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-700">Account active, no lock.</span>
                </div>
              )}

              {/* Order spam ban status */}
              {viewSecurity.security.isSpamBanned ? (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle size={18} className="text-orange-500 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-orange-700 text-sm">Order Restriction Active</p>
                    <p className="text-xs text-orange-600 mt-0.5">
                      This user is temporarily unable to place orders.
                    </p>
                    <p className="text-xs text-orange-500 mt-0.5">
                      Restriction expires: {fmtDate(viewSecurity.security.spamBanUntil)}
                    </p>
                  </div>
                  <button
                    onClick={handleClearSpamBan}
                    disabled={clearingBan}
                    className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0"
                  >
                    {clearingBan ? <Loader2 size={12} className="animate-spin" /> : <LockOpen size={12} />}
                    Remove Restriction
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                  <LockOpen size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-700">No order restriction.</span>
                </div>
              )}

              {/* Security Logs */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">Security History</h3>
                {viewSecurity.security.logs.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">No records yet.</p>
                ) : (
                  <div className="space-y-2">
                    {viewSecurity.security.logs.map((log) => {
                      const meta = ACTION_LABELS[log.action] ?? { label: log.action, color: 'text-gray-600 bg-gray-50', Icon: Shield };
                      const { Icon } = meta;
                      return (
                        <div key={log.id} className="flex items-start gap-3 text-xs">
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-lg font-semibold shrink-0 ${meta.color}`}>
                            <Icon size={11} />
                            {meta.label}
                          </span>
                          <div className="flex-1 min-w-0">
                            {log.details && <p className="text-gray-500 truncate">{log.details}</p>}
                          </div>
                          <span className="text-gray-400 shrink-0 whitespace-nowrap">{fmtDate(log.createdAt)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-500">User</th>
                <th className="text-left px-4 py-4 font-semibold text-gray-500">Role</th>
                <th className="text-left px-4 py-4 font-semibold text-gray-500">Orders</th>
                <th className="text-left px-4 py-4 font-semibold text-gray-500">Registration Date</th>
                <th className="text-right px-6 py-4 font-semibold text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-[#1B3A6B]">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'admin' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                      {u.role === 'admin' ? 'admin' : 'user'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{u.orderCount} orders</td>
                  <td className="px-4 py-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setNoteMsg(''); setNoteModal({ user: u, note: u.adminNote ?? '' }); }}
                        title="Admin Note"
                        className={`p-2 rounded-lg transition-colors ${u.adminNote ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'}`}
                      >
                        <StickyNote size={16} />
                      </button>
                      <button
                        onClick={() => handleViewOrders(u)}
                        disabled={ordersLoading}
                        title="View Orders"
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <ShoppingBag size={16} />
                      </button>
                      <button
                        onClick={() => handleViewSecurity(u)}
                        disabled={secLoading}
                        title="Security Details"
                        className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        {secLoading ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
                      </button>
                      <button
                        onClick={() => handleRoleToggle(u)}
                        title={u.role === 'admin' ? 'Remove Admin Role' : 'Make Admin'}
                        className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                      >
                        {u.role === 'admin' ? <UserIcon size={16} /> : <ShieldCheck size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(u.id)}
                        title="Delete User"
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
