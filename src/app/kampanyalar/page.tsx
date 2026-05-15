'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Tag, Clock, ArrowRight, Zap, Package, Star, Gift, Copy, Check,
  ShoppingCart, Lock, UserCheck, Megaphone, Loader2,
} from 'lucide-react';

function parseEndDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const iso = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const d = new Date(`${iso[1]}-${iso[2]}-${iso[3]}T23:59:59`);
    return isNaN(d.getTime()) ? null : d;
  }
  const dmy = dateStr.match(/^(\d{1,2})\.(\d{2})\.(\d{4})/);
  if (dmy) {
    const d = new Date(`${dmy[3]}-${dmy[2]}-${dmy[1].padStart(2, '0')}T23:59:59`);
    return isNaN(d.getTime()) ? null : d;
  }
  const TR: Record<string, string> = {
    ocak: '01', şubat: '02', mart: '03', nisan: '04', mayıs: '05', haziran: '06',
    temmuz: '07', ağustos: '08', eylül: '09', ekim: '10', kasım: '11', aralık: '12',
  };
  const tr = dateStr.match(/(\d{1,2})\s+(\S+)\s+(\d{4})/);
  if (tr) {
    const m = TR[tr[2].toLowerCase()];
    if (m) {
      const d = new Date(`${tr[3]}-${m}-${tr[1].padStart(2, '0')}T23:59:59`);
      return isNaN(d.getTime()) ? null : d;
    }
  }
  return null;
}

function CountdownTimer({ endDate }: { endDate: string }) {
  const target = parseEndDate(endDate);
  const [remaining, setRemaining] = useState<{ d: number; h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    if (!target) return;
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setRemaining({ d: 0, h: 0, m: 0, s: 0 }); return; }
      setRemaining({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!target || !remaining) return null;
  if (target.getTime() < Date.now()) return (
    <div className="flex items-center gap-1.5 text-xs text-white/50 mt-1">
      <Clock size={11} /> Campaign ended
    </div>
  );

  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <div className="flex items-center gap-2 mt-2">
      <Clock size={12} className="text-white/70 shrink-0" />
      <div className="flex items-center gap-1">
        {remaining.d > 0 && (
          <><span className="bg-white/20 text-white text-xs font-bold px-1.5 py-0.5 rounded">{remaining.d}d</span><span className="text-white/50 text-xs">:</span></>
        )}
        <span className="bg-white/20 text-white text-xs font-bold px-1.5 py-0.5 rounded">{pad(remaining.h)}</span>
        <span className="text-white/50 text-xs">:</span>
        <span className="bg-white/20 text-white text-xs font-bold px-1.5 py-0.5 rounded">{pad(remaining.m)}</span>
        <span className="text-white/50 text-xs">:</span>
        <span className="bg-white/20 text-white text-xs font-bold px-1.5 py-0.5 rounded tabular-nums">{pad(remaining.s)}</span>
      </div>
    </div>
  );
}
import { api, ApiCampaign } from '@/lib/api';
import { toProduct } from '@/lib/productMapper';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';

const ICON_MAP: Record<string, React.FC<{ size: number; className: string }>> = {
  Zap, Package, Star, Gift, Tag, Megaphone,
};

function getIcon(name: string) {
  return ICON_MAP[name] ?? Tag;
}

function CouponBox({ code, onUse }: { code: string; onUse: (code: string) => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2">
      <div className="flex-1">
        <p className="text-white/60 text-xs font-medium mb-0.5">Coupon Code</p>
        <p className="text-white font-extrabold text-base tracking-widest">{code}</p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUse(code); }}
          className="flex items-center gap-1 bg-white text-gray-800 hover:bg-orange-50 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <ShoppingCart size={12} />
          Apply to Cart
        </button>
      </div>
    </div>
  );
}

