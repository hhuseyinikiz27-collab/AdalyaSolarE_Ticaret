'use client';

import { useEffect, useState } from 'react';
import {
  api, ApiCampaign,
} from '@/lib/api';
import { revalidateAfterCampaignChange } from '@/lib/revalidate';
import {
  Plus, Edit2, Trash2, X, Check, Loader2,
  Zap, Package, Gift, Star, Tag, Megaphone,
  Clock, ArrowRight, UserCheck, Lock, AlertTriangle,
} from 'lucide-react';
import { ApiCoupon } from '@/lib/api';

// ─── Constants ────────────────────────────────────────────────────────────────

const REQUIREMENT_OPTIONS = [
  {
    value: 'join',
    label: 'Participation Required',
    desc: 'The user joins the campaign by clicking the "Join" button.',
  },
  {
    value: 'registered',
    label: 'Registered Member',
    desc: 'Anyone with an account on the site automatically qualifies.',
  },
  {
    value: 'corporate_contact',
    label: 'Corporate Quote Form',
    desc: 'The user must fill out the corporate quote form from the contact page.',
  },
] as const;

const RENK_TEMALARI = [
  { label: 'Orange', from: '#f97316', to: '#ea6c0a' },
  { label: 'Navy', from: '#1B3A6B', to: '#2d5282' },
  { label: 'Purple', from: '#7c3aed', to: '#6d28d9' },
  { label: 'Green', from: '#059669', to: '#047857' },
  { label: 'Red', from: '#dc2626', to: '#b91c1c' },
  { label: 'Pink', from: '#db2777', to: '#be185d' },
  { label: 'Dark Gray', from: '#374151', to: '#1f2937' },
  { label: 'Turquoise', from: '#0891b2', to: '#0e7490' },
];

const IKON_SEÇENEKLER = [
  { ad: 'Zap',       Bileşen: Zap,       etiket: 'Lightning' },
  { ad: 'Package',   Bileşen: Package,   etiket: 'Package'   },
  { ad: 'Gift',      Bileşen: Gift,      etiket: 'Gift'      },
  { ad: 'Star',      Bileşen: Star,      etiket: 'Star'      },
  { ad: 'Tag',       Bileşen: Tag,       etiket: 'Tag'       },
  { ad: 'Megaphone', Bileşen: Megaphone, etiket: 'Megaphone' },
];

const IKON_RENK_SEÇ = [
  { cls: 'text-yellow-300', etiket: 'Yellow' },
  { cls: 'text-white',      etiket: 'White'  },
  { cls: 'text-green-300',  etiket: 'Green'  },
  { cls: 'text-pink-300',   etiket: 'Pink'   },
  { cls: 'text-amber-300',  etiket: 'Amber'  },
  { cls: 'text-sky-300',    etiket: 'Blue'   },
];

const REQUIREMENT_LABELS: Record<string, string> = {
  join: 'Participation Required',
  registered: 'Registered Member',
  corporate_contact: 'Corporate Form',
};

type FormData = {
  title: string;
  subtitle: string;
  discount: string;
  description: string;
  endDate: string;
  gradientFrom: string;
  gradientTo: string;
  href: string;
  hrefLabel: string;
  badge: string;
  badgeBg: string;
  couponCode: string;
  icon: string;
  iconClass: string;
  requirement: 'join' | 'registered' | 'corporate_contact';
  isActive: boolean;
  sortOrder: number;
};

const BOŞ_FORM: FormData = {
  title: '',
  subtitle: '',
  discount: '',
  description: '',
  endDate: '',
  gradientFrom: '#f97316',
  gradientTo: '#ea6c0a',
  href: '/urunler',
  hrefLabel: 'Go to Products',
  badge: '',
  badgeBg: 'rgba(255,255,255,0.2)',
  couponCode: '',
  icon: 'Tag',
  iconClass: 'text-yellow-300',
  requirement: 'join',
  isActive: true,
  sortOrder: 0,
};

// ─── Live Preview ─────────────────────────────────────────────────────────────

