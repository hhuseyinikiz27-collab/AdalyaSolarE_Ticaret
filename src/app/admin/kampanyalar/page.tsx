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

// ─── Sabitler ────────────────────────────────────────────────────────────────

const REQUIREMENT_OPTIONS = [
  {
    value: 'join',
    label: 'Katılım Gerekli',
    desc: 'Kullanıcı "Katıl" butonuna basarak kampanyaya dahil olur.',
  },
  {
    value: 'registered',
    label: 'Kayıtlı Üye',
    desc: 'Sitede hesabı olan herkes otomatik olarak hak kazanır.',
  },
  {
    value: 'corporate_contact',
    label: 'Kurumsal Teklif Formu',
    desc: 'Kullanıcı iletişim sayfasından kurumsal teklif formu doldurmak zorundadır.',
  },
] as const;

const RENK_TEMALARI = [
  { label: 'Turuncu', from: '#f97316', to: '#ea6c0a' },
  { label: 'Lacivert', from: '#1B3A6B', to: '#2d5282' },
  { label: 'Mor', from: '#7c3aed', to: '#6d28d9' },
  { label: 'Yeşil', from: '#059669', to: '#047857' },
  { label: 'Kırmızı', from: '#dc2626', to: '#b91c1c' },
  { label: 'Pembe', from: '#db2777', to: '#be185d' },
  { label: 'Koyu Gri', from: '#374151', to: '#1f2937' },
  { label: 'Turkuaz', from: '#0891b2', to: '#0e7490' },
];

const IKON_SEÇENEKLER = [
  { ad: 'Zap',       Bileşen: Zap,       etiket: 'Şimşek'   },
  { ad: 'Package',   Bileşen: Package,   etiket: 'Paket'    },
  { ad: 'Gift',      Bileşen: Gift,      etiket: 'Hediye'   },
  { ad: 'Star',      Bileşen: Star,      etiket: 'Yıldız'   },
  { ad: 'Tag',       Bileşen: Tag,       etiket: 'Etiket'   },
  { ad: 'Megaphone', Bileşen: Megaphone, etiket: 'Megafon'  },
];

const IKON_RENK_SEÇ = [
  { cls: 'text-yellow-300', etiket: 'Sarı'    },
  { cls: 'text-white',      etiket: 'Beyaz'   },
  { cls: 'text-green-300',  etiket: 'Yeşil'   },
  { cls: 'text-pink-300',   etiket: 'Pembe'   },
  { cls: 'text-amber-300',  etiket: 'Amber'   },
  { cls: 'text-sky-300',    etiket: 'Mavi'    },
];

const REQUIREMENT_LABELS: Record<string, string> = {
  join: 'Katılım Gerekli',
  registered: 'Kayıtlı Üye',
  corporate_contact: 'Kurumsal Form',
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
  hrefLabel: 'Ürünlere Git',
  badge: '',
  badgeBg: 'rgba(255,255,255,0.2)',
  couponCode: '',
  icon: 'Tag',
  iconClass: 'text-yellow-300',
  requirement: 'join',
  isActive: true,
  sortOrder: 0,
};

// ─── Canlı Önizleme ───────────────────────────────────────────────────────────

