import Link from 'next/link';

export const metadata = { title: 'Privacy Policy | Adalya Solar Energy' };

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

export default async function GizlilikPolitikasiPage() {
  const content = await fetchPolicy('policy.privacy');

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-orange-500">Home</Link>
        <span className="mx-1">/</span>
        <span className="text-orange-500 font-semibold">Privacy Policy</span>
      </div>

      <h1 className="text-3xl font-extrabold text-[#1B3A6B] mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: May 2026</p>

      {content ? (
        <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      ) : (
        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">1. General Information</h2>
            <p>As Adalya Solar Energy, we place great importance on the security of your personal data. This Privacy Policy explains how the personal data we collect during your visit to our website at <strong>adalyasolar.com</strong> and/or your use of our services is processed.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">2. Data We Collect</h2>
            <p>We may collect the following personal data:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>First and last name and contact information (email, phone)</li>
              <li>Delivery and billing addresses</li>
              <li>Order history and purchase preferences</li>
              <li>Device and browser information (IP address, cookies)</li>
              <li>Account login credentials (passwords are stored encrypted)</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">3. Purpose of Data Use</h2>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Order processing, delivery, and customer service</li>
              <li>Account creation and management</li>
              <li>Campaign and discount notifications (if consent is given)</li>
              <li>Fulfillment of legal obligations</li>
              <li>Ensuring site security</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">4. Data Sharing</h2>
            <p>Your personal data is not shared with third parties except for legal obligations, order delivery (shipping companies), and payment processing. Your data is never sold or rented under any circumstances.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">5. Cookies</h2>
            <p>Our site uses cookies to improve user experience. You can disable cookies in your browser settings; however, some features may not work properly in that case.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">6. Data Security</h2>
            <p>Your personal data is protected with SSL encryption technology and stored on secure servers. Passwords are stored as hashes and are never stored in plain text.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">7. Your Rights</h2>
            <p>Under applicable data protection law, you have the following rights:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Request access to your data and a copy</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of marketing communications</li>
            </ul>
            <p className="mt-2">For your requests, you can send an email to <strong>info@adalyasolar.com</strong>.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">8. Contact</h2>
            <p>For questions about this policy, you can visit our <Link href="/iletisim" className="text-orange-500 hover:underline">Contact</Link> page.</p>
          </section>
        </div>
      )}
    </main>
  );
}
