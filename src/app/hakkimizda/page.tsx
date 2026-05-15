import Link from 'next/link';
import { Shield, Award, Users, Zap, CheckCircle, ArrowRight } from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'Reliability',
    desc: 'Since the day we were founded, we have never compromised on the quality we promised our customers.',
  },
  {
    icon: Award,
    title: 'Quality',
    desc: 'We only include certified and tested products in our portfolio.',
  },
  {
    icon: Users,
    title: 'Expert Team',
    desc: 'Our specialist engineers and technicians are with you every step of the way.',
  },
  {
    icon: Zap,
    title: 'Sustainability',
    desc: 'We are building a clean and green future by expanding the use of solar energy.',
  },
];

const stats = [
  { value: '10,000+', label: 'Completed Installations' },
  { value: '15+', label: 'Years of Experience' },
  { value: '500+', label: 'Product Varieties' },
  { value: '98%', label: 'Customer Satisfaction' },
];

const team = [
  { name: 'Ahmet Kaya', role: 'General Manager', initial: 'AK' },
  { name: 'Mehmet Yıldız', role: 'Technical Director', initial: 'MY' },
  { name: 'Fatma Şahin', role: 'Sales Manager', initial: 'FS' },
  { name: 'Ali Demir', role: 'Chief Engineer', initial: 'AD' },
];

export default function AboutPage() {
  return (
    <main>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B3A6B] via-[#2d5282] to-[#1B3A6B] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-orange-500/20 border border-orange-400/30 text-orange-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            About Us
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight">
            15 Years of Experience<br />
            <span className="text-orange-400">in Solar Energy</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            As Adalya Solar Energy, we continue our determined march toward becoming one of
            Turkey&apos;s leading suppliers in the field of renewable energy solutions.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-orange-500 py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center text-white">
              <p className="text-3xl sm:text-4xl font-extrabold">{s.value}</p>
              <p className="text-sm text-orange-100 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1B3A6B] mb-4">Our Story</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Adalya Solar Energy set out in 2009 in Antalya with a small team.
              At a time when solar energy had not yet become widespread in Turkey, we
              stepped into the sector with our clean energy vision.
            </p>
            <p>
              Over the years, we have installed solar energy systems in thousands of homes and
              businesses, helping our customers achieve energy independence.
              Today, we serve all corners of Turkey with a team of over 50 experts.
            </p>
            <p>
              As an authorized distributor of the world&apos;s leading brands such as JA Solar,
              Longi, SMA, Growatt, Victron, and Pylontech, we continue to offer the most
              competitive prices without compromising on quality.
            </p>
          </div>
          <Link
            href="/iletisim"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl mt-6 transition-colors"
          >
            Contact Us
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {[
            { year: '2009', text: 'Founded in Antalya, first solar panel sales' },
            { year: '2013', text: 'First corporate projects, 1,000th installation completed' },
            { year: '2017', text: 'Lithium battery and hybrid system solutions added' },
            { year: '2020', text: '50+ dealer network established across Turkey' },
            { year: '2023', text: '10,000th installation celebrated, e-commerce platform launched' },
          ].map((item, i) => (
            <div key={item.year} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-extrabold text-xs shrink-0">
                  {item.year.slice(2)}
                </div>
                {i < 4 && <div className="w-0.5 h-full bg-orange-200 mt-1" />}
              </div>
              <div className="pb-4">
                <p className="font-bold text-[#1B3A6B] text-sm">{item.year}</p>
                <p className="text-gray-500 text-sm">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="bg-orange-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-extrabold text-[#1B3A6B] text-center mb-10">Our Values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-orange-500" />
                </div>
                <h3 className="font-bold text-[#1B3A6B] mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-extrabold text-[#1B3A6B] text-center mb-10">Our Team</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <div key={member.name} className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#1B3A6B] to-[#2d5282] rounded-full flex items-center justify-center mx-auto mb-3 text-white font-extrabold text-lg shadow-md">
                {member.initial}
              </div>
              <p className="font-bold text-[#1B3A6B] text-sm">{member.name}</p>
              <p className="text-xs text-orange-500 font-medium mt-0.5">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className="bg-[#1B3A6B] py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-extrabold text-white mb-6">Certificates &amp; Memberships</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['ISO 9001:2015', 'CE Certificate', 'TEDAŞ Approved', 'EPDK Licensed', 'RES Supported'].map((cert) => (
              <div key={cert} className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-semibold">
                <CheckCircle size={15} className="text-orange-400" />
                {cert}
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
