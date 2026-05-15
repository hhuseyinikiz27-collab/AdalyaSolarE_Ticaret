import Link from 'next/link';

export const metadata = { title: 'Return Policy | Adalya Solar Energy' };

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

export default async function IadePolitikasiPage() {
  const content = await fetchPolicy('policy.returns');

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-orange-500">Home</Link>
        <span className="mx-1">/</span>
        <span className="text-orange-500 font-semibold">Return Policy</span>
      </div>

      <h1 className="text-3xl font-extrabold text-[#1B3A6B] mb-2">Return and Cancellation Policy</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: May 2026</p>

      {content ? (
        <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      ) : (
        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">1. Right of Withdrawal</h2>
            <p>Under consumer protection law, you may withdraw from the contract within <strong>14 days</strong> of the delivery date without stating any reason and without paying any penalty.</p>
            <p className="mt-2">To exercise your right of withdrawal, you can contact us by sending an email to <strong>info@adalyasolar.com</strong> or via our <Link href="/iletisim" className="text-orange-500 hover:underline">Contact</Link> page.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">2. Return Conditions</h2>
            <p>The following conditions must be met for the return to be accepted:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>The product must be in its original packaging, undamaged and complete.</li>
              <li>Invoice and delivery documents must be returned with the product.</li>
              <li>The product must not have been installed.</li>
              <li>There must be no user-caused damage, scratches, or breakage.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">3. Cases Where the Right of Withdrawal Cannot Be Used</h2>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Products specially manufactured or customized after ordering</li>
              <li>Systems that have been installed and activated</li>
              <li>Opened software licenses or digital content</li>
              <li>Products that cannot be returned due to hygiene conditions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">4. Return Process</h2>
            <ol className="list-decimal pl-5 space-y-2 mt-2">
              <li>Notify us of your return request by email; include your order number and reason for return.</li>
              <li>Our team will send you the shipping information within 1–2 business days.</li>
              <li>Send the product in its original packaging with the specified shipping company.</li>
              <li>After the product reaches us, an inspection will be conducted within 5 business days.</li>
              <li>For approved returns, the payment will be refunded within 7–14 business days via the original payment method.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">5. Return Shipping Cost</h2>
            <p>If the product is defective or incorrectly sent, the shipping cost is covered by us. For returns under the right of withdrawal, the shipping cost is borne by the buyer.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">6. Damaged or Defective Product</h2>
            <p>If you notice damage when receiving the product, prepare a report in the presence of the cargo officer and do not accept the product. Damage caused during shipping cannot be processed without a report. For hidden damage, you must notify us within <strong>48 hours</strong> of product delivery.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">7. Order Cancellation</h2>
            <p>If your order has not yet been shipped, you can cancel your order by sending an email to <strong>info@adalyasolar.com</strong>. For orders that have been shipped, the return process is applied. When cancellation is confirmed, the payment is refunded within 3–5 business days.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">8. Warranty</h2>
            <p>All products are covered by the manufacturer&apos;s warranty. Warranty periods are stated on the product page. For defects covered by warranty, you will be directed to the manufacturer&apos;s service center.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[#1B3A6B] mb-2">9. Contact</h2>
            <p>For your return and cancellation requests, you can send an email to <strong>info@adalyasolar.com</strong> or visit our <Link href="/iletisim" className="text-orange-500 hover:underline">Contact</Link> page.</p>
          </section>
        </div>
      )}
    </main>
  );
}