function LockedCoupon({
  campaign,
  isLoggedIn,
  joining,
  onJoin,
}: {
  campaign: ApiCampaign;
  isLoggedIn: boolean;
  joining: boolean;
  onJoin: (id: number) => void;
}) {
  const router = useRouter();

  if (campaign.requirement === 'registered') {
    return (
      <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
        <Gift size={18} className="text-white/50 shrink-0" />
        <div className="flex-1">
          <p className="text-white/70 text-xs">To see the coupon code</p>
          <p className="text-white font-bold text-sm">Sign up for free</p>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); router.push('/kayit'); }}
          className="bg-white text-gray-800 hover:bg-orange-50 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0"
        >
          Sign Up
        </button>
      </div>
    );
  }

  if (campaign.requirement === 'corporate_contact') {
    return (
      <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
        <Lock size={18} className="text-white/50 shrink-0" />
        <div className="flex-1">
          <p className="text-white/70 text-xs">To see the coupon code</p>
          <p className="text-white font-bold text-sm">Fill out the corporate quote form</p>
          <p className="text-white/50 text-xs mt-0.5">For bulk orders and special pricing</p>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); router.push('/kurumsal'); }}
          className="bg-white text-gray-800 hover:bg-orange-50 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0"
        >
          Get a Quote
        </button>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
        <Lock size={18} className="text-white/50 shrink-0" />
        <div className="flex-1">
          <p className="text-white/70 text-xs">To see the coupon code</p>
          <p className="text-white font-bold text-sm">Sign in and join the campaign</p>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); router.push('/giris'); }}
          className="bg-white text-gray-800 hover:bg-orange-50 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3">
      <Lock size={18} className="text-white/50 shrink-0" />
      <div className="flex-1">
        <p className="text-white/70 text-xs">To see the coupon code</p>
        <p className="text-white font-bold text-sm">Join the campaign</p>
      </div>
      <button
        disabled={joining}
        onClick={(e) => { e.preventDefault(); onJoin(campaign.id); }}
        className="flex items-center gap-1.5 bg-white text-gray-800 hover:bg-orange-50 disabled:opacity-60 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shrink-0"
      >
        {joining ? (
          <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <UserCheck size={13} />
        )}
        {joining ? 'Joining...' : 'Join'}
      </button>
    </div>
  );
}

