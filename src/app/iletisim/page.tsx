import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import ContactForm from './ContactForm';

export const metadata = { title: 'Contact | Adalya Solar Energy' };

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

export default async function ContactPage() {
  const info = await fetchSiteInfo();

  const phone = info['site.phone'] || '';
  const email = info['site.email'] || 'info@adalyasolar.com';
  const address = info['site.address'] || 'Antalya / Turkey';
  const phoneHref = phone ? `tel:+9${phone.replace(/\s/g, '')}` : '#';

  const contactItems = [
    { icon: Phone, title: 'Phone', lines: phone ? [phone] : ['—'] },
    { icon: Mail, title: 'Email', lines: [email] },
    { icon: MapPin, title: 'Address', lines: [address] },
    { icon: Clock, title: 'Working Hours', lines: ['Mon – Sat: 09:00 – 18:00', 'Sunday: Closed'] },
  ];

  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B3A6B] via-[#2d5282] to-[#1B3A6B] text-white py-16 px-4 text-center">
        <span className="inline-block bg-orange-500/20 border border-orange-400/30 text-orange-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
          Contact
        </span>
        <h1 className="text-4xl font-extrabold mb-3">Get in Touch with Us</h1>
        <p className="text-gray-300 max-w-xl mx-auto text-sm leading-relaxed">
          Contact us to receive a free analysis and price quote for your solar energy system,
          or to get support on any topic.
        </p>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-14 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Contact Info */}
        <div className="space-y-5">
          <h2 className="text-xl font-extrabold text-[#1B3A6B] mb-6">Contact Information</h2>
          {contactItems.map(({ icon: Icon, title, lines }) => (
            <div key={title} className="flex gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                <Icon size={18} className="text-orange-500" />
              </div>
              <div>
                <p className="font-bold text-[#1B3A6B] text-sm mb-1">{title}</p>
                {lines.map((line) => (
                  <p key={line} className="text-gray-500 text-sm">{line}</p>
                ))}
              </div>
            </div>
          ))}
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-52">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed&z=15`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Location"
            />
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <ContactForm />
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <section className="bg-orange-50 border-t border-orange-100 py-10 px-4 text-center">
        <p className="text-[#1B3A6B] font-semibold mb-1">Call us directly for a quick response</p>
        {phone ? (
          <a href={phoneHref} className="text-3xl font-extrabold text-orange-500 hover:text-orange-600 transition-colors">
            {phone}
          </a>
        ) : (
          <p className="text-3xl font-extrabold text-orange-500">—</p>
        )}
        <p className="text-gray-400 text-xs mt-1">Mon – Sat 09:00 – 18:00</p>
      </section>
    </main>
  );
}
