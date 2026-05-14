import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import Logo from '@/components/Logo';
import NewsletterForm from '@/components/NewsletterForm';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5207';

async function fetchSiteInfo(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${BASE}/api/public/site-info`, { next: { revalidate: 300 } });
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

async function fetchCategories(): Promise<{ name: string; slug: string }[]> {
  try {
    const res = await fetch(`${BASE}/api/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Footer() {
  const [info, categories] = await Promise.all([fetchSiteInfo(), fetchCategories()]);

  const phone = info['site.phone'] || '0850 346 78 90';
  const email = info['site.email'] || 'info@adalyasolar.com';
  const address = info['site.address'] || 'Atatürk Mah. Güneş Cad. No:24, Antalya / Türkiye';
  const facebook = info['social.facebook'] || 'https://www.facebook.com';
  const instagram = info['social.instagram'] || 'https://www.instagram.com';
  const youtube = info['social.youtube'] || 'https://www.youtube.com';

  const phoneHref = `tel:+9${phone.replace(/\s/g, '')}`;

  return (
    <footer className="bg-[#1B3A6B] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <div className="mb-4">
            <Logo height={120} inverted />
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            Güneş enerjisi çözümleri alanında Türkiye&apos;nin önde gelen tedarikçisi.
            Kaliteli ürünler, uzman ekip, güvenilir hizmet.
          </p>
          <div className="flex gap-3">
            <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors text-white font-bold text-sm">f</a>
            <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors text-white font-bold text-sm">ig</a>
            <a href={youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors text-white font-bold text-sm">yt</a>
          </div>
        </div>

        {/* Links */}
        <div>
          <h3 className="text-orange-400 font-bold mb-4 text-sm uppercase tracking-wider">Kurumsal</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            {[
              ['Hakkımızda', '/hakkimizda'],
              ['Blog', '/blog'],
              ['SSS', '/sss'],
              ['Kurumsal', '/kurumsal'],
              ['İletişim', '/iletisim'],
            ].map(([label, href]) => (
              <li key={href}>
                <Link href={href} className="hover:text-orange-400 transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-orange-400 font-bold mb-4 text-sm uppercase tracking-wider">Ürün Kategorileri</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link href={`/urunler?kategori=${cat.slug}`} className="hover:text-orange-400 transition-colors">
                  {cat.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/urunler" className="hover:text-orange-400 transition-colors font-medium">
                Tüm Ürünler →
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-orange-400 font-bold mb-4 text-sm uppercase tracking-wider">İletişim</h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="text-orange-400 shrink-0 mt-0.5" />
              <span>{address}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-orange-400 shrink-0" />
              <a href={phoneHref} className="hover:text-orange-400 transition-colors">{phone}</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-orange-400 shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-orange-400 transition-colors">{email}</a>
            </li>
          </ul>
          <div className="mt-4 p-3 bg-orange-500/20 rounded-lg border border-orange-500/30">
            <p className="text-xs text-orange-300 font-semibold">Çalışma Saatleri</p>
            <p className="text-xs text-gray-300 mt-1">Pazartesi - Cumartesi: 09:00 - 18:00</p>
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <div id="newsletter" className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center gap-6">
          <div className="shrink-0">
            <p className="font-bold text-white text-base">Kampanyalardan Haberdar Ol</p>
            <p className="text-sm text-gray-400 mt-0.5">Özel fırsatları kaçırma, e-postana gelsin</p>
          </div>
          <div className="flex-1 w-full max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-400">
          <p>© 2026 Adalya Solar Enerji. Tüm hakları saklıdır.</p>
          <div className="flex gap-4">
            <Link href="/gizlilik-politikasi" className="hover:text-orange-400 transition-colors">Gizlilik Politikası</Link>
            <Link href="/kullanim-kosullari" className="hover:text-orange-400 transition-colors">Kullanım Koşulları</Link>
            <Link href="/iade-politikasi" className="hover:text-orange-400 transition-colors">İade Politikası</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
