'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2, Users, Zap, FileText, CheckCircle, Send,
  Phone, Mail, Plus, Trash2, ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5207';

async function fetchSiteInfo(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${BASE}/api/public/site-info`);
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

interface ProductLine {
  id: number;
  product: string;
  quantity: string;
  note: string;
}

const WHY_US = [
  { icon: Building2, title: 'Corporate Experience', desc: 'Over 500 corporate projects completed' },
  { icon: Users, title: 'Dedicated Account Manager', desc: 'A dedicated expert always by your side' },
  { icon: Zap, title: 'Fast Delivery', desc: 'Priority shipping on high-volume orders' },
  { icon: FileText, title: 'Invoice & Contract', desc: 'VAT invoice, e-invoice, and bulk contract options' },
];

export default function KurumsalPage() {
  const [siteInfo, setSiteInfo] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchSiteInfo().then(setSiteInfo);
  }, []);

  const [form, setForm] = useState({
    companyName: '',
    taxNumber: '',
    contactName: '',
    email: '',
    phone: '',
    deliveryAddress: '',
    note: '',
  });
  const [lines, setLines] = useState<ProductLine[]>([
    { id: 1, product: '', quantity: '', note: '' },
  ]);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const setLine = (id: number, field: keyof Omit<ProductLine, 'id'>, value: string) =>
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, [field]: value } : l)));

  const addLine = () =>
    setLines((prev) => [...prev, { id: Date.now(), product: '', quantity: '', note: '' }]);

  const removeLine = (id: number) =>
    setLines((prev) => prev.filter((l) => l.id !== id));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validLines = lines.filter((l) => l.product.trim());
    if (validLines.length === 0) {
      setError('Please add at least one product.');
      return;
    }
    setLoading(true);
    setError('');

    const productList = validLines
      .map((l) => `• ${l.product} — Qty: ${l.quantity || '?'}${l.note ? ` (${l.note})` : ''}`)
      .join('\n');

    const message = [
      `Company: ${form.companyName}`,
      `Tax No: ${form.taxNumber || 'Not specified'}`,
      `Contact: ${form.contactName}`,
      `Delivery Address: ${form.deliveryAddress || 'Not specified'}`,
      '',
      'Requested Products:',
      productList,
      form.note ? `\nAdditional Notes: ${form.note}` : '',
    ].join('\n');

    try {
      await api.contact.submit({
        name: form.contactName,
        email: form.email,
        phone: form.phone,
        subject: 'Corporate Bulk Order Request',
        message,
      });
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <main>
        <HeroSection />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#1B3A6B] mb-3">Your Request Has Been Received!</h2>
          <p className="text-gray-500 mb-2">
            Our corporate sales team will contact you within <strong>1 business day</strong>.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            For urgent requests, you can call us at <strong>{siteInfo['site.phone'] || '0850 346 78 90'}</strong>.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => {
                setSent(false);
                setForm({ companyName: '', taxNumber: '', contactName: '', email: '', phone: '', deliveryAddress: '', note: '' });
                setLines([{ id: 1, product: '', quantity: '', note: '' }]);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              Submit New Request
            </button>
            <Link href="/urunler" className="border-2 border-gray-200 hover:border-orange-400 text-gray-600 hover:text-orange-500 font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
              Product Catalog
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <HeroSection />

      {/* Why us */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {WHY_US.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Icon size={22} className="text-orange-500" />
              </div>
              <h3 className="font-bold text-[#1B3A6B] mb-1 text-sm">{title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div id="form" className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Sidebar info */}
          <div>
            <h2 className="text-xl font-extrabold text-[#1B3A6B] mb-4">How It Works?</h2>
            <ol className="space-y-4">
              {[
                'Fill out the form and list the products you need.',
                'Our expert team will call you within 1 business day.',
                'A price quote and delivery plan tailored to your company will be prepared.',
                'After agreement, a turnkey service is provided.',
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>

            <div className="mt-8 bg-[#1B3A6B] rounded-2xl p-5 text-white">
              <p className="font-bold mb-3">Direct Contact</p>
              {(siteInfo['site.phone'] || '0850 346 78 90') && (
                <a
                  href={`tel:+9${(siteInfo['site.phone'] || '0850 346 78 90').replace(/\s/g, '')}`}
                  className="flex items-center gap-2 text-orange-300 hover:text-orange-200 transition-colors text-sm mb-2"
                >
                  <Phone size={15} /> {siteInfo['site.phone'] || '0850 346 78 90'}
                </a>
              )}
              {(siteInfo['site.corporate_email'] || siteInfo['site.email'] || 'kurumsal@adalyasolar.com') && (
                <a
                  href={`mailto:${siteInfo['site.corporate_email'] || siteInfo['site.email'] || 'kurumsal@adalyasolar.com'}`}
                  className="flex items-center gap-2 text-orange-300 hover:text-orange-200 transition-colors text-sm"
                >
                  <Mail size={15} /> {siteInfo['site.corporate_email'] || siteInfo['site.email'] || 'kurumsal@adalyasolar.com'}
                </a>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-extrabold text-[#1B3A6B] mb-6">Bulk Order Request</h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Company info */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Company Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={form.companyName}
                      onChange={set('companyName')}
                      placeholder="Example Inc."
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Tax Number</label>
                    <input
                      type="text"
                      value={form.taxNumber}
                      onChange={set('taxNumber')}
                      placeholder="1234567890"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Contact Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Contact Person *</label>
                    <input
                      type="text"
                      required
                      value={form.contactName}
                      onChange={set('contactName')}
                      placeholder="Full Name"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Email *</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={set('email')}
                      placeholder="example@company.com"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 block mb-1.5">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={set('phone')}
                      placeholder="0532 000 00 00"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Product lines */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Requested Products</p>
                <div className="space-y-3">
                  {lines.map((line, idx) => (
                    <div key={line.id} className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-5">
                        {idx === 0 && <label className="text-xs font-semibold text-gray-500 block mb-1">Product / Model</label>}
                        <input
                          type="text"
                          value={line.product}
                          onChange={(e) => setLine(line.id, 'product', e.target.value)}
                          placeholder="e.g.: JA Solar 550W Panel"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors"
                        />
                      </div>
                      <div className="col-span-3">
                        {idx === 0 && <label className="text-xs font-semibold text-gray-500 block mb-1">Quantity</label>}
                        <input
                          type="text"
                          value={line.quantity}
                          onChange={(e) => setLine(line.id, 'quantity', e.target.value)}
                          placeholder="10 units"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors"
                        />
                      </div>
                      <div className="col-span-3">
                        {idx === 0 && <label className="text-xs font-semibold text-gray-500 block mb-1">Note</label>}
                        <input
                          type="text"
                          value={line.note}
                          onChange={(e) => setLine(line.id, 'note', e.target.value)}
                          placeholder="Optional"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors"
                        />
                      </div>
                      <div className={`col-span-1 flex justify-center ${idx === 0 ? 'mt-5' : ''}`}>
                        {lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLine(line.id)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addLine}
                  className="mt-3 flex items-center gap-1.5 text-orange-500 hover:text-orange-600 text-sm font-semibold transition-colors"
                >
                  <Plus size={16} />
                  Add Product
                </button>
              </div>

              {/* Delivery + Note */}
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Delivery Address</label>
                <input
                  type="text"
                  value={form.deliveryAddress}
                  onChange={set('deliveryAddress')}
                  placeholder="City, district or full address"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">Additional Notes</label>
                <textarea
                  rows={3}
                  value={form.note}
                  onChange={set('note')}
                  placeholder="Special requirements, preferred brands, delivery date, etc."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={17} />
                    Submit Quote Request
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-[#1B3A6B] via-[#2d5282] to-[#1B3A6B] text-white py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <span className="inline-block bg-orange-500/20 border border-orange-400/30 text-orange-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
          Corporate Solutions
        </span>
        <h1 className="text-4xl font-extrabold mb-3">Bulk Orders &amp; B2B Services</h1>
        <p className="text-gray-300 max-w-2xl mx-auto text-sm leading-relaxed mb-6">
          We offer special pricing, priority shipping, and turnkey project support
          for companies, construction firms, energy investors, and corporate clients.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2 shadow-lg"
          >
            Get a Quote Now <ChevronRight size={16} />
          </button>
          <Link href="/urunler" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
            Product Catalog
          </Link>
        </div>
      </div>
    </section>
  );
}
