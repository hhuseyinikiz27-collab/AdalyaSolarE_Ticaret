import Link from 'next/link';

export const metadata = { title: 'Terms of Use | Adalya Solar Energy' };

async function fetchPolicy(key: string): Promise<string | null> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5207';
    const res = await fetch(`${base}/api/public/settings/${key}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.value || null;
  } catch {
    return null;
  }
}

export default async function KullanimKosullariPage() {
  const content = await fetchPolicy('policy.terms');

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-orange-500">Home</Link>
        <span className="mx-1">/</span>
        <span className="text-orange-500 font-semibold">Terms of Use</span>
      </div>

      <h1 className="text-3xl font-extrabold text-[#1B3A6B] mb-2">Terms of Use</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: May 2026</p>

      {content ? (
        <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      ) : (
        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">1. General Provisions</h2>
            <p>These Terms of Use apply to all visitors and users of the website at <strong>adalyasolar.com</strong>. Continuing to use the site means you have accepted these terms. If you do not accept the terms, please stop using the site.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">2. Scope of Service</h2>
            <p>Adalya Solar Energy is an e-commerce platform that sells solar panels, inverters, installation equipment, and related products. Product descriptions, images, and price information on the site are for informational purposes and may be changed without prior notice.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">3. User Account</h2>
            <p>When registering on our platform, you must provide accurate and up-to-date information. You are responsible for the security of your account and the confidentiality of your password. If you detect unauthorized use of your account, immediately notify us at <strong>info@adalyasolar.com</strong>.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">4. Orders and Payment</h2>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>A sale is not considered complete until your order is confirmed.</li>
              <li>Payment is collected at the time of order completion; failed payments result in order cancellation.</li>
              <li>In case of stock shortage or technical error, the order is cancelled and the payment is refunded.</li>
              <li>Prices include VAT; shipping fees are stated separately.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">5. Delivery</h2>
            <p>Delivery times vary depending on the product and stock status, with an average of <strong>3–7 business days</strong>. If you are not present at your delivery address, the shipping company will notify you. The shipping company is responsible for delays.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">6. Intellectual Property</h2>
            <p>All content on the site (logos, images, text, design) belongs to Adalya Solar Energy. Unauthorized copying, reproduction, or distribution is prohibited and may be subject to legal action.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">7. Limitation of Liability</h2>
            <p>Adalya Solar Energy cannot be held responsible for technical failures, internet outages, or disruptions caused by third-party services. The site is provided &quot;as is&quot; and uninterrupted service is not guaranteed.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">8. Prohibited Uses</h2>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Opening an account using a false identity or information</li>
              <li>Attempting to gain unauthorized access to the system</li>
              <li>Actions that mislead or harm other users</li>
              <li>Generating site traffic with automated bots/scripts</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">9. Right to Modify</h2>
            <p>These terms may be updated without prior notice. The current terms are always published on this page. Continuing to use the site means you have accepted the current terms.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">10. Governing Law</h2>
            <p>These terms are subject to the laws of the Republic of Turkey. Antalya Courts and Enforcement Offices are authorized in disputes.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">11. Contact</h2>
            <p>For your questions, you can visit our <Link href="/iletisim" className="text-orange-500 hover:underline">Contact</Link> page or send an email to <strong>info@adalyasolar.com</strong>.</p>
          </section>
        </div>
      )}
    </main>
  );
}
