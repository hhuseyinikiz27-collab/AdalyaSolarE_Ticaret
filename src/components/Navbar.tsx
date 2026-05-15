'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, User, Menu, X, Search, ChevronDown, ChevronLeft, ChevronRight, Bell, Package, Tag, Info, ShieldAlert, Trash2, CheckCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { categories } from '@/data/products';
import Logo from '@/components/Logo';
import { api, ApiProduct, ApiCategory, ApiNotification } from '@/lib/api';
import { makeProductSlug } from '@/lib/productMapper';
import { useLang } from '@/context/LanguageContext';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5207';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { lang, setLang } = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<ApiProduct[]>([]);
  const [allProducts, setAllProducts] = useState<ApiProduct[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const navScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    api.products.getAll().then(setAllProducts).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = () => api.products.getAll().then(setAllProducts).catch(() => {});
    window.addEventListener('product-changed', handler);
    return () => window.removeEventListener('product-changed', handler);
  }, []);

  useEffect(() => {
    api.categories.getAll().then(setApiCategories).catch(() => {});
  }, [pathname]);

  useEffect(() => {
    const handler = () => api.categories.getAll().then(setApiCategories).catch(() => {});
    window.addEventListener('category-changed', handler);
    return () => window.removeEventListener('category-changed', handler);
  }, []);

  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) { setSuggestions([]); return; }
    const filtered = allProducts
      .filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
      .slice(0, 6);
    setSuggestions(filtered);
  }, [searchQuery, allProducts]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!user) { setNotifications([]); return; }
    api.notifications.getAll().then(setNotifications).catch(() => {});
    const interval = setInterval(() => {
      api.notifications.getAll().then(setNotifications).catch(() => {});
    }, 30_000);
    return () => clearInterval(interval);
  }, [user]);

  const handleNotifOpen = async () => {
    setNotifOpen((o) => !o);
    if (!notifOpen && unreadCount > 0) {
      await api.notifications.markAllRead().catch(() => {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  const handleDeleteNotif = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.notifications.delete(id).catch(() => {});
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const checkNavScroll = useCallback(() => {
    const el = navScrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    checkNavScroll();
  }, [apiCategories, checkNavScroll]);

  useEffect(() => {
    window.addEventListener('resize', checkNavScroll);
    return () => window.removeEventListener('resize', checkNavScroll);
  }, [checkNavScroll]);

  const scrollNav = (dir: 'left' | 'right') => {
    navScrollRef.current?.scrollBy({ left: dir === 'right' ? 260 : -260, behavior: 'smooth' });
    setTimeout(checkNavScroll, 320);
  };

  const handleSearch = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/urunler?ara=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setMobileOpen(false);
    }
  };

  const handleSuggestionClick = (id: number, name: string) => {
    router.push(`/urunler/${makeProductSlug(name, id)}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50">

      {/* Main navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Logo height={120} />
        </Link>

        {/* Search */}
        <div ref={searchRef} className="flex-1 max-w-xl mx-2 hidden md:block relative">
          <form onSubmit={handleSearch} className="flex w-full border-2 border-orange-400 rounded-lg overflow-hidden">
            <input
              type="text"
              placeholder="Ürün, marka veya kategori ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              className="flex-1 px-4 py-2 text-sm outline-none"
            />
            <button type="submit" className="bg-orange-500 hover:bg-orange-600 px-4 text-white transition-colors">
              <Search size={18} />
            </button>
          </form>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl mt-1 overflow-hidden z-50">
              {suggestions.map((p) => (
                <button
                  key={p.id}
                  onMouseDown={() => handleSuggestionClick(p.id, p.name)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-orange-50 text-left transition-colors border-b last:border-0"
                >
                  <Search size={14} className="text-gray-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.brand} · {p.price.toLocaleString('tr-TR')} ₺</p>
                  </div>
                </button>
              ))}
              <button
                onMouseDown={handleSearch as () => void}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 text-sm font-semibold transition-colors"
              >
                <Search size={14} />
                &ldquo;{searchQuery}&rdquo; için tüm sonuçları gör
              </button>
            </div>
          )}
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-3 ml-auto">
          {user ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className="flex items-center gap-1.5 text-[#1B3A6B] hover:text-orange-500 transition-colors"
              >
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl.startsWith('http') ? user.photoUrl : `${BASE_URL}${user.photoUrl}`}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                )}
                <span className="text-sm font-medium hidden lg:block">{user.name.split(' ')[0]}</span>
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-9 bg-white shadow-xl rounded-xl py-2 w-52 border border-gray-100 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                      <p className="text-xs font-semibold text-gray-400">Hesap</p>
                      <p className="text-sm font-bold text-[#1B3A6B] truncate">{user.name}</p>
                    </div>
                    <Link href="/hesabim" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors">Hesabım</Link>
                    <Link href="/hesabim?tab=siparisler" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-orange-50 hover:text-orange-600 transition-colors">Siparişlerim</Link>
                    {user.role === 'admin' && (
                      <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm text-orange-600 font-semibold hover:bg-orange-50 transition-colors">Admin Panel</Link>
                    )}
                    <hr className="my-1" />
                    <button onClick={() => { logout(); setUserMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">Çıkış Yap</button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/giris"
              className="hidden sm:flex items-center gap-1 text-[#1B3A6B] hover:text-orange-500 transition-colors"
            >
              <User size={20} />
              <span className="text-sm font-medium">Giriş</span>
            </Link>
          )}

          {user && (
            <div ref={notifRef} className="relative hidden sm:flex items-center">
              <button
                onClick={handleNotifOpen}
                className="relative flex items-center text-[#1B3A6B] hover:text-orange-500 transition-colors"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-9 bg-white shadow-2xl rounded-2xl w-80 border border-gray-100 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <p className="font-bold text-[#1B3A6B] text-sm">Bildirimler</p>
                    {notifications.length > 0 && (
                      <button
                        onClick={async () => {
                          await api.notifications.markAllRead().catch(() => {});
                          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
                        }}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-orange-500 transition-colors"
                      >
                        <CheckCheck size={12} /> Tümünü Oku
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 ? (
                    <div className="py-10 text-center text-gray-400 text-sm">
                      <Bell size={28} className="mx-auto mb-2 text-gray-200" />
                      Bildirim yok
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                      {notifications.map((n) => {
                        const Icon = n.type === 'order' ? Package : n.type === 'promo' ? Tag : n.type === 'security' ? ShieldAlert : Info;
                        return (
                          <div
                            key={n.id}
                            className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-orange-50/60' : ''}`}
                          >
                            <div className={`mt-0.5 shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
                              n.type === 'order' ? 'bg-blue-100 text-blue-600' :
                              n.type === 'promo' ? 'bg-orange-100 text-orange-600' :
                              n.type === 'security' ? 'bg-red-100 text-red-600' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              <Icon size={13} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold truncate ${!n.isRead ? 'text-[#1B3A6B]' : 'text-gray-700'}`}>{n.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                              <p className="text-[10px] text-gray-300 mt-1">{new Date(n.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <button
                              onClick={(e) => handleDeleteNotif(n.id, e)}
                              className="shrink-0 text-gray-300 hover:text-red-400 transition-colors mt-0.5"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Dil değiştirici */}
          <button
            onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
            className="hidden lg:flex items-center gap-1 text-xs font-bold border border-gray-200 hover:border-orange-400 rounded-lg px-2 py-1.5 text-gray-600 hover:text-orange-500 transition-colors"
            title={lang === 'tr' ? 'Switch to English' : 'Türkçeye geç'}
          >
            {lang === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
          </button>

          <Link href="/sepet" className="relative flex items-center gap-1 text-[#1B3A6B] hover:text-orange-500 transition-colors">
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
            <span className="text-sm font-medium hidden lg:block">Sepet</span>
          </Link>

          <button
            className="md:hidden text-[#1B3A6B]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Category nav */}
      <nav className="bg-orange-500 hidden md:flex items-center">
        {/* TÜM KATEGORİLER — sabit, dropdown overflow etkilenmesin */}
        <div
          className="relative shrink-0"
          onMouseEnter={() => setCategoryOpen(true)}
          onMouseLeave={() => setCategoryOpen(false)}
        >
          <button className="flex items-center gap-1.5 px-4 py-3.5 text-white font-semibold hover:bg-orange-600 transition-colors text-sm whitespace-nowrap">
            <Menu size={16} />
            TÜM KATEGORİLER
            <ChevronDown size={14} />
          </button>
          {categoryOpen && (
            <div className="absolute top-full left-0 bg-white shadow-xl rounded-b-lg w-64 z-50">
              {(apiCategories.length > 0 ? apiCategories : categories).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/urunler?kategori=${cat.slug}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 hover:text-orange-600 text-gray-700 border-b last:border-0"
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="font-medium">{cat.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Kaydırılabilir link alanı */}
        <div className="relative flex-1 flex items-center min-w-0">
          {canScrollLeft && (
            <button
              onClick={() => scrollNav('left')}
              className="absolute left-0 z-10 h-full px-1.5 bg-orange-600 hover:bg-orange-700 text-white flex items-center shrink-0"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <div
            ref={navScrollRef}
            onScroll={checkNavScroll}
            className="flex items-center overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ paddingLeft: canScrollLeft ? '2rem' : 0, paddingRight: canScrollRight ? '2rem' : 0 }}
          >
            <Link href="/urunler" className="px-3.5 py-3.5 text-white font-medium hover:bg-orange-600 transition-colors text-sm whitespace-nowrap">
              Tüm Ürünler
            </Link>
            {(apiCategories.length > 0 ? apiCategories : categories).map((cat) => (
              <Link
                key={cat.slug}
                href={`/urunler?kategori=${cat.slug}`}
                className="px-3.5 py-3.5 text-white font-medium hover:bg-orange-600 transition-colors text-sm whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
            <Link href="/kampanyalar" className="px-3.5 py-3.5 text-yellow-200 font-bold hover:bg-orange-600 transition-colors text-sm whitespace-nowrap">
              Kampanyalar
            </Link>
            <Link href="/bundlelar" className="px-3.5 py-3.5 text-sky-200 font-bold hover:bg-orange-600 transition-colors text-sm whitespace-nowrap">
              Paketler
            </Link>
            <Link href="/hesaplayici" className="px-3.5 py-3.5 text-green-300 font-bold hover:bg-orange-600 transition-colors text-sm whitespace-nowrap">
              Hesaplayıcı
            </Link>
            <div className="w-px h-5 bg-white/30 mx-1 shrink-0" />
            <Link href="/blog" className="px-3.5 py-3.5 text-white/90 font-medium hover:bg-orange-600 transition-colors text-sm whitespace-nowrap">
              Blog
            </Link>
            <Link href="/sss" className="px-3.5 py-3.5 text-white/90 font-medium hover:bg-orange-600 transition-colors text-sm whitespace-nowrap">
              SSS
            </Link>
            <Link href="/kurumsal" className="px-3.5 py-3.5 text-white/90 font-medium hover:bg-orange-600 transition-colors text-sm whitespace-nowrap">
              Kurumsal
            </Link>
            <Link href="/referanslar" className="px-3.5 py-3.5 text-white/90 font-medium hover:bg-orange-600 transition-colors text-sm whitespace-nowrap">
              Referanslar
            </Link>
            <Link href="/hakkimizda" className="px-3.5 py-3.5 text-white/90 font-medium hover:bg-orange-600 transition-colors text-sm whitespace-nowrap">
              Hakkımızda
            </Link>
            <Link href="/iletisim" className="px-3.5 py-3.5 text-white/90 font-medium hover:bg-orange-600 transition-colors text-sm whitespace-nowrap">
              İletişim
            </Link>
          </div>

          {canScrollRight && (
            <button
              onClick={() => scrollNav('right')}
              className="absolute right-0 z-10 h-full px-1.5 bg-orange-600 hover:bg-orange-700 text-white flex items-center shrink-0"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="p-3">
            <form onSubmit={handleSearch} className="flex border-2 border-orange-400 rounded-lg overflow-hidden mb-3">
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 text-sm outline-none"
              />
              <button type="submit" className="bg-orange-500 px-3 text-white">
                <Search size={16} />
              </button>
            </form>
          </div>
          {(apiCategories.length > 0 ? apiCategories : categories).map((cat) => (
            <Link
              key={cat.slug}
              href={`/urunler?kategori=${cat.slug}`}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 text-gray-700 border-b"
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </Link>
          ))}
          <Link href="/kampanyalar" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-orange-500 font-semibold border-b hover:bg-orange-50">
            Kampanyalar
          </Link>
          <Link href="/bundlelar" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sky-600 font-semibold border-b hover:bg-sky-50">
            Paketler
          </Link>
          <Link href="/hesaplayici" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-emerald-600 font-semibold border-b hover:bg-green-50">
            Enerji Hesaplayıcı
          </Link>
          <Link href="/blog" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 border-b hover:bg-orange-50">
            Blog
          </Link>
          <Link href="/sss" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 border-b hover:bg-orange-50">
            SSS
          </Link>
          <Link href="/kurumsal" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 border-b hover:bg-orange-50">
            Kurumsal
          </Link>
          <Link href="/referanslar" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 border-b hover:bg-orange-50">
            Referanslar
          </Link>
          <Link href="/hakkimizda" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 border-b hover:bg-orange-50">
            Hakkımızda
          </Link>
          <Link href="/iletisim" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 border-b hover:bg-orange-50">
            İletişim
          </Link>
          <div className="border-t">
            {user ? (
              <>
                <Link href="/hesabim" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50">
                  <User size={18} /> Hesabım
                </Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 w-full">
                  Çıkış Yap
                </button>
              </>
            ) : (
              <Link href="/giris" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-orange-50">
                <User size={18} /> Giriş Yap / Kayıt Ol
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
