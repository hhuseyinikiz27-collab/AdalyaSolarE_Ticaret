import Link from 'next/link';
import { ChevronDown, HelpCircle, ChevronRight } from 'lucide-react';

export const metadata = { title: 'Frequently Asked Questions | Adalya Solar Energy' };

const faqs = [
  {
    category: 'Installation & Projects',
    items: [
      {
        q: 'How long does solar energy system installation take?',
        a: 'Residential systems (5-10 kWp) are generally completed within 1-3 business days. Commercial and industrial projects may take 1-4 weeks depending on system size. TEDAŞ grid connection application approval varies between 15-45 days depending on the region.',
      },
      {
        q: 'How many solar panels do I need?',
        a: 'The number of panels depends on your monthly electricity consumption, roof orientation, and the number of sunshine hours in your region. You can calculate the estimated number of panels using our Energy Calculator. For an average household, 5-15 panels are generally sufficient.',
      },
      {
        q: 'Which roof orientations are suitable?',
        a: 'The most efficient orientation is south, followed by southwest and southeast. A 30-35 degree tilt facing south is ideal. East-west orientations can also be used but yield decreases by 10-20%. On flat roofs, mounting at the optimal angle is possible.',
      },
      {
        q: 'Can I install a solar energy system as a tenant?',
        a: 'Tenants can install a system with the written consent of the property owner. In case of moving, the system can be dismantled or a transfer agreement can be made with the property owner. Adalya Solar also provides contract support throughout this process.',
      },
    ],
  },
  {
    category: 'Technical Questions',
    items: [
      {
        q: 'Does the system work during a power outage?',
        a: 'Standard on-grid (grid-tied) systems automatically shut down during a power outage for safety reasons. If you want to use electricity during an outage as well, you should choose a battery-backed hybrid system.',
      },
      {
        q: 'How much does output drop in winter?',
        a: 'Solar panels only work with light, not heat. In winter, production drops because sunshine hours are reduced; however, panels actually work more efficiently in cold weather. Even in winter months in regions like Antalya, significant production still occurs.',
      },
      {
        q: 'Does the system work in low-light conditions (cloudy weather)?',
        a: 'Yes, modern solar panels also produce energy in diffuse light. However, output drops by 10-40% compared to bright sunlight. High-performance low-light panels (TOPCon, HJT technology) provide an advantage in these conditions.',
      },
      {
        q: 'How long do solar panels last?',
        a: 'Quality panels have a lifespan of 25-30 years and beyond. Most manufacturers offer a product warranty for the first 10 years and a power warranty for 25-30 years. The power warranty typically guarantees that at least 80% of original power will be maintained at year 25.',
      },
    ],
  },
  {
    category: 'Cost & Investment',
    items: [
      {
        q: 'How many years does the investment pay for itself?',
        a: 'In Turkey, residential systems pay for themselves in an average of 4-7 years. This period varies depending on the sunshine in your city, your consumption amount, and your electricity tariff. Our Energy Calculator helps you calculate your payback period.',
      },
      {
        q: 'Are there government incentives or loan options?',
        a: 'Under YEKDEM, surplus energy produced can be sold to the grid. KOSGEB energy efficiency supports are available for SMEs. Some banks offer special low-interest loans for solar energy projects. You can benefit from our free consultancy service for current incentives.',
      },
      {
        q: 'Should I get insurance?',
        a: 'Solar energy systems can be secured with an addendum to your home insurance or a separate installation insurance policy. We recommend getting insurance against risks such as storms, hail, and fire. Adalya Solar helps you submit the necessary documents to your insurance company after installation.',
      },
      {
        q: 'Is there a price advantage for bulk/corporate purchases?',
        a: 'Yes. Special pricing is applied for systems of 5 kWp and above and for corporate purchases. You can submit your request through our Bulk Order and B2B form and receive a project-specific quote from our expert team.',
      },
    ],
  },
  {
    category: 'Maintenance & Warranty',
    items: [
      {
        q: 'How often should panels be cleaned?',
        a: 'Cleaning 2-3 times per year is recommended. If dust, bird droppings, and leaves accumulate on the surface, production can drop by 10-25%. You can clean with lukewarm water and a soft cloth in the early morning or late afternoon. Avoid chemical cleaners.',
      },
      {
        q: 'Who maintains the system?',
        a: 'Adalya Solar offers an annual technical maintenance package for all systems it installs. Maintenance includes inverter updates, grounding measurements, cable inspection, and efficiency reports. A maintenance agreement can be added to your installation contract.',
      },
      {
        q: 'What does the warranty cover?',
        a: 'Product warranties vary by brand: Panels carry 10-15 years product warranty + 25-30 years power warranty; inverters 5-10 years. Workmanship and installation warranty is provided by Adalya Solar for 2 years. We provide all warranty documents in writing at the time of system delivery.',
      },
    ],
  },
];

export default function SSSPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B3A6B] via-[#2d5282] to-[#1B3A6B] text-white py-16 px-4 text-center">
        <span className="inline-block bg-orange-500/20 border border-orange-400/30 text-orange-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
          Help Center
        </span>
        <h1 className="text-4xl font-extrabold mb-3">Frequently Asked Questions</h1>
        <p className="text-gray-300 max-w-xl mx-auto text-sm leading-relaxed mb-6">
          Everything you are curious about regarding solar energy systems is here.
          Contact us for any questions you cannot find.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/iletisim"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2"
          >
            Ask a Question <ChevronRight size={15} />
          </Link>
          <Link
            href="/hesaplayici"
            className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
          >
            Calculate Savings
          </Link>
        </div>
      </section>

      {/* Category jump links */}
      <div className="bg-white border-b border-gray-100 sticky top-[72px] z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 flex gap-1 overflow-x-auto py-3">
          {faqs.map((section) => (
            <a
              key={section.category}
              href={`#${section.category}`}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold text-gray-500 hover:bg-orange-50 hover:text-orange-500 transition-colors"
            >
              {section.category}
            </a>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-14 space-y-14">
        {faqs.map((section) => (
          <section key={section.category} id={section.category}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                <HelpCircle size={18} className="text-orange-500" />
              </div>
              <h2 className="text-xl font-extrabold text-[#1B3A6B]">{section.category}</h2>
            </div>

            <div className="space-y-3">
              {section.items.map((item, i) => (
                <FaqItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </section>
        ))}

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#1B3A6B] to-[#2d5282] rounded-2xl p-8 text-white text-center">
          <h3 className="text-xl font-extrabold mb-2">Couldn&apos;t Find Your Question?</h3>
          <p className="text-gray-300 text-sm mb-6">
            Our expert team is ready to answer your questions weekdays from 09:00 - 18:00.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/iletisim"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              Contact Us
            </Link>
            <Link
              href="/kurumsal"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              Get a Corporate Quote
            </Link>
            <Link
              href="/blog"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
            >
              Blog Guides
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none select-none">
        <span className="font-semibold text-[#1B3A6B] text-sm leading-snug">{q}</span>
        <ChevronDown
          size={18}
          className="text-orange-400 shrink-0 group-open:rotate-180 transition-transform duration-200"
        />
      </summary>
      <div className="px-6 pb-5">
        <div className="border-t border-gray-100 pt-4">
          <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
        </div>
      </div>
    </details>
  );
}