function KampanyaÖnizleme({ form }: { form: FormData }) {
  const ikonMeta = IKON_SEÇENEKLER.find(i => i.ad === form.icon);
  const İkon = ikonMeta?.Bileşen ?? Tag;

  return (
    <div className="sticky top-0 pt-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">
        Live Preview
      </p>
      <div
        className="relative rounded-2xl p-6 text-white overflow-hidden select-none"
        style={{ background: `linear-gradient(135deg, ${form.gradientFrom}, ${form.gradientTo})` }}
      >
        {/* Decorative circles */}
        <div className="absolute rounded-full pointer-events-none opacity-10 bg-white"
          style={{ width: 160, height: 160, bottom: -32, right: -32 }} />
        <div className="absolute rounded-full pointer-events-none opacity-5 bg-white"
          style={{ width: 220, height: 220, bottom: -60, right: -60 }} />

        {/* Badge */}
        {form.badge && (
          <span
            className="absolute top-4 right-4 text-white text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: form.badgeBg }}
          >
            {form.badge}
          </span>
        )}

        {form.requirement === 'join' && (
          <span className="absolute top-4 left-4 bg-green-500/80 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <UserCheck size={10} /> Joined
          </span>
        )}

        <div className="relative z-10">
          <div className="mb-3 mt-1">
            <İkon size={32} className={form.iconClass} />
          </div>
          <p className="text-sm font-semibold mb-1 text-white/70">
            {form.subtitle || 'Subtitle'}
          </p>
          <h2 className="text-xl font-extrabold text-white mb-1">
            {form.title || 'Campaign Title'}
          </h2>
          <div className="text-3xl font-extrabold text-yellow-300 mb-3">
            {form.discount || '00% Discount'}
          </div>
          <p className="text-sm leading-relaxed mb-4 text-white/80 line-clamp-3">
            {form.description || 'Campaign description will appear here.'}
          </p>

          {/* Coupon area preview */}
          {form.couponCode ? (
            <div className="flex items-center gap-2 bg-white/15 border border-white/30 rounded-xl px-3 py-2 mb-4">
              <div className="flex-1">
                <p className="text-white/60 text-xs">Coupon Code</p>
                <p className="text-white font-extrabold tracking-widest">{form.couponCode}</p>
              </div>
              <div className="bg-white/20 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg">Copy</div>
            </div>
          ) : form.requirement !== 'join' && (
            <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3 mb-4">
              <Lock size={16} className="text-white/50" />
              <p className="text-white/80 text-sm">Coupon code locked</p>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-white/65">
              <Clock size={12} />
              {form.endDate ? `End: ${form.endDate}` : 'End date'}
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 border border-white/30 text-white text-sm font-bold px-4 py-2 rounded-xl">
              {form.hrefLabel || 'Go to Button'}
              <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-2">
        This is exactly how it will appear on the campaign page
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminKampanyalarSayfası() {
  const [kampanyalar, setKampanyalar] = useState<ApiCampaign[]>([]);
  const [yükleniyor, setYükleniyor] = useState(true);
  const [formAçık, setFormAçık] = useState(false);
  const [düzenlenenId, setDüzenlenenId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(BOŞ_FORM);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState('');
  const [siliniyorId, setSiliniyorId] = useState<number | null>(null);
  const [mevcutKuponlar, setMevcutKuponlar] = useState<ApiCoupon[]>([]);

  const f = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  async function yükle() {
    setYükleniyor(true);
    try {
      setKampanyalar(await api.admin.campaigns.getAll());
    } catch {
      setHata('Failed to load campaigns.');
    } finally {
      setYükleniyor(false);
    }
  }

  useEffect(() => {
    yükle();
    api.admin.coupons.getAll().then(setMevcutKuponlar).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function yeniAç() {
    setDüzenlenenId(null);
    setForm(BOŞ_FORM);
    setHata('');
    setFormAçık(true);
  }

  function düzenlemeAç(c: ApiCampaign) {
    setDüzenlenenId(c.id);
    setForm({
      title: c.title, subtitle: c.subtitle, discount: c.discount,
      description: c.description, endDate: c.endDate,
      gradientFrom: c.gradientFrom, gradientTo: c.gradientTo,
      href: c.href, hrefLabel: c.hrefLabel, badge: c.badge,
      badgeBg: c.badgeBg, couponCode: c.couponCode ?? '',
      icon: c.icon, iconClass: c.iconClass,
      requirement: c.requirement, isActive: c.isActive ?? true,
      sortOrder: c.sortOrder,
    });
    setHata('');
    setFormAçık(true);
  }

  async function kaydet() {
    if (!form.title.trim()) { setHata('Campaign title is required.'); return; }
    if (!form.discount.trim()) { setHata('Discount rate/amount is required.'); return; }
    if (!form.description.trim()) { setHata('Description is required.'); return; }
    setKaydediliyor(true);
    setHata('');
    try {
      const payload = { ...form, couponCode: form.couponCode || null };
      if (düzenlenenId) {
        await api.admin.campaigns.update(düzenlenenId, payload);
      } else {
        await api.admin.campaigns.create(payload);
      }
      setFormAçık(false);
      await yükle();
      await revalidateAfterCampaignChange();
    } catch (e: unknown) {
      setHata(e instanceof Error ? e.message : 'Could not save. Please try again.');
    } finally {
      setKaydediliyor(false);
    }
  }

  async function sil(id: number) {
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    setSiliniyorId(id);
    try {
      await api.admin.campaigns.delete(id);
      setKampanyalar(prev => prev.filter(c => c.id !== id));
      await revalidateAfterCampaignChange();
    } catch {
      setHata('Failed to delete campaign.');
    } finally {
      setSiliniyorId(null);
    }
  }

  const seçiliTema = RENK_TEMALARI.find(
    t => t.from === form.gradientFrom && t.to === form.gradientTo
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-500 text-sm mt-1">{kampanyalar.length} campaigns</p>
        </div>
        <button
          onClick={yeniAç}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Add New Campaign
        </button>
      </div>

      {hata && !formAçık && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{hata}</div>
      )}

      {/* Campaign List */}
      {yükleniyor ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-orange-500" size={32} />
        </div>
      ) : kampanyalar.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Megaphone size={48} className="mx-auto mb-3 text-gray-200" />
          <p className="text-lg font-medium">No campaigns added yet</p>
          <p className="text-sm mt-1">Click the button above to create your first campaign</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {kampanyalar.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 text-white font-extrabold text-sm text-center leading-tight px-1"
                  style={{ background: `linear-gradient(135deg, ${c.gradientFrom}, ${c.gradientTo})` }}
                >
                  {c.discount}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{c.title}</span>
                    {c.isActive
                      ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                      : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>}
                    <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                      {REQUIREMENT_LABELS[c.requirement] ?? c.requirement}
                    </span>
                    {c.hasCoupon && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Has coupon code</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 truncate">{c.subtitle}</p>
                  <p className="text-xs text-gray-400 mt-0.5">End date: {c.endDate || '—'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => düzenlemeAç(c)}
                  className="p-2 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => sil(c.id)} disabled={siliniyorId === c.id}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
                  {siliniyorId === c.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Form Modal ── */}
      {formAçık && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto p-4 py-8">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b shrink-0">
              <div>
                <h2 className="font-bold text-lg text-gray-900">
                  {düzenlenenId ? 'Edit Campaign' : 'Create New Campaign'}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Fill in the details on the left and see a live preview on the right.
                </p>
              </div>
              <button onClick={() => setFormAçık(false)} className="text-gray-400 hover:text-gray-600">
                <X size={22} />
              </button>
            </div>

            {/* Content: Form + Preview */}
            <div className="flex flex-col lg:flex-row flex-1 min-h-0">

              {/* ── Left: Form fields ── */}
              <div className="flex-1 overflow-y-auto p-7 space-y-7 border-r border-gray-100">

                {/* 1. Basic Information */}
                <section>
                  <h3 className="text-sm font-bold text-[#1B3A6B] uppercase tracking-wider mb-4">
                    1 — Basic Information
                  </h3>
                  <div className="space-y-4">
                    <Alan label="Campaign Title" zorunlu açıklama="e.g. Summer Solar Campaign">
                      <input
                        className={giriş}
                        placeholder="Enter campaign name..."
                        value={form.title}
                        onChange={e => f('title', e.target.value)}
                      />
                    </Alan>
                    <Alan label="Subtitle" açıklama="Small text immediately below the title">
                      <input
                        className={giriş}
                        placeholder="e.g. On All Solar Panels"
                        value={form.subtitle}
                        onChange={e => f('subtitle', e.target.value)}
                      />
                    </Alan>
                    <Alan label="Discount Amount / Rate" zorunlu açıklama='Large text displayed in the centre of the card'>
                      <input
                        className={giriş}
                        placeholder="e.g. 15% Discount  or  $50 Off"
                        value={form.discount}
                        onChange={e => f('discount', e.target.value)}
                      />
                    </Alan>
                    <Alan label="Campaign Description" zorunlu açıklama="Short text explaining the campaign to the user">
                      <textarea
                        className={`${giriş} resize-none`}
                        rows={3}
                        placeholder="Within the scope of this campaign..."
                        value={form.description}
                        onChange={e => f('description', e.target.value)}
                      />
                    </Alan>
                    <Alan label="End Date" açıklama="Enter as plain text (the system does not validate automatically)">
                      <input
                        className={giriş}
                        placeholder="e.g. 31 July 2026  or  Unlimited"
                        value={form.endDate}
                        onChange={e => f('endDate', e.target.value)}
                      />
                    </Alan>
                  </div>
                </section>

                {/* 2. Appearance */}
                <section>
                  <h3 className="text-sm font-bold text-[#1B3A6B] uppercase tracking-wider mb-4">
                    2 — Appearance
                  </h3>

                  {/* Color Theme */}
                  <Alan label="Card Color Theme" açıklama="Background color of the campaign card">
                    <div className="grid grid-cols-4 gap-2">
                      {RENK_TEMALARI.map(t => (
                        <button
                          key={t.label}
                          type="button"
                          onClick={() => { f('gradientFrom', t.from); f('gradientTo', t.to); }}
                          className={`rounded-xl h-11 text-white text-xs font-bold transition-all ${
                            seçiliTema?.label === t.label
                              ? 'ring-2 ring-offset-2 ring-orange-500 scale-105'
                              : 'opacity-80 hover:opacity-100'
                          }`}
                          style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                    {!seçiliTema && (
                      <p className="text-xs text-gray-400 mt-1">Custom color selected</p>
                    )}
                    <details className="mt-2">
                      <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                        Enter custom color (advanced)
                      </summary>
                      <div className="flex gap-3 mt-2">
                        <label className="flex flex-col gap-1 flex-1 text-xs text-gray-500">
                          Start color
                          <input type="color" value={form.gradientFrom}
                            onChange={e => f('gradientFrom', e.target.value)}
                            className="w-full h-9 rounded-lg border cursor-pointer" />
                        </label>
                        <label className="flex flex-col gap-1 flex-1 text-xs text-gray-500">
                          End color
                          <input type="color" value={form.gradientTo}
                            onChange={e => f('gradientTo', e.target.value)}
                            className="w-full h-9 rounded-lg border cursor-pointer" />
                        </label>
                      </div>
                    </details>
                  </Alan>

                  {/* Icon */}
                  <Alan label="Card Icon" açıklama="Icon displayed in the top-left of the card" className="mt-4">
                    <div className="flex gap-2 flex-wrap">
                      {IKON_SEÇENEKLER.map(({ ad, Bileşen, etiket }) => (
                        <button
                          key={ad}
                          type="button"
                          onClick={() => f('icon', ad)}
                          className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl border-2 transition-all text-xs font-medium ${
                            form.icon === ad
                              ? 'border-orange-500 bg-orange-50 text-orange-600'
                              : 'border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          <Bileşen size={20} />
                          {etiket}
                        </button>
                      ))}
                    </div>
                  </Alan>

                  {/* Icon color */}
                  <Alan label="Icon Color" className="mt-4">
                    <div className="flex gap-2 flex-wrap">
                      {IKON_RENK_SEÇ.map(({ cls, etiket }) => {
                        const İkon = IKON_SEÇENEKLER.find(i => i.ad === form.icon)?.Bileşen ?? Tag;
                        return (
                          <button
                            key={cls}
                            type="button"
                            onClick={() => f('iconClass', cls)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all ${
                              form.iconClass === cls
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            style={{
                              background: `linear-gradient(135deg, ${form.gradientFrom}, ${form.gradientTo})`,
                              color: 'white',
                            }}
                          >
                            <İkon size={16} className={cls} />
                            {etiket}
                          </button>
                        );
                      })}
                    </div>
                  </Alan>

                  {/* Badge */}
                  <Alan label="Corner Badge" açıklama="Small label in the top-right of the card (can be left blank)" className="mt-4">
                    <input
                      className={giriş}
                      placeholder="e.g. MOST POPULAR  or  SPECIAL OFFER"
                      value={form.badge}
                      onChange={e => f('badge', e.target.value)}
                    />
                  </Alan>
                </section>

                {/* 3. Campaign Rules */}
                <section>
                  <h3 className="text-sm font-bold text-[#1B3A6B] uppercase tracking-wider mb-4">
                    3 — Campaign Rules
                  </h3>

                  <Alan label="Participation Condition" zorunlu açıklama="How can the user access the coupon code?">
                    <div className="space-y-2">
                      {REQUIREMENT_OPTIONS.map(opt => (
                        <label
                          key={opt.value}
                          className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            form.requirement === opt.value
                              ? 'border-orange-400 bg-orange-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="requirement"
                            value={opt.value}
                            checked={form.requirement === opt.value}
                            onChange={() => f('requirement', opt.value)}
                            className="mt-0.5 accent-orange-500"
                          />
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{opt.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </Alan>

                  <Alan label="Coupon Code" açıklama="Leave blank to hide the coupon code" className="mt-4">
                    <input
                      className={`${giriş} uppercase`}
                      placeholder="e.g. SUMMER15  or  WELCOME10"
                      value={form.couponCode}
                      onChange={e => f('couponCode', e.target.value.toUpperCase())}
                    />
                    {/* Coupon code mismatch warning */}
                    {form.couponCode.trim() && (() => {
                      const kod = form.couponCode.trim().toUpperCase();
                      const eslesen = mevcutKuponlar.find(c => c.code === kod);
                      if (!eslesen) {
                        return (
                          <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-sm text-amber-800">
                            <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold">"{kod}" code not found in Coupon Management!</p>
                              <p className="text-xs text-amber-700 mt-0.5">
                                Users will get an error when they try to apply this code at checkout.
                                First create this code from the <strong>Coupon Management</strong> page and link it to the campaign.
                              </p>
                            </div>
                          </div>
                        );
                      }
                      if (!eslesen.isActive || (eslesen.expiresAt && new Date(eslesen.expiresAt).getTime() < Date.now())) {
                        return (
                          <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-sm text-red-800">
                            <AlertTriangle size={15} className="text-red-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold">"{kod}" coupon is inactive or expired!</p>
                              <p className="text-xs text-red-700 mt-0.5">
                                Users cannot use this coupon. Activate it from Coupon Management.
                              </p>
                            </div>
                          </div>
                        );
                      }
                      if (eslesen.campaignId && eslesen.campaignId !== düzenlenenId) {
                        return (
                          <div className="mt-2 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 text-sm text-blue-800">
                            <AlertTriangle size={15} className="text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-xs">This coupon is linked to another campaign. Update the campaign ID to this campaign from Coupon Management.</p>
                          </div>
                        );
                      }
                      return (
                        <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-sm text-green-700">
                          <Check size={14} className="text-green-500 shrink-0" />
                          <p className="text-xs font-medium">Coupon found and valid ✓</p>
                        </div>
                      );
                    })()}
                  </Alan>
                </section>

                {/* 4. Button and Other */}
                <section>
                  <h3 className="text-sm font-bold text-[#1B3A6B] uppercase tracking-wider mb-4">
                    4 — Button and Other
                  </h3>
                  <div className="space-y-4">
                    <Alan label="Button Link" açıklama="Where should clicking the button go?">
                      <input
                        className={giriş}
                        placeholder="/products  or  /contact"
                        value={form.href}
                        onChange={e => f('href', e.target.value)}
                      />
                    </Alan>
                    <Alan label="Button Text">
                      <input
                        className={giriş}
                        placeholder="e.g. Go to Products"
                        value={form.hrefLabel}
                        onChange={e => f('hrefLabel', e.target.value)}
                      />
                    </Alan>
                    <Alan label="Sort Order" açıklama="Lower number → shown first">
                      <input
                        type="number"
                        className={giriş}
                        min={0}
                        value={form.sortOrder}
                        onChange={e => f('sortOrder', Number(e.target.value))}
                      />
                    </Alan>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={e => f('isActive', e.target.checked)}
                        className="w-4 h-4 accent-orange-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Publish Campaign</p>
                        <p className="text-xs text-gray-400">If unchecked, the campaign remains hidden</p>
                      </div>
                    </label>
                  </div>
                </section>
              </div>

              {/* ── Right: Live Preview ── */}
              <div className="w-full lg:w-96 p-7 bg-gray-50 overflow-y-auto">
                <KampanyaÖnizleme form={form} />
              </div>
            </div>

            {/* Bottom bar */}
            {hata && (
              <div className="mx-7 mb-0 mt-0 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl">{hata}</div>
            )}
            <div className="flex justify-between items-center px-7 py-5 border-t bg-white rounded-b-2xl">
              <p className="text-xs text-gray-400">
                Fields marked with * are required
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setFormAçık(false)}
                  className="px-5 py-2.5 rounded-xl border text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={kaydet}
                  disabled={kaydediliyor}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {kaydediliyor ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  {kaydediliyor ? 'Saving...' : (düzenlenenId ? 'Save Changes' : 'Create Campaign')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────

const giriş = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors';

function Alan({
  label, zorunlu, açıklama, children, className = '',
}: {
  label: string;
  zorunlu?: boolean;
  açıklama?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block mb-1">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        {zorunlu && <span className="text-orange-500 ml-1">*</span>}
        {açıklama && <span className="text-xs text-gray-400 ml-2">{açıklama}</span>}
      </label>
      {children}
    </div>
  );
}