export default function CampaignsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<ApiCampaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [campaignsError, setCampaignsError] = useState(false);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [appliedNotice, setAppliedNotice] = useState('');
  const [joinedIds, setJoinedIds] = useState<number[]>([]);
  const [eligibleCodes, setEligibleCodes] = useState<Record<string, string>>({});
  const [joiningId, setJoiningId] = useState<number | null>(null);
  const [joinedNotice, setJoinedNotice] = useState('');
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    const loadCampaigns = () =>
      api.campaigns.getPublic().then(setCampaigns).catch(() => setCampaignsError(true)).finally(() => setCampaignsLoading(false));
    loadCampaigns();
    const interval = setInterval(loadCampaigns, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadProducts = () =>
      api.products.getAll().then((all) => setDiscountedProducts(all.filter((p) => p.isFeatured).slice(0, 8).map(toProduct))).catch(() => {});
    loadProducts();
    const interval = setInterval(loadProducts, 60_000);
    window.addEventListener('product-changed', loadProducts);
    return () => { clearInterval(interval); window.removeEventListener('product-changed', loadProducts); };
  }, []);

  useEffect(() => {
    if (!user) {
      setJoinedIds([]);
      setEligibleCodes({});
      return;
    }
    api.campaigns.getMyJoins().then(setJoinedIds).catch(() => {});
    api.campaigns.getEligibleCodes().then(setEligibleCodes).catch(() => {});
  }, [user]);

  const handleUseCode = (code: string) => {
    localStorage.setItem('pendingCoupon', code);
    setAppliedNotice(code);
    setTimeout(() => router.push('/sepet'), 1200);
  };

  const handleJoin = async (campaignId: number) => {
    setJoiningId(campaignId);
    setJoinError('');
    try {
      await api.campaigns.join(campaignId);
      setJoinedIds((prev) => [...prev, campaignId]);
      api.campaigns.getEligibleCodes().then(setEligibleCodes).catch(() => {});
      const c = campaigns.find((x) => x.id === campaignId);
      setJoinedNotice(c?.title ?? 'You joined the campaign!');
      setTimeout(() => setJoinedNotice(''), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An error occurred.';
      setJoinError(msg);
      setTimeout(() => setJoinError(''), 4000);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">

      {/* Notices */}
      {appliedNotice && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white font-bold px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
          <Check size={18} />
          Code {appliedNotice} added to your cart! Redirecting...
        </div>
      )}
      {joinedNotice && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#1B3A6B] text-white font-bold px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2">
          <UserCheck size={18} />
          You joined {joinedNotice}! Your coupon code is now unlocked.
        </div>
      )}
      {joinError && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white font-bold px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2">
          <Lock size={18} />
          {joinError}
        </div>
      )}

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-orange-500">Home</Link>
        <span className="mx-1">/</span>
        <span className="text-orange-500 font-semibold">Campaigns</span>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 font-semibold px-4 py-1.5 rounded-full text-sm mb-4">
          <Tag size={14} />
          Special Deals
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B3A6B] mb-3">
          🔥 Current Campaigns
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
          Join a campaign, get your coupon code, and use it in your cart.
        </p>
      </div>

      {/* Campaign Cards */}
      {campaignsLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-orange-500" size={36} />
        </div>
      ) : campaignsError ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium text-red-500">Could not load campaigns. Please refresh the page.</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No active campaigns at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {campaigns.map((c) => {
            const Icon = getIcon(c.icon);
            const hasJoined = joinedIds.includes(c.id);
            const isJoining = joiningId === c.id;
            const code = eligibleCodes[String(c.id)] ?? null;

            return (
              <div
                key={c.id}
                className="relative rounded-2xl p-6 text-white overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${c.gradientFrom}, ${c.gradientTo})` }}
              >
                {/* Decorative blobs */}
                <div className="absolute rounded-full pointer-events-none" style={{ width: 160, height: 160, background: 'rgba(255,255,255,0.05)', bottom: -32, right: -32 }} />
                <div className="absolute rounded-full pointer-events-none" style={{ width: 220, height: 220, background: 'rgba(255,255,255,0.04)', bottom: -60, right: -60 }} />

                {/* Badge */}
                {c.badge && (
                  <span className="absolute top-4 right-4 text-white text-xs font-bold px-3 py-1 rounded-full" style={{ background: c.badgeBg }}>
                    {c.badge}
                  </span>
                )}
                {hasJoined && (
                  <span className="absolute top-4 left-4 bg-green-500/80 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <UserCheck size={11} /> Joined
                  </span>
                )}

                {/* Content */}
                <div className="relative z-10">
                  <div className="mb-3 mt-1">
                    <Icon size={32} className={c.iconClass} />
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {c.subtitle}
                  </p>
                  <h2 className="text-xl font-extrabold text-white mb-1">{c.title}</h2>
                  <div className="text-3xl font-extrabold text-yellow-300 mb-3">{c.discount}</div>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {c.description}
                  </p>

                  {/* Coupon area */}
                  {c.hasCoupon && (
                    <div className="mb-4">
                      {code ? (
                        <CouponBox code={code} onUse={handleUseCode} />
                      ) : (
                        <LockedCoupon
                          campaign={c}
                          isLoggedIn={!!user}
                          joining={isJoining}
                          onJoin={handleJoin}
                        />
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
                        <Clock size={13} />
                        End Date: {c.endDate}
                      </div>
                      <CountdownTimer endDate={c.endDate} />
                    </div>
                    <Link
                      href={c.href}
                      className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white border border-white/30 font-bold text-sm px-4 py-2 rounded-xl transition-colors"
                    >
                      {c.hrefLabel}
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Featured Products */}
      {discountedProducts.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-[#1B3A6B]">Featured Products</h2>
              <p className="text-gray-500 text-sm mt-1">You can use coupon codes on these products</p>
            </div>
            <Link href="/urunler" className="text-orange-500 hover:text-orange-600 flex items-center gap-1 text-sm font-semibold">
              All Products <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {discountedProducts.map((p) => (
              <Link
                key={p.id}
                href={`/urunler/${p.slug}`}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                <div className="relative h-40 bg-gray-50">
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    fill
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width:640px) 100vw, 25vw"
                  />
                  {p.isNew && (
                    <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      NEW
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs text-orange-500 font-semibold">{p.brand}</p>
                  <p className="text-sm font-semibold text-[#1B3A6B] line-clamp-2 mt-0.5">{p.name}</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="font-extrabold text-[#1B3A6B]">{p.price.toLocaleString('tr-TR')} ₺</span>
                    {p.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">{p.originalPrice.toLocaleString('tr-TR')} ₺</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* How to use coupon */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-8 mb-8">
        <h3 className="text-lg font-extrabold text-[#1B3A6B] mb-4 flex items-center gap-2">
          <Tag size={20} className="text-orange-500" />
          How to Use a Coupon Code?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Join the Campaign', desc: 'Click "Join" on the campaign card to unlock your code.' },
            { step: '2', title: 'Copy the Code', desc: 'Click "Copy" or press "Apply to Cart" directly.' },
            { step: '3', title: 'Apply the Code', desc: 'Paste the code in the coupon field on the cart page.' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-orange-500 text-white font-extrabold rounded-full flex items-center justify-center shrink-0 text-sm">
                {item.step}
              </div>
              <div>
                <p className="font-bold text-[#1B3A6B] text-sm">{item.title}</p>
                <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#1B3A6B] rounded-2xl p-8 text-center text-white">
        <h3 className="text-xl font-extrabold mb-2">
          Want a Custom Price Quote?
        </h3>
        <p className="text-white/70 text-sm mb-5">
          We offer pricing tailored to the size of your project.
          Contact our expert team right now.
        </p>
        <Link
          href="/kurumsal"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-xl transition-colors"
        >
          Bulk Order Form
          <ArrowRight size={16} />
        </Link>
      </div>

    </main>
  );
}