function KampanyaÖnizleme({ form }: { form: FormData }) {
  const ikonMeta = IKON_SEÇENEKLER.find(i => i.ad === form.icon);
  const İkon = ikonMeta?.Bileşen ?? Tag;

  return (
    <div className="sticky top-0 pt-2">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 text-center">
        Canlı Önizleme
      </p>
      <div
        className="relative rounded-2xl p-6 text-white overflow-hidden select-none"
        style={{ background: `linear-gradient(135deg, ${form.gradientFrom}, ${form.gradientTo})` }}
      >
        {/* Dekoratif daireler */}
        <div className="absolute rounded-full pointer-events-none opacity-10 bg-white"
          style={{ width: 160, height: 160, bottom: -32, right: -32 }} />
        <div className="absolute rounded-full pointer-events-none opacity-5 bg-white"
          style={{ width: 220, height: 220, bottom: -60, right: -60 }} />

        {/* Rozet */}
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
            <UserCheck size={10} /> Katıldınız
          </span>
        )}

        <div className="relative z-10">
          <div className="mb-3 mt-1">
            <İkon size={32} className={form.iconClass} />
          </div>
          <p className="text-sm font-semibold mb-1 text-white/70">
            {form.subtitle || 'Alt başlık'}
          </p>
          <h2 className="text-xl font-extrabold text-white mb-1">
            {form.title || 'Kampanya Başlığı'}
          </h2>
          <div className="text-3xl font-extrabold text-yellow-300 mb-3">
            {form.discount || '%00 İndirim'}
          </div>
          <p className="text-sm leading-relaxed mb-4 text-white/80 line-clamp-3">
            {form.description || 'Kampanya açıklaması burada görünecek.'}
          </p>

          {/* Kupon alanı önizlemesi */}
          {form.couponCode ? (
            <div className="flex items-center gap-2 bg-white/15 border border-white/30 rounded-xl px-3 py-2 mb-4">
              <div className="flex-1">
                <p className="text-white/60 text-xs">Kupon Kodu</p>
                <p className="text-white font-extrabold tracking-widest">{form.couponCode}</p>
              </div>
              <div className="bg-white/20 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg">Kopyala</div>
            </div>
          ) : form.requirement !== 'join' && (
            <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3 mb-4">
              <Lock size={16} className="text-white/50" />
              <p className="text-white/80 text-sm">Kupon kodu kilitli</p>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-white/65">
              <Clock size={12} />
              {form.endDate ? `Son: ${form.endDate}` : 'Bitiş tarihi'}
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 border border-white/30 text-white text-sm font-bold px-4 py-2 rounded-xl">
              {form.hrefLabel || 'Butona Git'}
              <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-2">
        Kampanya sayfasında tam olarak böyle görünecek
      </p>
    </div>
  );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────

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
      setHata('Kampanyalar yüklenemedi.');
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
    if (!form.title.trim()) { setHata('Kampanya başlığı zorunludur.'); return; }
    if (!form.discount.trim()) { setHata('İndirim oranı/miktarı zorunludur.'); return; }
    if (!form.description.trim()) { setHata('Açıklama zorunludur.'); return; }
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
      setHata(e instanceof Error ? e.message : 'Kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setKaydediliyor(false);
    }
  }

  async function sil(id: number) {
    if (!confirm('Bu kampanyayı silmek istediğinizden emin misiniz?')) return;
    setSiliniyorId(id);
    try {
      await api.admin.campaigns.delete(id);
      setKampanyalar(prev => prev.filter(c => c.id !== id));
      await revalidateAfterCampaignChange();
    } catch {
      setHata('Kampanya silinemedi.');
    } finally {
      setSiliniyorId(null);
    }
  }

  const seçiliTema = RENK_TEMALARI.find(
    t => t.from === form.gradientFrom && t.to === form.gradientTo
  );

  return (
    <div className="p-8">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kampanyalar</h1>
          <p className="text-gray-500 text-sm mt-1">{kampanyalar.length} kampanya</p>
        </div>
        <button
          onClick={yeniAç}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Yeni Kampanya Ekle
        </button>
      </div>

      {hata && !formAçık && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">{hata}</div>
      )}

      {/* Kampanya Listesi */}
      {yükleniyor ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-orange-500" size={32} />
        </div>
      ) : kampanyalar.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Megaphone size={48} className="mx-auto mb-3 text-gray-200" />
          <p className="text-lg font-medium">Henüz kampanya eklenmemiş</p>
          <p className="text-sm mt-1">Yukarıdaki butona tıklayarak ilk kampanyanızı oluşturun</p>
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
                      ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Aktif</span>
                      : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Pasif</span>}
                    <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                      {REQUIREMENT_LABELS[c.requirement] ?? c.requirement}
                    </span>
                    {c.hasCoupon && (
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Kupon kodu var</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 truncate">{c.subtitle}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Son tarih: {c.endDate || '—'}</p>
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

            {/* Modal Başlık */}
            <div className="flex items-center justify-between px-7 py-5 border-b shrink-0">
              <div>
                <h2 className="font-bold text-lg text-gray-900">
                  {düzenlenenId ? 'Kampanyayı Düzenle' : 'Yeni Kampanya Oluştur'}
                </h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Sol taraftaki bilgileri doldurun, sağda nasıl görüneceğini anında izleyin.
                </p>
              </div>
              <button onClick={() => setFormAçık(false)} className="text-gray-400 hover:text-gray-600">
                <X size={22} />
              </button>
            </div>

            {/* İçerik: Form + Önizleme */}
            <div className="flex flex-col lg:flex-row flex-1 min-h-0">

              {/* ── Sol: Form alanları ── */}
              <div className="flex-1 overflow-y-auto p-7 space-y-7 border-r border-gray-100">

                {/* 1. Temel Bilgiler */}
                <section>
                  <h3 className="text-sm font-bold text-[#1B3A6B] uppercase tracking-wider mb-4">
                    1 — Temel Bilgiler
                  </h3>
                  <div className="space-y-4">
                    <Alan label="Kampanya Başlığı" zorunlu açıklama="Örn: Yaz Güneş Kampanyası">
                      <input
                        className={giriş}
                        placeholder="Kampanya adını yazın..."
                        value={form.title}
                        onChange={e => f('title', e.target.value)}
                      />
                    </Alan>
                    <Alan label="Alt Başlık" açıklama="Başlığın hemen altında küçük yazı">
                      <input
                        className={giriş}
                        placeholder="Örn: Tüm Güneş Panellerinde"
                        value={form.subtitle}
                        onChange={e => f('subtitle', e.target.value)}
                      />
                    </Alan>
                    <Alan label="İndirim Miktarı / Oranı" zorunlu açıklama='Kartın ortasında büyük görünen metin'>
                      <input
                        className={giriş}
                        placeholder="Örn: %15 İndirim  ya da  50₺ İndirim"
                        value={form.discount}
                        onChange={e => f('discount', e.target.value)}
                      />
                    </Alan>
                    <Alan label="Kampanya Açıklaması" zorunlu açıklama="Kullanıcıya kampanyayı anlatan kısa metin">
                      <textarea
                        className={`${giriş} resize-none`}
                        rows={3}
                        placeholder="Bu kampanya kapsamında..."
                        value={form.description}
                        onChange={e => f('description', e.target.value)}
                      />
                    </Alan>
                    <Alan label="Bitiş Tarihi" açıklama="Tarih metni olarak yazın (sistem otomatik kontrol etmez)">
                      <input
                        className={giriş}
                        placeholder="Örn: 31 Temmuz 2026  ya da  Süresiz"
                        value={form.endDate}
                        onChange={e => f('endDate', e.target.value)}
                      />
                    </Alan>
                  </div>
                </section>

                {/* 2. Görünüm */}
                <section>
                  <h3 className="text-sm font-bold text-[#1B3A6B] uppercase tracking-wider mb-4">
                    2 — Görünüm
                  </h3>

                  {/* Renk Teması */}
                  <Alan label="Kart Renk Teması" açıklama="Kampanya kartının arka plan rengi">
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
                      <p className="text-xs text-gray-400 mt-1">Özel renk seçildi</p>
                    )}
                    <details className="mt-2">
                      <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
                        Özel renk gir (ileri düzey)
                      </summary>
                      <div className="flex gap-3 mt-2">
                        <label className="flex flex-col gap-1 flex-1 text-xs text-gray-500">
                          Başlangıç rengi
                          <input type="color" value={form.gradientFrom}
                            onChange={e => f('gradientFrom', e.target.value)}
                            className="w-full h-9 rounded-lg border cursor-pointer" />
                        </label>
                        <label className="flex flex-col gap-1 flex-1 text-xs text-gray-500">
                          Bitiş rengi
                          <input type="color" value={form.gradientTo}
                            onChange={e => f('gradientTo', e.target.value)}
                            className="w-full h-9 rounded-lg border cursor-pointer" />
                        </label>
                      </div>
                    </details>
                  </Alan>

                  {/* İkon */}
                  <Alan label="Kart İkonu" açıklama="Kartın sol üstünde görünen simge" className="mt-4">
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

                  {/* İkon rengi */}
                  <Alan label="İkon Rengi" className="mt-4">
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

                  {/* Rozet */}
                  <Alan label="Köşe Rozeti" açıklama="Kartın sağ üstündeki küçük etiket (boş bırakılabilir)" className="mt-4">
                    <input
                      className={giriş}
                      placeholder="Örn: EN POPÜLER  ya da  ÖZEL FIRSAT"
                      value={form.badge}
                      onChange={e => f('badge', e.target.value)}
                    />
                  </Alan>
                </section>

                {/* 3. Kampanya Kuralları */}
                <section>
                  <h3 className="text-sm font-bold text-[#1B3A6B] uppercase tracking-wider mb-4">
                    3 — Kampanya Kuralları
                  </h3>

                  <Alan label="Katılım Koşulu" zorunlu açıklama="Kullanıcı kupon koduna nasıl erişebilir?">
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

                  <Alan label="Kupon Kodu" açıklama="Boş bırakırsanız kupon kodu gösterilmez" className="mt-4">
                    <input
                      className={`${giriş} uppercase`}
                      placeholder="Örn: YAZ15  ya da  HOSGELDIN10"
                      value={form.couponCode}
                      onChange={e => f('couponCode', e.target.value.toUpperCase())}
                    />
                    {/* Kupon kodu uyuşmazlık uyarısı */}
                    {form.couponCode.trim() && (() => {
                      const kod = form.couponCode.trim().toUpperCase();
                      const eslesen = mevcutKuponlar.find(c => c.code === kod);
                      if (!eslesen) {
                        return (
                          <div className="mt-2 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 text-sm text-amber-800">
                            <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold">"{kod}" kodu Kupon Yönetimi'nde bulunamadı!</p>
                              <p className="text-xs text-amber-700 mt-0.5">
                                Kullanıcılar bu kodu sepette uygulamaya çalıştığında hata alır.
                                Önce <strong>Kupon Yönetimi</strong> sayfasından bu kodu oluşturun ve kampanyayla ilişkilendirin.
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
                              <p className="font-semibold">"{kod}" kuponu pasif veya süresi dolmuş!</p>
                              <p className="text-xs text-red-700 mt-0.5">
                                Kullanıcılar bu kuponu kullanamaz. Kupon Yönetimi'nden aktif hale getirin.
                              </p>
                            </div>
                          </div>
                        );
                      }
                      if (eslesen.campaignId && eslesen.campaignId !== düzenlenenId) {
                        return (
                          <div className="mt-2 flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5 text-sm text-blue-800">
                            <AlertTriangle size={15} className="text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-xs">Bu kupon başka bir kampanyaya bağlı. Kupon Yönetimi'nden kampanya ID'sini bu kampanyaya güncelleyin.</p>
                          </div>
                        );
                      }
                      return (
                        <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2 text-sm text-green-700">
                          <Check size={14} className="text-green-500 shrink-0" />
                          <p className="text-xs font-medium">Kupon bulundu ve geçerli ✓</p>
                        </div>
                      );
                    })()}
                  </Alan>
                </section>

                {/* 4. Bağlantı ve Diğer */}
                <section>
                  <h3 className="text-sm font-bold text-[#1B3A6B] uppercase tracking-wider mb-4">
                    4 — Buton ve Diğer
                  </h3>
                  <div className="space-y-4">
                    <Alan label="Buton Bağlantısı" açıklama="Butona tıklandığında nereye gitsin?">
                      <input
                        className={giriş}
                        placeholder="/urunler  ya da  /iletisim"
                        value={form.href}
                        onChange={e => f('href', e.target.value)}
                      />
                    </Alan>
                    <Alan label="Buton Yazısı">
                      <input
                        className={giriş}
                        placeholder="Örn: Ürünlere Git"
                        value={form.hrefLabel}
                        onChange={e => f('hrefLabel', e.target.value)}
                      />
                    </Alan>
                    <Alan label="Sıra Numarası" açıklama="Küçük numara → daha önce gösterilir">
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
                        <p className="text-sm font-medium text-gray-700">Kampanyayı Yayınla</p>
                        <p className="text-xs text-gray-400">İşaretsiz bırakırsanız kampanya gizli kalır</p>
                      </div>
                    </label>
                  </div>
                </section>
              </div>

              {/* ── Sağ: Canlı Önizleme ── */}
              <div className="w-full lg:w-96 p-7 bg-gray-50 overflow-y-auto">
                <KampanyaÖnizleme form={form} />
              </div>
            </div>

            {/* Alt bar */}
            {hata && (
              <div className="mx-7 mb-0 mt-0 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl">{hata}</div>
            )}
            <div className="flex justify-between items-center px-7 py-5 border-t bg-white rounded-b-2xl">
              <p className="text-xs text-gray-400">
                * ile işaretli alanlar zorunludur
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setFormAçık(false)}
                  className="px-5 py-2.5 rounded-xl border text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={kaydet}
                  disabled={kaydediliyor}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
                >
                  {kaydediliyor ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  {kaydediliyor ? 'Kaydediliyor...' : (düzenlenenId ? 'Değişiklikleri Kaydet' : 'Kampanyayı Oluştur')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Yardımcı bileşenler ──────────────────────────────────────────────────────

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
