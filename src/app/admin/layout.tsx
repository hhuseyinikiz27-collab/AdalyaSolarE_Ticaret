'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Package, Users, ShoppingCart,
  MessageSquare, LogOut, ChevronRight, Tag, Ticket, Settings, Inbox, Megaphone, BookOpen,
  RotateCcw, HelpCircle, Layers, Gift, Wrench, FileText, MapPin as MapPinIcon,
  BarChart2, ClipboardList
} from 'lucide-react';
import { api } from '@/lib/api';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/urunler', label: 'Products', icon: Package },
  { href: '/admin/kategoriler', label: 'Categories', icon: Tag },
  { href: '/admin/kullanicilar', label: 'Users', icon: Users },
  { href: '/admin/siparisler', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/yorumlar', label: 'Reviews', icon: MessageSquare },
  { href: '/admin/mesajlar', label: 'Messages', icon: Inbox },
  { href: '/admin/kampanyalar', label: 'Campaigns', icon: Megaphone },
  { href: '/admin/kuponlar', label: 'Coupons', icon: Ticket },
  { href: '/admin/blog', label: 'Blog', icon: BookOpen },
  { href: '/admin/bundlelar', label: 'Bundle / Kit', icon: Layers },
  { href: '/admin/iadeler', label: 'Returns', icon: RotateCcw },
  { href: '/admin/sorular', label: 'Questions', icon: HelpCircle },
  { href: '/admin/hediye-kartlari', label: 'Gift Cards', icon: Gift },
  { href: '/admin/kurulum-talepleri', label: 'Installation Requests', icon: Wrench },
  { href: '/admin/teklif-talepleri', label: 'Quote Requests', icon: FileText },
  { href: '/admin/referanslar', label: 'Reference Projects', icon: MapPinIcon },
  { href: '/admin/analitik', label: 'Analytics', icon: BarChart2 },
  { href: '/admin/toplu-siparisler', label: 'Bulk Orders', icon: ClipboardList },
  { href: '/admin/ayarlar', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, initialized, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingReturns, setPendingReturns] = useState(0);
  const [pendingQuestions, setPendingQuestions] = useState(0);
  const [newOrders, setNewOrders] = useState(0);
  const [unansweredReviews, setUnansweredReviews] = useState(0);
  const [expiringCoupons, setExpiringCoupons] = useState(0);

  // Dismissed floor counts — kept in a ref for synchronous access.
  // Populated from localStorage inside the first useEffect (client-only, after hydration).
  const dismissedAt = useRef<Record<string, number>>({});

  const saveDismissed = useCallback(() => {
    try { localStorage.setItem('admin_badge_dismissed', JSON.stringify(dismissedAt.current)); }
    catch {}
  }, []);

  const applyBadge = useCallback((href: string, serverCount: number, setter: (n: number) => void) => {
    const floor = dismissedAt.current[href] ?? 0;
    if (floor > 0 && serverCount > 0 && serverCount <= floor) {
      setter(0);
    } else {
      if (floor > 0) { dismissedAt.current[href] = 0; saveDismissed(); }
      setter(serverCount);
    }
  }, [saveDismissed]);

  const refreshBadges = useCallback(() => {
    if (!user || user.role !== 'admin') return;
    api.admin.messages.getUnreadCount().then((r) => applyBadge('/admin/mesajlar', r.count, setUnreadMessages)).catch(() => {});
    api.admin.returns.getPendingCount().then((r) => applyBadge('/admin/iadeler', r.count, setPendingReturns)).catch(() => {});
    api.admin.questions.getPendingCount().then((r) => applyBadge('/admin/sorular', r.count, setPendingQuestions)).catch(() => {});
    api.admin.orders.getNewCount().then((r) => applyBadge('/admin/siparisler', r.count, setNewOrders)).catch(() => {});
    api.admin.reviews.getUnansweredCount().then((r) => applyBadge('/admin/yorumlar', r.count, setUnansweredReviews)).catch(() => {});
    api.admin.coupons.getExpiringCount().then((r) => applyBadge('/admin/kuponlar', r.count, setExpiringCoupons)).catch(() => {});
  }, [user, applyBadge]);

  // Read localStorage first, then fetch badges — order guaranteed
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('admin_badge_dismissed') || '{}');
      dismissedAt.current = saved;
    } catch {}
    refreshBadges();
  }, [refreshBadges]);

  // Poll every 30 seconds
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const interval = setInterval(refreshBadges, 30_000);
    return () => clearInterval(interval);
  }, [user, refreshBadges]);

  const clearBadge = (href: string) => {
    if (href === '/admin/mesajlar')   { dismissedAt.current[href] = unreadMessages;    setUnreadMessages(0); }
    if (href === '/admin/iadeler')    { dismissedAt.current[href] = pendingReturns;    setPendingReturns(0); }
    if (href === '/admin/sorular')    { dismissedAt.current[href] = pendingQuestions;  setPendingQuestions(0); }
    if (href === '/admin/siparisler') { dismissedAt.current[href] = newOrders;         setNewOrders(0); }
    if (href === '/admin/yorumlar')   { dismissedAt.current[href] = unansweredReviews; setUnansweredReviews(0); }
    if (href === '/admin/kuponlar')   { dismissedAt.current[href] = expiringCoupons;   setExpiringCoupons(0); }
    saveDismissed();
  };

  // Custom events (immediate decrement on action)
  useEffect(() => {
    const onMsgRead = () => setUnreadMessages((p) => Math.max(0, p - 1));
    const onReturnDone = () => setPendingReturns((p) => Math.max(0, p - 1));
    const onQuestionAnswered = () => setPendingQuestions((p) => Math.max(0, p - 1));
    const onOrderUpdated = () => setNewOrders((p) => Math.max(0, p - 1));
    const onReviewReplied = () => setUnansweredReviews((p) => Math.max(0, p - 1));
    window.addEventListener('message-read', onMsgRead);
    window.addEventListener('return-processed', onReturnDone);
    window.addEventListener('question-answered', onQuestionAnswered);
    window.addEventListener('order-status-updated', onOrderUpdated);
    window.addEventListener('review-replied', onReviewReplied);
    return () => {
      window.removeEventListener('message-read', onMsgRead);
      window.removeEventListener('return-processed', onReturnDone);
      window.removeEventListener('question-answered', onQuestionAnswered);
      window.removeEventListener('order-status-updated', onOrderUpdated);
      window.removeEventListener('review-replied', onReviewReplied);
    };
  }, []);

  useEffect(() => {
    if (!initialized) return;
    if (!user || user.role !== 'admin') router.replace('/');
  }, [user, initialized, router]);

  if (!initialized || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1B3A6B] text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Admin Panel</p>
          <p className="font-bold text-lg">Adalya Solar</p>
          <p className="text-xs text-white/60 mt-1">{user.email}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            const redBadge =
              href === '/admin/mesajlar'   && unreadMessages > 0   ? unreadMessages   :
              href === '/admin/iadeler'    && pendingReturns > 0   ? pendingReturns   :
              href === '/admin/sorular'    && pendingQuestions > 0 ? pendingQuestions :
              href === '/admin/siparisler' && newOrders > 0        ? newOrders        :
              href === '/admin/yorumlar'   && unansweredReviews > 0 ? unansweredReviews :
              null;
            const amberBadge =
              href === '/admin/kuponlar' && expiringCoupons > 0 ? expiringCoupons : null;
            const badge = redBadge ?? amberBadge;
            const badgeColor = amberBadge ? 'bg-amber-500' : 'bg-red-500';
            return (
              <Link
                key={href}
                href={href}
                onClick={() => clearBadge(href)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? 'bg-orange-500 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {label}
                {badge && (
                  <span className={`ml-auto ${badgeColor} text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0`}>
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
                {active && !badge && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => { logout(); router.replace('/'); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
