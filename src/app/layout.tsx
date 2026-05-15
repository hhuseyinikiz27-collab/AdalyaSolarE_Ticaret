import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { CompareProvider } from '@/context/CompareContext';
import { ToastProvider } from '@/context/ToastContext';
import Navbar from '@/components/Navbar';
import CompareBar from '@/components/CompareBar';
import Footer from '@/components/Footer';
import PageLoader from '@/components/PageLoader';
import WhatsAppButton from '@/components/WhatsAppButton';
import KvkkBanner from '@/components/KvkkBanner';
import TawkToWidget from '@/components/TawkToWidget';
import { LanguageProvider } from '@/context/LanguageContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Adalya Solar Enerji | Güneş Paneli, Batarya, İnverter',
  description:
    'Adalya Solar Enerji — Güneş panelleri, LiFePO4 bataryalar, hibrit inverterler ve montaj aksesuarları. Türkiye genelinde hızlı teslimat, uzman teknik destek.',
  keywords: 'güneş paneli, solar panel, batarya, inverter, MPPT, fotovoltaik, adalya solar',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className={`${inter.className} bg-white min-h-screen flex flex-col antialiased`}>
        <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <FavoritesProvider>
              <CartProvider>
                <CompareProvider>
                  <PageLoader />
                  <Navbar />
                  <div className="flex-1">{children}</div>
                  <Footer />
                  <CompareBar />
                  <WhatsAppButton />
                  <TawkToWidget />
                  <KvkkBanner />
                </CompareProvider>
              </CartProvider>
            </FavoritesProvider>
          </AuthProvider>
        </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
