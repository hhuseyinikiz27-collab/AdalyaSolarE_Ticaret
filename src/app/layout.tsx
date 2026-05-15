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
  title: 'Adalya Solar Energy | Solar Panel, Battery, Inverter',
  description:
    'Adalya Solar Energy — Solar panels, LiFePO4 batteries, hybrid inverters, and mounting accessories. Fast delivery across Turkey, expert technical support.',
  keywords: 'solar panel, battery, inverter, MPPT, photovoltaic, adalya solar, renewable energy',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
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
