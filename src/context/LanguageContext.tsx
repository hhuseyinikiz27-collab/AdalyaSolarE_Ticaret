'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Lang = 'tr' | 'en';

const translations = {
  tr: {
    // Navbar
    home: 'Ana Sayfa',
    products: 'Ürünler',
    campaigns: 'Kampanyalar',
    bundles: 'Paketler',
    blog: 'Blog',
    calculator: 'Hesaplayıcı',
    contact: 'İletişim',
    login: 'Giriş Yap',
    register: 'Kayıt Ol',
    logout: 'Çıkış Yap',
    myAccount: 'Hesabım',
    cart: 'Sepet',
    search: 'Ürün ara...',
    notifications: 'Bildirimler',
    markAllRead: 'Tümünü okundu işaretle',
    noNotifications: 'Bildirim yok',
    // Home
    heroTitle: "Güneş Enerjisi ile Geleceği Aydınlat",
    heroSubtitle: 'En kaliteli güneş panelleri, bataryalar ve inverterler tek bir platformda. Uzman ekibimizle tasarruflu bir geleceğe adım at.',
    exploreProducts: 'Ürünleri Keşfet',
    freeConsultancy: 'Ücretsiz Danışmanlık',
    categories: 'Kategoriler',
    allProducts: 'Tümü',
    featuredProducts: 'Öne Çıkan Ürünler',
    newArrivals: 'Yeni Gelenler',
    viewAll: 'Tümünü Gör',
    recentlyViewed: 'Son Baktıklarınız',
    whyUs: 'Neden Adalya Solar?',
    freeCalcTitle: 'Size Kaç Panel Gerekiyor?',
    freeCalcSub: 'Elektrik faturanızı girin, sisteminizi anında hesaplayın.',
    calculate: 'Hesapla',
    // Product
    addToCart: 'Sepete Ekle',
    addedToCart: 'Sepete Eklendi!',
    addToFavorites: 'Favorilere Ekle',
    inFavorites: 'Favorilerde',
    share: 'Paylaş',
    inStock: 'Stokta var',
    outOfStock: 'Stokta yok',
    notifyWhenAvailable: 'Stok geldiğinde haber ver',
    notifyMe: 'Haberdar Et',
    description: 'Ürün Açıklaması',
    specs: 'Teknik Özellikler',
    reviews: 'Değerlendirmeler',
    qa: 'Soru & Cevap',
    documents: 'Teknik Belgeler',
    relatedProducts: 'Benzer Ürünler',
    // Cart
    myCart: 'Sepetim',
    emptyCart: 'Sepetiniz boş',
    total: 'Toplam',
    checkout: 'Ödemeye Geç',
    couponCode: 'Kupon Kodu',
    apply: 'Uygula',
    // Auth
    email: 'E-posta',
    password: 'Şifre',
    name: 'Ad Soyad',
    loginTitle: 'Giriş Yap',
    registerTitle: 'Hesap Oluştur',
    forgotPassword: 'Şifremi Unuttum',
    orContinueWith: 'veya devam et',
    // Common
    loading: 'Yükleniyor...',
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    edit: 'Düzenle',
    confirm: 'Onayla',
    close: 'Kapat',
    back: 'Geri',
    next: 'İleri',
    yes: 'Evet',
    no: 'Hayır',
    // Footer
    footerAbout: 'Adalya Solar Enerji, güneş enerjisi sistemleri konusunda Türkiye\'nin önde gelen e-ticaret platformudur.',
    allRights: 'Tüm hakları saklıdır.',
  },
  en: {
    // Navbar
    home: 'Home',
    products: 'Products',
    campaigns: 'Campaigns',
    bundles: 'Bundles',
    blog: 'Blog',
    calculator: 'Calculator',
    contact: 'Contact',
    login: 'Sign In',
    register: 'Sign Up',
    logout: 'Sign Out',
    myAccount: 'My Account',
    cart: 'Cart',
    search: 'Search products...',
    notifications: 'Notifications',
    markAllRead: 'Mark all as read',
    noNotifications: 'No notifications',
    // Home
    heroTitle: 'Light the Future with Solar Energy',
    heroSubtitle: 'The highest quality solar panels, batteries, and inverters on one platform. Take a step toward a sustainable future with our expert team.',
    exploreProducts: 'Explore Products',
    freeConsultancy: 'Free Consultation',
    categories: 'Categories',
    allProducts: 'All',
    featuredProducts: 'Featured Products',
    newArrivals: 'New Arrivals',
    viewAll: 'View All',
    recentlyViewed: 'Recently Viewed',
    whyUs: 'Why Adalya Solar?',
    freeCalcTitle: 'How Many Panels Do You Need?',
    freeCalcSub: 'Enter your electricity bill and calculate your system instantly.',
    calculate: 'Calculate',
    // Product
    addToCart: 'Add to Cart',
    addedToCart: 'Added to Cart!',
    addToFavorites: 'Add to Favorites',
    inFavorites: 'In Favorites',
    share: 'Share',
    inStock: 'In stock',
    outOfStock: 'Out of stock',
    notifyWhenAvailable: 'Notify me when available',
    notifyMe: 'Notify Me',
    description: 'Description',
    specs: 'Specifications',
    reviews: 'Reviews',
    qa: 'Q&A',
    documents: 'Documents',
    relatedProducts: 'Related Products',
    // Cart
    myCart: 'My Cart',
    emptyCart: 'Your cart is empty',
    total: 'Total',
    checkout: 'Proceed to Checkout',
    couponCode: 'Coupon Code',
    apply: 'Apply',
    // Auth
    email: 'Email',
    password: 'Password',
    name: 'Full Name',
    loginTitle: 'Sign In',
    registerTitle: 'Create Account',
    forgotPassword: 'Forgot Password',
    orContinueWith: 'or continue with',
    // Common
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    confirm: 'Confirm',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    yes: 'Yes',
    no: 'No',
    // Footer
    footerAbout: 'Adalya Solar Energy is Turkey\'s leading e-commerce platform for solar energy systems.',
    allRights: 'All rights reserved.',
  },
} as const;

export type TranslationKey = keyof typeof translations.tr;

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'tr',
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('tr');

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang | null;
    if (saved === 'en' || saved === 'tr') setLangState(saved);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem('lang', l);
    document.documentElement.lang = l;
  };

  const t = (key: TranslationKey): string => translations[lang][key] ?? translations.tr[key] ?? key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
