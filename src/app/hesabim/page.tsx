'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User, Package, MapPin, Heart, Settings, LogOut,
  ChevronRight, CreditCard, Trash2,
  Edit2, Plus, X, Camera, XCircle, Lock, Eye, EyeOff, Download,
  RotateCcw, AlertCircle, ShoppingCart as CartIcon, Copy, Users, Check, Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/context/ToastContext';
import { api, ApiAddress, ApiOrder, ApiSavedCard, ApiReturnRequest, ApiWarrantyRegistration } from '@/lib/api';
import { makeProductSlug, toProduct } from '@/lib/productMapper';
import { useFavorites } from '@/context/FavoritesContext';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5207';

// ── IndexedDB: orijinal profil fotoğrafını saklar ──
function idbOpen(): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open('adalya_photos', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('originals');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function idbSave(userId: string, file: File) {
  const db = await idbOpen();
  return new Promise<void>((res, rej) => {
    const tx = db.transaction('originals', 'readwrite');
    tx.objectStore('originals').put(file, userId);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
async function idbLoad(userId: string): Promise<File | null> {
  const db = await idbOpen();
  return new Promise((res) => {
    const tx = db.transaction('originals', 'readonly');
    const r = tx.objectStore('originals').get(userId);
    r.onsuccess = () => res((r.result as File) ?? null);
    r.onerror = () => res(null);
  });
}

function PhotoCropModal({ file, onClose, onUpload }: {
  file: File;
  onClose: () => void;
  onUpload: (f: File) => Promise<void>;
}) {
  const SIZE = 264;
  const [imgSrc, setImgSrc] = useState('');
  const [imgSize, setImgSize] = useState({ w: 1, h: 1 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgElRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef({ sx: 0, sy: 0, ox: 0, oy: 0 });
  const touchRef = useRef({ sx: 0, sy: 0, ox: 0, oy: 0, d0: 0, s0: 1 });
  const minScaleRef = useRef(0.5);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImgSrc(url);
    return () => URL.revokeObjectURL(url);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const floor = minScaleRef.current * 0.5;
      setScale(s => Math.max(floor, Math.min(s * (e.deltaY < 0 ? 1.08 : 0.93), 15)));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgElRef.current = e.currentTarget;
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    setImgSize({ w, h });
    const s = Math.max(SIZE / w, SIZE / h);
    minScaleRef.current = s;
    setScale(s);
    setOffset({ x: (SIZE - w * s) / 2, y: (SIZE - h * s) / 2 });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset({ x: dragRef.current.ox + e.clientX - dragRef.current.sx, y: dragRef.current.oy + e.clientY - dragRef.current.sy });
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchRef.current = { ...touchRef.current, sx: e.touches[0].clientX, sy: e.touches[0].clientY, ox: offset.x, oy: offset.y };
    } else if (e.touches.length === 2) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      touchRef.current = { ...touchRef.current, d0: d, s0: scale };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setOffset({ x: touchRef.current.ox + e.touches[0].clientX - touchRef.current.sx, y: touchRef.current.oy + e.touches[0].clientY - touchRef.current.sy });
    } else if (e.touches.length === 2) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      setScale(Math.max(0.05, Math.min(touchRef.current.s0 * (d / touchRef.current.d0), 15)));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = SIZE; canvas.height = SIZE;
      const ctx = canvas.getContext('2d')!;
      if (imgElRef.current) {
        ctx.drawImage(imgElRef.current, offset.x, offset.y, imgSize.w * scale, imgSize.h * scale);
      }
      const blob = await new Promise<Blob>((res, rej) => canvas.toBlob(b => b ? res(b) : rej(), 'image/jpeg', 0.92));
      await onUpload(new File([blob], 'profile.jpg', { type: 'image/jpeg' }));
    } finally {
      setSaving(false);
    }
  };

  const minScale = imgSize.w > 1 ? Math.max(SIZE / imgSize.w, SIZE / imgSize.h) : 0.5;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1B3A6B]">Edit Photo</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <p className="text-xs text-gray-400 text-center mb-4">Drag to position · Scroll to zoom</p>

        <div
          ref={containerRef}
          style={{
            width: SIZE, height: SIZE, borderRadius: '50%',
            overflow: 'hidden', border: '3px solid #f97316',
            background: '#111', cursor: dragging ? 'grabbing' : 'grab',
            userSelect: 'none', position: 'relative', margin: '0 auto',
            boxShadow: '0 0 0 6px rgba(249,115,22,0.12)',
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={() => setDragging(false)}
        >
          {imgSrc && (
            <img
              src={imgSrc}
              alt="crop"
              onLoad={onImgLoad}
              style={{
                position: 'absolute', left: offset.x, top: offset.y,
                width: imgSize.w * scale, height: imgSize.h * scale,
                maxWidth: 'none', pointerEvents: 'none',
              }}
              draggable={false}
            />
          )}
        </div>

        <div className="mt-5 px-1">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
            <span>Zoom Out</span>
            <span className="font-semibold text-[#1B3A6B]">{Math.round(scale / minScale * 100)}%</span>
            <span>Zoom In</span>
          </div>
          <input
            type="range"
            min={Math.round(minScale * 50)}
            max={Math.round(minScale * 500)}
            value={Math.round(scale * 100)}
            onChange={e => setScale(Math.max(minScale * 0.5, Number(e.target.value) / 100))}
            className="w-full accent-orange-500 h-1.5 cursor-pointer"
          />
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 text-sm transition-colors">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
          >
            {saving ? 'Uploading...' : 'Save & Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PasswordChangeForm() {
  const { user } = useAuth();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.next !== form.confirm) {
      setMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (form.next.length < 6) {
      setMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (form.next === form.current) {
      setMsg({ type: 'error', text: 'Your new password cannot be the same as your current password.' });
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      await api.auth.changePassword(form.current, form.next);
      setMsg({ type: 'success', text: 'Your password has been updated successfully.' });
      setForm({ current: '', next: '', confirm: '' });
      if (user?.email) {
        const email = user.email;
        const name = user.name;
        import('@/app/actions/email')
          .then(m => m.notifyPasswordChanged({ to: email, customerName: name }))
          .catch(() => {});
      }
    } catch (err: unknown) {
      setMsg({ type: 'error', text: err instanceof Error ? err.message : 'Password could not be changed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
      {msg && (
        <div className={`text-sm px-4 py-3 rounded-xl font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {msg.text}
        </div>
      )}
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1">Current Password</label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type={showCurrent ? 'text' : 'password'}
            value={form.current}
            onChange={e => setForm(p => ({ ...p, current: e.target.value }))}
            required
            className="w-full border border-gray-200 rounded-xl pl-9 pr-10 py-2.5 text-sm outline-none focus:border-orange-400"
            placeholder="Your current password"
          />
          <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1">New Password</label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type={showNext ? 'text' : 'password'}
            value={form.next}
            onChange={e => setForm(p => ({ ...p, next: e.target.value }))}
            required
            className="w-full border border-gray-200 rounded-xl pl-9 pr-10 py-2.5 text-sm outline-none focus:border-orange-400"
            placeholder="At least 6 characters"
          />
          <button type="button" onClick={() => setShowNext(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showNext ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        </div>
      </div>
      <div>
        <label className="text-sm font-semibold text-gray-700 block mb-1">New Password (Confirm)</label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            value={form.confirm}
            onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
            required
            className="w-full border border-gray-200 rounded-xl pl-9 py-2.5 text-sm outline-none focus:border-orange-400"
            placeholder="Re-enter your new password"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}


type Tab = 'profil' | 'siparisler' | 'adresler' | 'favoriler' | 'kartlar' | 'garanti' | 'ayarlar';

function AccountPageContent() {
  const { user, logout, updateProfile, uploadPhoto } = useAuth();
  const { error: toastError, success: toastSuccess } = useToast();
  const { toggle } = useFavorites();
  const { addToCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>('profil');

  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  // Cards state
  const [cards, setCards] = useState<ApiSavedCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Favorites state
  const [favorites, setFavorites] = useState<{ id: number; productId: number; product: { id: number; name: string; price: number; imageUrl: string; category: string; brand: string; stock: number; isNew: boolean; isFeatured: boolean } }[]>([]);
  const [favLoading, setFavLoading] = useState(false);

  // Loyalty state
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<{ id: number; points: number; type: string; description: string; createdAt: string }[]>([]);
  const [giftEmail, setGiftEmail] = useState('');
  const [giftPoints, setGiftPoints] = useState(50);
  const [giftLoading, setGiftLoading] = useState(false);
  const [giftMsg, setGiftMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Warranty state
  const [warranties, setWarranties] = useState<ApiWarrantyRegistration[]>([]);
  const [warrantiesLoading, setWarrantiesLoading] = useState(false);
  const [warrantyModal, setWarrantyModal] = useState<{ order: ApiOrder; productId: number; productName: string } | null>(null);
  const [warrantySerial, setWarrantySerial] = useState('');
  const [warrantySubmitting, setWarrantySubmitting] = useState(false);
  const [warrantyMsg, setWarrantyMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Referral state
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [referralCopied, setReferralCopied] = useState(false);

  // Address state
  const [addresses, setAddresses] = useState<ApiAddress[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ApiAddress | null>(null);
  const [addressForm, setAddressForm] = useState({
    title: '', fullName: '', phone: '', city: '', district: '', neighborhood: '', street: '', isDefault: false,
  });

  useEffect(() => {
    const tab = searchParams.get('tab') as Tab | null;
    if (tab && ['profil', 'siparisler', 'adresler', 'favoriler', 'kartlar', 'garanti', 'ayarlar'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      api.loyalty.getBalance().then(d => { setLoyaltyPoints(d.points); setLoyaltyTransactions(d.transactions); }).catch(() => {});
      api.referral.getMyCode().then(d => { setReferralCode(d.code); setReferralCount(d.referralCount); }).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'kartlar' && user) {
      setCardsLoading(true);
      api.cards.getAll().then(setCards).catch(() => {}).finally(() => setCardsLoading(false));
    }
  }, [activeTab, user]);

  useEffect(() => {
    if ((activeTab === 'siparisler' || activeTab === 'garanti') && user) {
      setOrdersLoading(true);
      api.orders.getMy().then(setOrders).catch(() => {}).finally(() => setOrdersLoading(false));
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab === 'favoriler' && user) {
      setFavLoading(true);
      api.favorites.getAll().then(setFavorites).catch(() => {}).finally(() => setFavLoading(false));
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab === 'adresler' && user) {
      setAddressLoading(true);
      api.addresses.getAll().then(setAddresses).catch(() => {}).finally(() => setAddressLoading(false));
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab === 'garanti' && user) {
      setWarrantiesLoading(true);
      api.warranty.getMy().then(setWarranties).catch(() => {}).finally(() => setWarrantiesLoading(false));
    }
  }, [activeTab, user]);

  const openNewAddressForm = () => {
    setEditingAddress(null);
    setAddressForm({ title: '', fullName: '', phone: '', city: '', district: '', neighborhood: '', street: '', isDefault: false });
    setShowAddressForm(true);
  };

  const openEditAddressForm = (addr: ApiAddress) => {
    setEditingAddress(addr);
    setAddressForm({ title: addr.title, fullName: addr.fullName, phone: addr.phone, city: addr.city, district: addr.district, neighborhood: addr.neighborhood, street: addr.street, isDefault: addr.isDefault });
    setShowAddressForm(true);
  };

  const saveAddress = async () => {
    try {
      if (editingAddress) {
        const updated = await api.addresses.update(editingAddress.id, addressForm);
        setAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      } else {
        const created = await api.addresses.create(addressForm);
        setAddresses((prev) => [...prev, created]);
      }
      setShowAddressForm(false);
    } catch {
      toastError('Address could not be saved.');
    }
  };

  const deleteAddress = async (id: number) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    await api.addresses.delete(id);
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [photoUploading, setPhotoUploading] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [repeatingId, setRepeatingId] = useState<number | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // İade/İptal Talebi state
  const [returnModal, setReturnModal] = useState<{ order: ApiOrder } | null>(null);
  const [returnForm, setReturnForm] = useState({ type: 'iade', reason: '' });
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [myReturns, setMyReturns] = useState<ApiReturnRequest[]>([]);
  const [activeReturnsBadge, setActiveReturnsBadge] = useState(0);
  const returnsBadgeFloor = useRef<number>(0);

  const repeatOrder = async (order: ApiOrder) => {
    setRepeatingId(order.id);
    let added = 0;
    for (const item of order.items) {
      try {
        const apiProduct = await api.products.getById(item.productId);
        const product = toProduct(apiProduct);
        addToCart(product, item.quantity);
        added++;
      } catch { /* skip deleted products */ }
    }
    setRepeatingId(null);
    if (added > 0) {
      toastSuccess(`${added} product(s) added to cart!`);
      router.push('/sepet');
    } else {
      toastError('Products are no longer available.');
    }
  };

  const submitReturn = async () => {
    if (!returnModal) return;
    if (!returnForm.reason.trim()) { toastError('Please provide a reason.'); return; }
    setReturnSubmitting(true);
    try {
      await api.returns.create({ orderId: returnModal.order.id, type: returnForm.type, reason: returnForm.reason });
      toastSuccess('Your request has been received. It will be reviewed shortly.');
      setReturnModal(null);
      setReturnForm({ type: 'iade', reason: '' });
      // Reload returns list
      api.returns.getMy().then(setMyReturns).catch(() => {});
    } catch (err: unknown) {
      toastError(err instanceof Error ? err.message : 'Request could not be submitted.');
    } finally {
      setReturnSubmitting(false);
    }
  };

  // Fetch returns badge count on mount (independent of active tab)
  useEffect(() => {
    if (!user) return;
    try {
      returnsBadgeFloor.current = parseInt(localStorage.getItem('user_returns_badge_floor') || '0', 10);
    } catch {}
    api.returns.getMy().then((returns) => {
      const count = returns.filter(r => r.status === 'beklemede').length;
      const floor = returnsBadgeFloor.current;
      if (floor > 0 && count > 0 && count <= floor) {
        setActiveReturnsBadge(0);
      } else {
        if (floor > 0) { returnsBadgeFloor.current = 0; try { localStorage.setItem('user_returns_badge_floor', '0'); } catch {} }
        setActiveReturnsBadge(count);
      }
    }).catch(() => {});
  }, [user]);

  // Load returns when on orders tab + poll every 15s for status updates
  useEffect(() => {
    if (activeTab !== 'siparisler' || !user) return;
    api.returns.getMy().then(setMyReturns).catch(() => {});
    const interval = setInterval(() => {
      api.returns.getMy().then(setMyReturns).catch(() => {});
      api.orders.getMy().then(setOrders).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [activeTab, user]);

  // Bildirim tercihleri — localStorage'da saklanır
  const [notifEmail, setNotifEmail] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('notif_email') !== 'false' : true);
  const [notifSms, setNotifSms] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('notif_sms') !== 'false' : true);
  const [notifNewsletter, setNotifNewsletter] = useState(() => typeof window !== 'undefined' ? localStorage.getItem('notif_newsletter') !== 'false' : true);
  const [notifFlash, setNotifFlash] = useState(false);
  const { permission: pushPermission, subscribed: pushSubscribed, loading: pushLoading, supported: pushSupported, subscribe: pushSubscribe, unsubscribe: pushUnsubscribe } = usePushNotifications();

  useEffect(() => {
    if (!user) return;
    api.auth.getFlashNotify().then(r => setNotifFlash(r.enabled)).catch(() => {});
  }, [user]);

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account?\n\nThis action cannot be undone. All your orders, addresses and data will be permanently deleted.'
    );
    if (!confirmed) return;
    setDeletingAccount(true);
    try {
      await api.auth.deleteAccount();
      logout();
      router.replace('/');
    } catch {
      toastError('Account could not be deleted. Please contact support.');
    } finally {
      setDeletingAccount(false);
    }
  };

  // Crop & photo preview
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const originalFileRef = useRef<File | null>(null);
  useEffect(() => () => { if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl); }, [localPreviewUrl]);

  const handleCropUpload = async (croppedFile: File) => {
    const previewUrl = URL.createObjectURL(croppedFile);
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    setLocalPreviewUrl(previewUrl);
    setCropFile(null);
    setPhotoUploading(true);
    const ok = await uploadPhoto(croppedFile);
    setPhotoUploading(false);
    if (!ok) {
      URL.revokeObjectURL(previewUrl);
      setLocalPreviewUrl(null);
      toastError('Photo could not be uploaded. Please try again.');
    }
  };

  const handleReCrop = async () => {
    // 1. Aynı oturumda bellekteki orijinal
    if (originalFileRef.current) {
      setCropFile(originalFileRef.current);
      return;
    }
    // 2. IndexedDB'deki orijinal (oturumlar arası kalıcı)
    if (user?.id) {
      const saved = await idbLoad(user.id);
      if (saved) {
        originalFileRef.current = saved;
        setCropFile(saved);
        return;
      }
    }
    // 3. Hiç kaydedilmemiş (çok eski fotoğraflar)
    toastError('Original photo not found. Please select again using "New Photo".');
  };

  // New card form
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardSaving, setCardSaving] = useState(false);
  const [cardForm, setCardForm] = useState({
    cardHolderName: '', number: '', expiryMonth: '', expiryYear: '', cardType: 'Visa', isDefault: false,
  });

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <User size={60} className="mx-auto text-gray-200 mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">You Need to Sign In</h2>
          <p className="text-gray-500 mb-6">Please sign in to access your account.</p>
          <Link
            href="/giris"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profil', label: 'My Profile', icon: <User size={18} /> },
    { id: 'siparisler', label: 'My Orders', icon: <Package size={18} /> },
    { id: 'adresler', label: 'My Addresses', icon: <MapPin size={18} /> },
    { id: 'favoriler', label: 'My Favorites', icon: <Heart size={18} /> },
    { id: 'kartlar', label: 'My Cards', icon: <CreditCard size={18} /> },
    { id: 'garanti', label: 'My Warranties', icon: <Shield size={18} /> },
    { id: 'ayarlar', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {cropFile && (
        <PhotoCropModal
          file={cropFile}
          onClose={() => setCropFile(null)}
          onUpload={handleCropUpload}
        />
      )}

      {/* İade/İptal Talebi Modal */}
      {returnModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-[#1B3A6B] flex items-center gap-2">
                <AlertCircle size={20} className="text-orange-500" />
                Return / Cancellation Request
              </h3>
              <button onClick={() => setReturnModal(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              You are creating a request for <span className="font-semibold text-[#1B3A6B]">Order #{returnModal.order.id}</span>.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">Request Type</label>
                <div className="flex gap-2">
                  {[
                    { value: 'iade', label: '🔄 Return Request', desc: 'I want to return the product' },
                    { value: 'iptal', label: '❌ Cancellation Request', desc: 'I want to cancel my order' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setReturnForm(p => ({ ...p, type: opt.value }))}
                      className={`flex-1 p-3 rounded-xl border-2 text-sm font-semibold text-left transition-all ${
                        returnForm.type === opt.value
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div>{opt.label}</div>
                      <div className="text-xs font-normal text-gray-400 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Reason / Description</label>
                <textarea
                  value={returnForm.reason}
                  onChange={e => setReturnForm(p => ({ ...p, reason: e.target.value }))}
                  placeholder="Briefly explain the reason for your request..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setReturnModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitReturn}
                disabled={returnSubmitting || !returnForm.reason.trim()}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-colors disabled:opacity-50"
              >
                {returnSubmitting ? 'Sending...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
      <h1 className="text-2xl font-extrabold text-[#1B3A6B] mb-8">My Account</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* User Header */}
            <div className="bg-gradient-to-br from-[#1B3A6B] to-[#2d5282] p-5 text-white">
              <div className="relative w-14 h-14 mb-3 rounded-full overflow-hidden bg-orange-500 flex items-center justify-center text-xl font-extrabold shrink-0">
                {(localPreviewUrl || user.photoUrl) ? (
                  <img
                    src={localPreviewUrl || (user.photoUrl?.startsWith('http') ? user.photoUrl : `${BASE_URL}${user.photoUrl ?? ''}`)}
                    alt={user.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                )}
              </div>
              <p className="font-bold">{user.name}</p>
              <p className="text-sm text-blue-200 truncate">{user.email}</p>
            </div>

            {/* Navigation */}
            <nav className="py-2">
              {tabs.map((tab) => {
                const tabBadge = tab.id === 'siparisler' && activeReturnsBadge > 0 ? activeReturnsBadge : null;
                return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'siparisler' && activeReturnsBadge > 0) {
                      returnsBadgeFloor.current = activeReturnsBadge;
                      try { localStorage.setItem('user_returns_badge_floor', String(activeReturnsBadge)); } catch {}
                      setActiveReturnsBadge(0);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-orange-50 text-orange-500 border-r-4 border-orange-500'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                  {tabBadge ? (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      {tabBadge > 9 ? '9+' : tabBadge}
                    </span>
                  ) : (
                    <ChevronRight size={14} className="ml-auto" />
                  )}
                </button>
              );})}
              <hr className="my-2 border-gray-100" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-3 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                Log Out
              </button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profil' && (
            <div className="space-y-5">

            {/* Sadakat Puanı Kartı */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-5 text-white">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-purple-200 text-xs font-semibold uppercase tracking-wider">Loyalty Points</p>
                  <p className="text-3xl font-extrabold mt-1">{loyaltyPoints.toLocaleString('tr-TR')} <span className="text-lg font-semibold text-purple-200">pts</span></p>
                  <p className="text-xs text-purple-300 mt-1">{Math.floor(loyaltyPoints / 100) * 10} ₺ discount available (100 pts = 10 ₺)</p>
                </div>
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl">⭐</div>
              </div>
              {loyaltyTransactions.length > 0 && (
                <div className="border-t border-purple-500 pt-3 space-y-1.5 max-h-28 overflow-y-auto">
                  {loyaltyTransactions.slice(0, 5).map(t => (
                    <div key={t.id} className="flex justify-between text-xs">
                      <span className="text-purple-200 truncate max-w-[200px]">{t.description}</span>
                      <span className={t.points > 0 ? 'text-green-300 font-semibold' : 'text-red-300 font-semibold'}>
                        {t.points > 0 ? '+' : ''}{t.points}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Puan Hediye Etme */}
            {loyaltyPoints >= 50 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">🎁</span>
                  <p className="font-bold text-[#1B3A6B] text-sm">Gift Points</p>
                </div>
                <p className="text-xs text-gray-500 mb-3">Send loyalty points to a friend. (Min. 50 pts)</p>
                <div className="space-y-2">
                  <input
                    type="email"
                    value={giftEmail}
                    onChange={e => setGiftEmail(e.target.value)}
                    placeholder="Recipient's email address"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                  />
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={50}
                      max={loyaltyPoints}
                      step={50}
                      value={giftPoints}
                      onChange={e => setGiftPoints(Math.max(50, Math.min(loyaltyPoints, Number(e.target.value))))}
                      className="w-28 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400"
                    />
                    <button
                      disabled={giftLoading || !giftEmail.trim() || giftPoints < 50}
                      onClick={async () => {
                        setGiftLoading(true); setGiftMsg(null);
                        try {
                          const res = await api.loyalty.giftPoints(giftEmail.trim(), giftPoints);
                          setGiftMsg({ ok: true, text: res.message });
                          setLoyaltyPoints(res.remainingPoints);
                          setGiftEmail('');
                        } catch (e: unknown) {
                          setGiftMsg({ ok: false, text: e instanceof Error ? e.message : 'Could not send.' });
                        } finally { setGiftLoading(false); }
                      }}
                      className="flex-1 bg-[#1B3A6B] hover:bg-[#2d5282] disabled:bg-gray-200 text-white rounded-xl py-2.5 text-sm font-bold transition-colors"
                    >
                      {giftLoading ? '...' : 'Send'}
                    </button>
                  </div>
                  {giftMsg && (
                    <p className={`text-xs font-medium px-3 py-2 rounded-xl ${giftMsg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {giftMsg.text}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Referral kartı */}
            {referralCode && (
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users size={18} />
                    <p className="font-bold text-sm">Invite a Friend</p>
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{referralCount} invites</span>
                </div>
                <p className="text-xs text-orange-100 mb-3">
                  When every person you invite signs up, you earn <strong>100 pts</strong> and your friend earns <strong>50 pts</strong>.
                </p>
                <div className="bg-white/15 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-mono font-bold tracking-widest truncate">
                    {typeof window !== 'undefined' ? `${window.location.origin}/kayit?ref=${referralCode}` : `/kayit?ref=${referralCode}`}
                  </span>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/kayit?ref=${referralCode}`;
                      navigator.clipboard.writeText(url).then(() => {
                        setReferralCopied(true);
                        setTimeout(() => setReferralCopied(false), 2000);
                      });
                    }}
                    className="shrink-0 bg-white text-orange-500 rounded-lg p-1.5 hover:bg-orange-50 transition-colors"
                  >
                    {referralCopied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#1B3A6B]">Personal Information</h2>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="flex items-center gap-1.5 text-orange-500 hover:text-orange-600 text-sm font-semibold"
                >
                  <Edit2 size={14} />
                  {editMode ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {/* Profile Photo */}
              <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
                <div className="relative shrink-0">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-orange-500 flex items-center justify-center text-2xl font-extrabold text-white">
                    {(localPreviewUrl || user.photoUrl) ? (
                      <img
                        src={localPreviewUrl || (user.photoUrl?.startsWith('http') ? user.photoUrl : `${BASE_URL}${user.photoUrl ?? ''}`)}
                        alt={user.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                    )}
                  </div>
                  {photoUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-1">Profile Photo</p>
                  <p className="text-xs text-gray-400 mb-2">JPG, PNG or WebP — max. 5 MB</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                      <Camera size={13} />
                      {photoUploading ? 'Uploading...' : 'New Photo'}
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp"
                        className="hidden"
                        disabled={photoUploading}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          originalFileRef.current = f;
                          if (user?.id) idbSave(user.id, f).catch(() => {});
                          setCropFile(f);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    {(localPreviewUrl || user.photoUrl) && (
                      <button
                        onClick={handleReCrop}
                        disabled={photoUploading}
                        className="inline-flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-2 rounded-lg transition-colors disabled:opacity-40"
                      >
                        <Edit2 size={13} />
                        Re-Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {editMode ? (
                <div className="space-y-4">
                  {[
                    { label: 'Full Name', field: 'name', type: 'text' },
                    { label: 'Email', field: 'email', type: 'email' },
                    { label: 'Phone', field: 'phone', type: 'tel' },
                  ].map(({ label, field, type }) => (
                    <div key={field}>
                      <label className="text-sm font-semibold text-gray-700 block mb-1">{label}</label>
                      <input
                        type={type}
                        value={profileForm[field as keyof typeof profileForm]}
                        onChange={(e) => setProfileForm((p) => ({ ...p, [field]: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400"
                      />
                    </div>
                  ))}
                  <button
                    onClick={async () => {
                      setSaving(true);
                      const ok = await updateProfile(profileForm.name, profileForm.phone);
                      setSaving(false);
                      if (ok) setEditMode(false);
                    }}
                    disabled={saving}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { label: 'Full Name', value: user.name },
                    { label: 'Email Address', value: user.email },
                    { label: 'Phone Number', value: user.phone },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <span className="text-sm text-gray-500 w-36">{label}</span>
                      <span className="text-sm font-semibold text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'siparisler' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#1B3A6B]">My Orders</h2>
              {ordersLoading ? (
                <div className="text-center py-10 text-gray-400">Loading...</div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                  <Package size={50} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-500">You have no orders yet.</p>
                  <Link href="/urunler" className="inline-block mt-4 bg-orange-500 text-white font-semibold px-6 py-2 rounded-xl hover:bg-orange-600 transition-colors text-sm">
                    Start Shopping
                  </Link>
                </div>
              ) : (
                (() => {
                  const STATUS_LABELS: Record<string, string> = {
                    'hazirlanıyor': 'Preparing',
                    'kargoya-verildi': 'Shipped',
                    'dagitimda': 'Out for Delivery',
                    'teslim-edildi': 'Delivered',
                    'iptal': 'Cancelled',
                  };
                  const STATUS_STYLES: Record<string, { badge: string; border: string; icon: string }> = {
                    'hazirlanıyor':    { badge: 'text-orange-600 bg-orange-50 border border-orange-200',   border: 'border-l-orange-400',  icon: '📦' },
                    'kargoya-verildi': { badge: 'text-purple-600 bg-purple-50 border border-purple-200',   border: 'border-l-purple-400',  icon: '🚚' },
                    'dagitimda':       { badge: 'text-blue-600 bg-blue-50 border border-blue-200',          border: 'border-l-blue-400',    icon: '🛵' },
                    'teslim-edildi':   { badge: 'text-green-600 bg-green-50 border border-green-200',       border: 'border-l-green-400',   icon: '✅' },
                    'iptal':           { badge: 'text-red-600 bg-red-50 border border-red-200',             border: 'border-l-red-400',     icon: '❌' },
                  };
                  const STATUS_STEPS = ['hazirlanıyor', 'kargoya-verildi', 'dagitimda', 'teslim-edildi'];
                  const STEP_ICONS = ['📦', '🚚', '🛵', '✅'];
                  const RETURN_LABELS: Record<string, string> = {
                    beklemede:  'Request Under Review',
                    onaylandi:  'Request Approved',
                    reddedildi: 'Request Rejected',
                    tamamlandi: 'Completed',
                  };
                  const RETURN_BADGES: Record<string, string> = {
                    beklemede:  'text-amber-600 bg-amber-50 border-amber-200',
                    onaylandi:  'text-green-700 bg-green-50 border-green-200',
                    reddedildi: 'text-red-600 bg-red-50 border-red-200',
                    tamamlandi: 'text-blue-700 bg-blue-50 border-blue-200',
                  };

                  const downloadPdf = async (order: ApiOrder) => {
                    const { jsPDF } = await import('jspdf');
                    // jsPDF built-in fonts don't support Turkish chars — transliterate
                    const tr = (s: string) => s
                      .replace(/ğ/g,'g').replace(/Ğ/g,'G')
                      .replace(/ü/g,'u').replace(/Ü/g,'U')
                      .replace(/ş/g,'s').replace(/Ş/g,'S')
                      .replace(/ı/g,'i').replace(/İ/g,'I')
                      .replace(/ö/g,'o').replace(/Ö/g,'O')
                      .replace(/ç/g,'c').replace(/Ç/g,'C');

                    const doc = new jsPDF();
                    const pageW = doc.internal.pageSize.getWidth();
                    const margin = 14;
                    const colRight = pageW - margin;

                    // ── Başlık bandı ──────────────────────────────────────────
                    doc.setFillColor(27, 58, 107);
                    doc.rect(0, 0, pageW, 32, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(15); doc.setFont('helvetica', 'bold');
                    doc.text('ADALYA SOLAR ENERJI', margin, 13);
                    doc.setFontSize(8); doc.setFont('helvetica', 'normal');
                    doc.text('info@adalyasolar.com  |  adalyasolar.com', margin, 21);
                    doc.setTextColor(255, 165, 0);
                    doc.setFontSize(20); doc.setFont('helvetica', 'bold');
                    doc.text('INVOICE', colRight, 20, { align: 'right' });

                    // ── Sipariş bilgileri ─────────────────────────────────────
                    let y = 44;
                    doc.setTextColor(30, 30, 30); doc.setFontSize(10); doc.setFont('helvetica', 'normal');
                    doc.text(`Order No   : #${order.id}`, margin, y); y += 8;
                    doc.text(`Date       : ${new Date(order.createdAt).toLocaleDateString('en-GB')}`, margin, y); y += 8;

                    if (order.shippingFullName) {
                      doc.text(`Customer   : ${tr(order.shippingFullName)}`, margin, y); y += 8;
                      if (order.shippingPhone)
                        { doc.text(`Phone      : ${order.shippingPhone}`, margin, y); y += 8; }
                      if (order.shippingAddress) {
                        // Wrap long address
                        const addrLines = doc.splitTextToSize(
                          `Address    : ${tr(order.shippingAddress)}`, pageW - margin * 2
                        ) as string[];
                        doc.text(addrLines, margin, y);
                        y += addrLines.length * 7;
                      }
                    }

                    // ── Ürün tablosu başlığı ──────────────────────────────────
                    y += 6;
                    doc.setFillColor(240, 242, 248);
                    doc.rect(margin, y - 5, pageW - margin * 2, 10, 'F');
                    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
                    doc.text('Product Name', margin + 2, y);
                    doc.text('Qty', colRight - 62, y, { align: 'right' });
                    doc.text('Unit Price', colRight - 32, y, { align: 'right' });
                    doc.text('Total', colRight, y, { align: 'right' });
                    y += 9;

                    // ── Ürün satırları ────────────────────────────────────────
                    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
                    order.items.forEach((item, idx) => {
                      if (idx % 2 === 0) {
                        doc.setFillColor(250, 250, 252);
                        doc.rect(margin, y - 5, pageW - margin * 2, 8, 'F');
                      }
                      // Uzun ürün adını kes
                      const rawName = tr(item.productName);
                      const maxChars = 50;
                      const name = rawName.length > maxChars ? rawName.slice(0, maxChars - 2) + '..' : rawName;
                      doc.setTextColor(30, 30, 30);
                      doc.text(name, margin + 2, y);
                      doc.text(String(item.quantity), colRight - 62, y, { align: 'right' });
                      doc.text(`${item.unitPrice.toLocaleString('tr-TR')} TL`, colRight - 32, y, { align: 'right' });
                      doc.text(`${(item.unitPrice * item.quantity).toLocaleString('tr-TR')} TL`, colRight, y, { align: 'right' });
                      y += 9;
                    });

                    // ── Özet ─────────────────────────────────────────────────
                    y += 4;
                    doc.setDrawColor(200, 200, 210);
                    doc.line(margin, y, colRight, y); y += 8;

                    const sub = order.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
                    const kg = order.total - sub;
                    doc.setFontSize(10); doc.setFont('helvetica', 'normal');
                    doc.text('Subtotal:', colRight - 58, y);
                    doc.text(`${sub.toLocaleString('tr-TR')} TL`, colRight, y, { align: 'right' }); y += 8;
                    doc.text('Shipping:', colRight - 58, y);
                    doc.text(kg <= 0 ? 'Free' : `${kg.toLocaleString('tr-TR')} TL`, colRight, y, { align: 'right' }); y += 10;

                    doc.setFillColor(27, 58, 107);
                    doc.rect(margin, y - 6, pageW - margin * 2, 12, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
                    doc.text('GRAND TOTAL:', margin + 4, y + 2);
                    doc.text(`${order.total.toLocaleString('tr-TR')} TL`, colRight - 2, y + 2, { align: 'right' });

                    // ── Alt bilgi ─────────────────────────────────────────────
                    doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
                    doc.setTextColor(160, 160, 170);
                    doc.text('Adalya Solar Enerji — This document is for informational purposes. VAT included.', pageW / 2, 287, { align: 'center' });

                    doc.save(`fatura-siparis-${order.id}.pdf`);
                  };

                  return orders.map((order) => {
                    const isExpanded = expandedOrderId === order.id;
                    const subtotal = order.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
                    const kargo = order.total - subtotal;
                    const stepIndex = STATUS_STEPS.indexOf(order.status);
                    const style = STATUS_STYLES[order.status] || STATUS_STYLES['hazirlanıyor'];
                    const orderReturn = myReturns.find(r => r.orderId === order.id);

                    return (
                      <div key={order.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${style.border} overflow-hidden`}>
                        {/* Card Header */}
                        <div className="p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{style.icon}</span>
                              <div>
                                <p className="font-extrabold text-[#1B3A6B] text-base">Order #{order.id}</p>
                                <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {orderReturn && orderReturn.status !== 'beklemede' ? (
                                <>
                                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${RETURN_BADGES[orderReturn.status]}`}>
                                    {orderReturn.type === 'iade' ? 'Return' : 'Cancel'} — {RETURN_LABELS[orderReturn.status]}
                                  </span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full opacity-50 ${style.badge}`}>
                                    {STATUS_LABELS[order.status] || order.status}
                                  </span>
                                </>
                              ) : (
                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${style.badge}`}>
                                  {STATUS_LABELS[order.status] || order.status}
                                </span>
                              )}
                              <p className="text-xl font-extrabold text-[#1B3A6B]">{order.total.toLocaleString('tr-TR')} ₺</p>
                            </div>
                          </div>

                          {/* Ürün özeti (küçük) */}
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex -space-x-2">
                              {order.items.slice(0, 3).map((item) => {
                                const imgUrl = item.productImageUrl && !item.productImageUrl.startsWith('/') ? item.productImageUrl : null;
                                return (
                                  <div key={item.id} className="relative w-9 h-9 rounded-lg overflow-hidden bg-gray-100 border-2 border-white shrink-0">
                                    {imgUrl
                                      ? <Image src={imgUrl} alt={item.productName} fill className="object-cover" sizes="36px" />
                                      : <div className="w-full h-full flex items-center justify-center text-[9px] font-bold text-gray-400 bg-gray-100">☀️</div>
                                    }
                                  </div>
                                );
                              })}
                              {order.items.length > 3 && (
                                <div className="w-9 h-9 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500">
                                  +{order.items.length - 3}
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              {order.items.length} item(s) · {order.items.reduce((s, i) => s + i.quantity, 0)} qty
                            </p>
                          </div>

                          {/* Progress Steps */}
                          {order.status !== 'iptal' && (
                            <div className="mb-4">
                              <div className="flex items-center">
                                {STATUS_STEPS.map((step, i) => (
                                  <div key={step} className="flex items-center flex-1 last:flex-none">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-sm border-2 transition-all ${
                                      i < stepIndex ? 'bg-orange-500 border-orange-500 text-white' :
                                      i === stepIndex ? 'bg-white border-orange-500 text-orange-500 font-bold' :
                                      'bg-gray-50 border-gray-200 text-gray-300'
                                    }`}>
                                      {i < stepIndex ? '✓' : STEP_ICONS[i]}
                                    </div>
                                    {i < STATUS_STEPS.length - 1 && (
                                      <div className={`h-1 flex-1 mx-1 rounded-full ${i < stepIndex ? 'bg-orange-400' : 'bg-gray-100'}`} />
                                    )}
                                  </div>
                                ))}
                              </div>
                              <div className="flex mt-2">
                                {STATUS_STEPS.map((step, i) => (
                                  <div key={step} className="flex-1 text-center">
                                    <span className={`text-[10px] font-medium ${i === stepIndex ? 'text-orange-500' : 'text-gray-400'}`}>
                                      {STATUS_LABELS[step]}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-50">
                            <button
                              onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                              className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 font-semibold bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              {isExpanded ? '▲ Hide' : '▼ Details'}
                            </button>
                            <button
                              onClick={() => downloadPdf(order)}
                              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1B3A6B] font-semibold bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <Download size={13} />
                              Invoice
                            </button>
                            <Link
                              href={`/siparis-takip?id=${order.id}`}
                              className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <ChevronRight size={13} />
                              Track
                            </Link>
                            {/* Tekrarla */}
                            <button
                              disabled={repeatingId === order.id}
                              onClick={() => repeatOrder(order)}
                              className="flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 font-semibold bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <RotateCcw size={13} />
                              {repeatingId === order.id ? 'Adding...' : 'Reorder'}
                            </button>
                            {/* İade/İptal Talebi — aktif talep yoksa göster */}
                            {order.status !== 'iptal' && !myReturns.some(r => r.orderId === order.id && (r.status === 'beklemede' || r.status === 'onaylandi')) && (
                              <button
                                onClick={() => {
                                  setReturnForm({ type: order.status === 'teslim-edildi' ? 'iade' : 'iptal', reason: '' });
                                  setReturnModal({ order });
                                }}
                                className="flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-700 font-semibold bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors"
                              >
                                <AlertCircle size={13} />
                                Return/Cancel
                              </button>
                            )}
                            {/* Return talep durumu */}
                            {orderReturn && (
                              <span className={`flex items-center gap-1 text-xs border px-2.5 py-1 rounded-lg font-semibold ${RETURN_BADGES[orderReturn.status]}`}>
                                <AlertCircle size={11} />
                                {orderReturn.type === 'iade' ? 'Return' : 'Cancel'} — {RETURN_LABELS[orderReturn.status]}
                                {orderReturn.adminNote && (
                                  <span className="font-normal ml-0.5">· {orderReturn.adminNote}</span>
                                )}
                              </span>
                            )}
                            {/* Hızlı iptal (30 dk pencere) */}
                            {order.status === 'hazirlanıyor' &&
                              (new Date().getTime() - new Date(order.createdAt).getTime()) < 30 * 60 * 1000 && (
                              <button
                                disabled={cancellingId === order.id}
                                onClick={async () => {
                                  if (!confirm('Are you sure you want to cancel this order?')) return;
                                  setCancellingId(order.id);
                                  try {
                                    await api.orders.cancel(order.id);
                                    setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: 'iptal' } : o));
                                  } catch (err: unknown) {
                                    toastError(err instanceof Error ? err.message : 'Order could not be cancelled.');
                                  } finally {
                                    setCancellingId(null);
                                  }
                                }}
                                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 font-semibold bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                              >
                                <XCircle size={13} />
                                {cancellingId === order.id ? 'Cancelling...' : 'Cancel Now'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expanded Detail */}
                        {isExpanded && (
                          <div className="border-t border-gray-100 bg-gray-50/60 p-5 space-y-4">
                            {/* Items */}
                            <div>
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Order Contents</p>
                              <div className="space-y-2">
                                {order.items.map((item) => {
                                  const imgUrl = item.productImageUrl && !item.productImageUrl.startsWith('/')
                                    ? item.productImageUrl
                                    : null;
                                  return (
                                    <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
                                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center text-lg">
                                        {imgUrl
                                          ? <Image src={imgUrl} alt={item.productName} fill className="object-cover" sizes="48px" />
                                          : '☀️'
                                        }
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#1B3A6B] line-clamp-1">{item.productName}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{item.quantity} qty × {item.unitPrice.toLocaleString('tr-TR')} ₺</p>
                                        {order.status === 'teslim-edildi' && item.warrantyMonths && item.warrantyMonths > 0 && (() => {
                                          const expiryDate = new Date(order.createdAt);
                                          expiryDate.setMonth(expiryDate.getMonth() + item.warrantyMonths);
                                          const isExpired = expiryDate < new Date();
                                          const remainingDays = Math.ceil((expiryDate.getTime() - Date.now()) / 86_400_000);
                                          return (
                                            <span className={`inline-flex items-center gap-1 text-[10px] font-semibold mt-1 px-1.5 py-0.5 rounded-md ${isExpired ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                                              🛡 {isExpired ? 'Warranty expired' : `Warranty: ${remainingDays} days left`}
                                            </span>
                                          );
                                        })()}
                                      </div>
                                      <p className="font-bold text-[#1B3A6B] text-sm shrink-0">{(item.unitPrice * item.quantity).toLocaleString('tr-TR')} ₺</p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="bg-white rounded-xl p-4 shadow-sm">
                              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Price Summary</p>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Subtotal</span>
                                  <span className="font-medium">{subtotal.toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-500">Shipping</span>
                                  <span className="font-medium">{kargo === 0 ? <span className="text-green-600">Free</span> : `${kargo.toLocaleString('tr-TR')} ₺`}</span>
                                </div>
                                <div className="flex justify-between font-extrabold text-[#1B3A6B] border-t border-gray-100 pt-2 mt-1 text-base">
                                  <span>Grand Total</span>
                                  <span>{order.total.toLocaleString('tr-TR')} ₺</span>
                                </div>
                              </div>
                            </div>

                            {/* Shipping Info */}
                            {order.shippingAddress && (
                              <div className="bg-white rounded-xl p-4 shadow-sm">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Shipping Address</p>
                                <p className="text-sm font-semibold text-gray-700">{order.shippingFullName}</p>
                                <p className="text-sm text-gray-500">{order.shippingPhone}</p>
                                <p className="text-sm text-gray-500 mt-0.5">{order.shippingAddress}</p>
                              </div>
                            )}
                            {order.note && (
                              <div className="bg-white rounded-xl p-4 shadow-sm">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Order Note</p>
                                <p className="text-sm text-gray-600">{order.note}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()
              )}
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'adresler' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#1B3A6B]">My Addresses</h2>
                <button onClick={openNewAddressForm} className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                  <Plus size={14} />
                  New Address
                </button>
              </div>

              {/* Address Form Modal */}
              {showAddressForm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-bold text-[#1B3A6B]">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                      <button onClick={() => setShowAddressForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Address Title', field: 'title', col: 2 },
                        { label: 'Full Name', field: 'fullName', col: 2 },
                        { label: 'Phone', field: 'phone', col: 2 },
                        { label: 'City', field: 'city', col: 1 },
                        { label: 'District', field: 'district', col: 1 },
                        { label: 'Neighborhood', field: 'neighborhood', col: 1 },
                        { label: 'Street / Address', field: 'street', col: 1 },
                      ].map(({ label, field, col }) => (
                        <div key={field} className={col === 2 ? 'col-span-2' : ''}>
                          <label className="text-xs font-semibold text-gray-600 block mb-1">{label}</label>
                          <input
                            type="text"
                            value={addressForm[field as keyof typeof addressForm] as string}
                            onChange={(e) => setAddressForm((p) => ({ ...p, [field]: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400"
                          />
                        </div>
                      ))}
                      <div className="col-span-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isDefault"
                          checked={addressForm.isDefault}
                          onChange={(e) => setAddressForm((p) => ({ ...p, isDefault: e.target.checked }))}
                          className="accent-orange-500"
                        />
                        <label htmlFor="isDefault" className="text-sm text-gray-700">Set as default address</label>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-5">
                      <button onClick={() => setShowAddressForm(false)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">Cancel</button>
                      <button onClick={saveAddress} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 rounded-xl transition-colors text-sm">Save</button>
                    </div>
                  </div>
                </div>
              )}

              {addressLoading ? (
                <div className="text-center py-10 text-gray-400">Loading...</div>
              ) : addresses.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                  <MapPin size={50} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-500">You have no saved addresses yet.</p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-[#1B3A6B]">{addr.title}</p>
                          {addr.isDefault && (
                            <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{addr.fullName}</p>
                        <p className="text-sm text-gray-600">{addr.phone}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {addr.street}, {addr.neighborhood}, {addr.district} / {addr.city}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => openEditAddressForm(addr)} className="text-sm text-orange-500 hover:text-orange-600 font-semibold">Edit</button>
                        <button onClick={() => deleteAddress(addr.id)} className="text-sm text-red-400 hover:text-red-600 font-semibold">Delete</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favoriler' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[#1B3A6B]">My Favorites</h2>
              {favLoading ? (
                <div className="text-center py-10 text-gray-400">Loading...</div>
              ) : favorites.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                  <Heart size={50} className="mx-auto text-gray-200 mb-3" />
                  <h3 className="font-bold text-gray-700 mb-2">Your Favorites List is Empty</h3>
                  <p className="text-gray-500 text-sm mb-4">Add products you like to your favorites.</p>
                  <Link href="/urunler" className="inline-block bg-orange-500 text-white font-semibold px-6 py-2 rounded-xl hover:bg-orange-600 transition-colors text-sm">
                    Explore Products
                  </Link>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 -mt-2">{favorites.length} product(s) favorited</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favorites.map((fav) => {
                      const CATEGORY_FALLBACKS: Record<string, string> = {
                        'gunes-panelleri': 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
                        'bataryalar': 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=300&fit=crop',
                        'inverterler': 'https://images.unsplash.com/photo-1548407260-da850faa41e3?w=400&h=300&fit=crop',
                        'montaj-aksesuarlari': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
                      };
                      const imgUrl = fav.product.imageUrl && !fav.product.imageUrl.startsWith('/')
                        ? fav.product.imageUrl
                        : (CATEGORY_FALLBACKS[fav.product.category] ?? CATEGORY_FALLBACKS['gunes-panelleri']);
                      return (
                        <div key={fav.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex group hover:shadow-md transition-shadow">
                          <div className="relative w-32 shrink-0 bg-gray-50">
                            <Image src={imgUrl} alt={fav.product.name} fill className="object-cover" sizes="128px" />
                            {fav.product.isNew && (
                              <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">NEW</span>
                            )}
                          </div>
                          <div className="p-4 flex flex-col flex-1 min-w-0">
                            <p className="text-xs text-orange-500 font-semibold mb-0.5">{fav.product.brand}</p>
                            <Link href={`/urunler/${makeProductSlug(fav.product.name, fav.product.id)}`} className="text-sm font-bold text-[#1B3A6B] hover:text-orange-500 line-clamp-2 mb-1 transition-colors">
                              {fav.product.name}
                            </Link>
                            <p className="text-xs text-gray-400 mb-2">
                              {fav.product.stock > 0 ? (
                                <span className="text-green-600 font-medium">In stock</span>
                              ) : (
                                <span className="text-red-500 font-medium">Out of stock</span>
                              )}
                            </p>
                            <p className="text-lg font-extrabold text-[#1B3A6B] mt-auto">{fav.product.price.toLocaleString('tr-TR')} ₺</p>
                            <div className="flex gap-2 mt-2">
                              <Link href={`/urunler/${makeProductSlug(fav.product.name, fav.product.id)}`} className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-1.5 rounded-lg transition-colors">
                                View
                              </Link>
                              <button
                                onClick={async () => { await toggle(fav.product.id); setFavorites((p) => p.filter((f) => f.id !== fav.id)); }}
                                className="px-3 border border-red-200 text-red-400 hover:bg-red-50 text-xs font-semibold py-1.5 rounded-lg transition-colors"
                              >
                                <Heart size={13} className="fill-red-300" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Cards Tab */}
          {activeTab === 'kartlar' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#1B3A6B]">My Saved Cards</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Your card details are stored securely. Only the last 4 digits are displayed.</p>
                </div>
                <button
                  onClick={() => {
                    setCardForm({ cardHolderName: '', number: '', expiryMonth: '', expiryYear: '', cardType: 'Visa', isDefault: false });
                    setShowCardForm(true);
                  }}
                  className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shrink-0"
                >
                  <Plus size={14} />
                  New Card
                </button>
              </div>

              {/* Card Form Modal */}
              {showCardForm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-lg font-bold text-[#1B3A6B]">Add New Card</h3>
                      <button onClick={() => setShowCardForm(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                    </div>

                    {/* Preview */}
                    <div className={`rounded-2xl p-5 mb-5 text-white relative overflow-hidden ${
                      cardForm.cardType === 'Visa' ? 'bg-gradient-to-br from-blue-700 to-blue-500' :
                      cardForm.cardType === 'Mastercard' ? 'bg-gradient-to-br from-red-700 to-red-500' :
                      'bg-gradient-to-br from-gray-700 to-gray-500'
                    }`}>
                      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 -translate-y-8 translate-x-8" />
                      <p className="text-xs font-semibold opacity-70 mb-4">BANK CARD</p>
                      <p className="font-mono text-lg tracking-widest mb-4">
                        {cardForm.number ? cardForm.number.replace(/\d{4}(?=.)/g, '$& ').slice(0, 4).padEnd(4, '•') + ' •••• •••• ' + (cardForm.number.replace(/\D/g, '').slice(-4) || '••••') : '**** **** **** ****'}
                      </p>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs opacity-70">Card Holder</p>
                          <p className="font-semibold text-sm">{cardForm.cardHolderName || 'FULL NAME'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs opacity-70">Expiry Date</p>
                          <p className="font-semibold text-sm">{cardForm.expiryMonth || 'MM'}/{cardForm.expiryYear || 'YY'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Name on Card</label>
                        <input
                          type="text"
                          value={cardForm.cardHolderName}
                          onChange={e => setCardForm(p => ({ ...p, cardHolderName: e.target.value.toUpperCase() }))}
                          placeholder="FULL NAME"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 font-medium tracking-wider"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Card Number (last 4 digits)</label>
                        <input
                          type="text"
                          value={cardForm.number}
                          onChange={e => setCardForm(p => ({ ...p, number: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                          placeholder="1234"
                          maxLength={4}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 font-mono tracking-widest"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-1">Month</label>
                          <select
                            value={cardForm.expiryMonth}
                            onChange={e => setCardForm(p => ({ ...p, expiryMonth: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-white"
                          >
                            <option value="">MM</option>
                            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(m => (
                              <option key={m} value={m}>{m}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-1">Year</label>
                          <select
                            value={cardForm.expiryYear}
                            onChange={e => setCardForm(p => ({ ...p, expiryYear: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-white"
                          >
                            <option value="">YY</option>
                            {Array.from({ length: 10 }, (_, i) => String(new Date().getFullYear() + i).slice(-2)).map(y => (
                              <option key={y} value={y}>{y}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600 block mb-1">Type</label>
                          <select
                            value={cardForm.cardType}
                            onChange={e => setCardForm(p => ({ ...p, cardType: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-400 bg-white"
                          >
                            <option value="Visa">Visa</option>
                            <option value="Mastercard">MC</option>
                            <option value="Troy">Troy</option>
                          </select>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cardForm.isDefault}
                          onChange={e => setCardForm(p => ({ ...p, isDefault: e.target.checked }))}
                          className="accent-orange-500 rounded"
                        />
                        <span className="text-sm text-gray-700">Set as default card</span>
                      </label>
                    </div>

                    <div className="flex gap-3 mt-5">
                      <button onClick={() => setShowCardForm(false)} className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">Cancel</button>
                      <button
                        disabled={cardSaving || !cardForm.cardHolderName || !cardForm.number || cardForm.number.length !== 4 || !cardForm.expiryMonth || !cardForm.expiryYear}
                        onClick={async () => {
                          setCardSaving(true);
                          try {
                            const created = await api.cards.create({
                              cardHolderName: cardForm.cardHolderName,
                              last4: cardForm.number,
                              expiryMonth: cardForm.expiryMonth,
                              expiryYear: cardForm.expiryYear,
                              cardType: cardForm.cardType,
                              isDefault: cardForm.isDefault,
                            });
                            setCards(prev => cardForm.isDefault
                              ? [created, ...prev.map(c => ({ ...c, isDefault: false }))]
                              : [...prev, created]
                            );
                            setShowCardForm(false);
                          } catch {
                            toastError('Card could not be added.');
                          } finally {
                            setCardSaving(false);
                          }
                        }}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
                      >
                        {cardSaving ? 'Adding...' : 'Add Card'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {cardsLoading ? (
                <div className="text-center py-10 text-gray-400">Loading...</div>
              ) : cards.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                  <CreditCard size={50} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-gray-500 text-sm mb-4">You have no saved cards yet.</p>
                  <button
                    onClick={() => { setCardForm({ cardHolderName: '', number: '', expiryMonth: '', expiryYear: '', cardType: 'Visa', isDefault: false }); setShowCardForm(true); }}
                    className="inline-flex items-center gap-1.5 bg-orange-500 text-white font-semibold px-5 py-2 rounded-xl hover:bg-orange-600 transition-colors text-sm"
                  >
                    <Plus size={14} />
                    Add New Card
                  </button>
                </div>
              ) : (
                cards.map((card) => (
                  <div key={card.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-8 rounded-lg flex items-center justify-center text-xs font-extrabold ${card.cardType === 'Visa' ? 'bg-blue-600 text-white' : card.cardType === 'Mastercard' ? 'bg-red-600 text-white' : 'bg-gray-700 text-white'}`}>
                          {card.cardType === 'Mastercard' ? 'MC' : card.cardType}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-[#1B3A6B] tracking-widest">**** **** **** {card.last4}</p>
                            {card.isDefault && (
                              <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full">Default</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{card.cardHolderName} · {card.expiryMonth}/{card.expiryYear}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!card.isDefault && (
                          <button
                            onClick={async () => { await api.cards.setDefault(card.id); api.cards.getAll().then(setCards); }}
                            className="text-xs text-gray-500 hover:text-orange-500 font-semibold border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={async () => { if (!confirm('Are you sure you want to delete this card?')) return; await api.cards.delete(card.id); setCards((p) => p.filter((c) => c.id !== card.id)); }}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'ayarlar' && (
            <div className="space-y-5">
              {/* Şifre Değiştir */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-[#1B3A6B] mb-5">Change Password</h2>
                <PasswordChangeForm />
              </div>

              {/* Bildirim Tercihleri */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-[#1B3A6B] mb-4">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { label: 'Email notifications', desc: 'Order updates and campaigns', value: notifEmail, key: 'notif_email', set: setNotifEmail },
                    { label: 'SMS notifications', desc: 'Shipping tracking SMS messages', value: notifSms, key: 'notif_sms', set: setNotifSms },
                    { label: 'Newsletter subscription', desc: 'Weekly product and campaign news', value: notifNewsletter, key: 'notif_newsletter', set: setNotifNewsletter },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={item.value}
                          onChange={(e) => {
                            item.set(e.target.checked);
                            localStorage.setItem(item.key, String(e.target.checked));
                          }}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      </label>
                    </div>
                  ))}
                  {/* Flash indirim bildirimi — sunucuda saklanır */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">⚡ Flash sale notifications</p>
                      <p className="text-xs text-gray-500">Get instantly notified about limited-stock flash sales</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={notifFlash}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setNotifFlash(val);
                          api.auth.setFlashNotify(val).catch(() => {});
                        }}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>

                  {/* Web Push bildirimi */}
                  {pushSupported && (
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">🔔 Browser notifications (Push)</p>
                        <p className="text-xs text-gray-500">
                          {pushPermission === 'denied'
                            ? 'Notification permission denied. You can enable it in browser settings.'
                            : 'Receive order and discount notifications even when away from the site'}
                        </p>
                      </div>
                      {pushPermission !== 'denied' && (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={pushSubscribed}
                            disabled={pushLoading}
                            onChange={(e) => { e.target.checked ? pushSubscribe() : pushUnsubscribe(); }}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B3A6B] peer-disabled:opacity-50"></div>
                        </label>
                      )}
                    </div>
                  )}
                </div>
              </div>

          {/* Warranty Tab */}
          {(activeTab as string) === 'garanti' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#1B3A6B]">My Warranties</h2>
                <button
                  onClick={() => {
                    setWarrantiesLoading(true);
                    api.warranty.getMy().then(setWarranties).catch(() => {}).finally(() => setWarrantiesLoading(false));
                  }}
                  className="text-sm text-orange-500 hover:text-orange-600 font-semibold"
                >
                  Refresh
                </button>
              </div>

              {/* Register from delivered orders */}
              {orders.length > 0 && (() => {
                const deliveredOrders = orders.filter(o => o.status === 'teslim-edildi');
                const registeredKeys = new Set(warranties.map(w => `${w.orderId}-${w.productId}`));
                const pendingItems = deliveredOrders.flatMap(o =>
                  o.items
                    .filter(item => !registeredKeys.has(`${o.id}-${item.productId}`))
                    .map(item => ({ order: o, item }))
                );
                if (pendingItems.length === 0) return null;
                return (
                  <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                    <p className="text-sm font-bold text-orange-700 mb-3">Products Without Warranty Registration</p>
                    <div className="space-y-2">
                      {pendingItems.map(({ order, item }) => (
                        <div key={`${order.id}-${item.productId}`} className="flex items-center justify-between bg-white rounded-xl p-3 border border-orange-100">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{item.productName}</p>
                            <p className="text-xs text-gray-400">Order #{order.id} · {new Date(order.createdAt).toLocaleDateString('en-GB')}</p>
                          </div>
                          <button
                            onClick={() => { setWarrantyModal({ order, productId: item.productId, productName: item.productName }); setWarrantySerial(''); setWarrantyMsg(null); }}
                            className="shrink-0 ml-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Register
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {warrantiesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />)}
                </div>
              ) : warranties.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                  <Shield size={50} className="mx-auto text-gray-200 mb-3" />
                  <h3 className="font-bold text-gray-700 mb-2">No Warranty Registrations</h3>
                  <p className="text-gray-500 text-sm">You can register warranties for products in your delivered orders from above.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {warranties.map(w => {
                    const isActive = w.status === 'active';
                    const expiresDate = new Date(w.expiresAt);
                    const now = new Date();
                    const daysLeft = Math.ceil((expiresDate.getTime() - now.getTime()) / 86400000);
                    return (
                      <div key={w.id} className={`bg-white rounded-2xl border p-5 shadow-sm ${isActive ? 'border-green-200' : 'border-gray-200'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                              <Shield size={20} className={isActive ? 'text-green-600' : 'text-gray-400'} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-800 truncate">{w.productName}</p>
                              {w.serialNumber && <p className="text-xs text-gray-400">S/N: {w.serialNumber}</p>}
                              <p className="text-xs text-gray-400">Order #{w.orderId} · {w.warrantyMonths} month warranty</p>
                            </div>
                          </div>
                          <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {isActive ? 'Active' : 'Expired'}
                          </span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-500">
                          <div>
                            <span className="font-semibold text-gray-700">Purchase Date: </span>
                            {new Date(w.purchaseDate).toLocaleDateString('tr-TR')}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-700">Expiry: </span>
                            {expiresDate.toLocaleDateString('tr-TR')}
                            {isActive && daysLeft <= 90 && (
                              <span className="ml-1 text-amber-600 font-bold">({daysLeft} days)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Warranty Registration Modal */}
              {warrantyModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                    <h3 className="font-extrabold text-[#1B3A6B] text-lg mb-1">Warranty Registration</h3>
                    <p className="text-sm text-gray-500 mb-4">{warrantyModal.productName}</p>
                    {warrantyMsg && (
                      <div className={`text-sm px-4 py-3 rounded-xl mb-4 font-medium ${warrantyMsg.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                        {warrantyMsg.text}
                      </div>
                    )}
                    <label className="text-sm font-semibold text-gray-700 block mb-1">Serial Number <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input
                      type="text"
                      value={warrantySerial}
                      onChange={e => setWarrantySerial(e.target.value)}
                      placeholder="S/N code on the product"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 mb-4"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setWarrantyModal(null); setWarrantyMsg(null); }}
                        className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 text-sm transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={warrantySubmitting}
                        onClick={async () => {
                          setWarrantySubmitting(true);
                          setWarrantyMsg(null);
                          try {
                            const reg = await api.warranty.register(warrantyModal.order.id, warrantyModal.productId, warrantySerial);
                            setWarranties(prev => [reg, ...prev]);
                            setWarrantyMsg({ ok: true, text: 'Your warranty has been successfully registered.' });
                            setTimeout(() => setWarrantyModal(null), 1500);
                          } catch (e: unknown) {
                            setWarrantyMsg({ ok: false, text: e instanceof Error ? e.message : 'An error occurred.' });
                          } finally {
                            setWarrantySubmitting(false);
                          }
                        }}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-xl text-sm transition-colors"
                      >
                        {warrantySubmitting ? 'Registering...' : 'Register Warranty'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-sm font-bold text-red-500 mb-3">Danger Zone</h3>
                <p className="text-xs text-gray-500 mb-3">When you delete your account, all your data will be permanently deleted.</p>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  className="border-2 border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-50 font-semibold px-5 py-2 rounded-xl transition-colors text-sm flex items-center gap-2"
                >
                  {deletingAccount ? <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" /> : null}
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense>
      <AccountPageContent />
    </Suspense>
  );
}
