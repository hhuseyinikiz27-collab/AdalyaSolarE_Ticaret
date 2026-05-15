import Link from 'next/link';
import { Shield, Award, Users, Zap, CheckCircle, ArrowRight } from 'lucide-react';

const values = [
  {
    icon: Shield,
    title: 'Güvenilirlik',
    desc: 'Kurulduğumuz günden bu yana müşterilerimize söz verdiğimiz kaliteden asla taviz vermedik.',
  },
  {
    icon: Award,
    title: 'Kalite',
    desc: 'Yalnızca sertifikalı ve test edilmiş ürünleri portföyümüze alıyoruz.',
  },
  {
    icon: Users,
    title: 'Uzman Ekip',
    desc: 'Alanında uzman mühendis ve teknisyenlerimizle her adımda yanınızdayız.',
  },
  {
    icon: Zap,
    title: 'Sürdürülebilirlik',
    desc: 'Güneş enerjisini yaygınlaştırarak temiz ve yeşil bir gelecek inşa ediyoruz.',
  },
];

const stats = [
  { value: '10.000+', label: 'Tamamlanan Kurulum' },
  { value: '15+', label: 'Yıllık Deneyim' },
  { value: '500+', label: 'Ürün Çeşidi' },
  { value: '%98', label: 'Müşteri Memnuniyeti' },
];

const team = [
  { name: 'Ahmet Kaya', role: 'Genel Müdür', initial: 'AK' },
  { name: 'Mehmet Yıldız', role: 'Teknik Direktör', initial: 'MY' },
  { name: 'Fatma Şahin', role: 'Satış Müdürü', initial: 'FŞ' },
  { name: 'Ali Demir', role: 'Baş Mühendis', initial: 'AD' },
];

export default function AboutPage() {
  return (
    <main>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1B3A6B] via-[#2d5282] to-[#1B3A6B] text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-orange-500/20 border border-orange-400/30 text-orange-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            Hakkımızda
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight">
            Güneş Enerjisinde<br />
            <span className="text-orange-400">15 Yıllık Deneyim</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
            Adalya Solar Enerji olarak, yenilenebilir enerji çözümleri alanında Türkiye&apos;nin
            önde gelen tedarikçilerinden biri olma yolundaki kararlı yürüyüşümüzü sürdürüyoruz.
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
          <h2 className="text-3xl font-extrabold text-[#1B3A6B] mb-4">Hikayemiz</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Adalya Solar Enerji, 2009 yılında Antalya&apos;da küçük bir ekiple yola çıktı.
              Güneş enerjisinin Türkiye&apos;de henüz yaygınlaşmadığı dönemde, temiz enerji
              vizyonumuzla sektöre adım attık.
            </p>
            <p>
              Yıllar içinde binlerce konut ve işyerine güneş enerjisi sistemi kurarak
              müşterilerimizin enerji bağımsızlığına kavuşmasına katkıda bulunduk.
              Bugün 50&apos;yi aşkın uzman kadromuzla Türkiye&apos;nin dört bir yanına hizmet veriyoruz.
            </p>
            <p>
              JA Solar, Longi, SMA, Growatt, Victron ve Pylontech gibi dünyanın önde gelen
              markalarının yetkili distribütörü olarak, kaliteden ödün vermeden en rekabetçi
              fiyatları sunmaya devam ediyoruz.
            </p>
          </div>
          <Link
            href="/iletisim"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-xl mt-6 transition-colors"
          >
            Bizimle İletişime Geç
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {[
            { year: '2009', text: "Antalya'da kuruluş, ilk güneş paneli satışları" },
            { year: '2013', text: 'İlk kurumsal projeler, 1000. kurulum tamamlandı' },
            { year: '2017', text: 'Lityum batarya ve hibrit sistem çözümleri eklendi' },
            { year: '2020', text: 'Türkiye genelinde 50+ bayi ağı kuruldu' },
            { year: '2023', text: '10.000. kurulum kutlandı, e-ticaret platformu açıldı' },
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
          <h2 className="text-3xl font-extrabold text-[#1B3A6B] text-center mb-10">Değerlerimiz</h2>
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
        <h2 className="text-3xl font-extrabold text-[#1B3A6B] text-center mb-10">Ekibimiz</h2>
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
          <h2 className="text-2xl font-extrabold text-white mb-6">Sertifikalar & Üyelikler</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['ISO 9001:2015', 'CE Sertifikası', 'TEDAŞ Onaylı', 'EPDK Lisanslı', 'YEK Destekli'].map((cert) => (
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
