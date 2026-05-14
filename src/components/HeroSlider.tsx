'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function Slide1Bg() {
  return (
    <svg viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="s1sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d1f3d" /><stop offset="50%" stopColor="#1b3a6e" /><stop offset="100%" stopColor="#0a1428" />
        </linearGradient>
        <radialGradient id="s1sun" cx="72%" cy="22%" r="18%">
          <stop offset="0%" stopColor="#FFD166" stopOpacity="1" /><stop offset="40%" stopColor="#F7941D" stopOpacity=".5" /><stop offset="100%" stopColor="#F7941D" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#s1sky)" />
      <circle cx="1040" cy="200" r="160" fill="url(#s1sun)" />
      <circle cx="1040" cy="200" r="55" fill="#FFD166" opacity=".8" />
      <circle cx="1040" cy="200" r="36" fill="#FFF9C4" />
      <g opacity=".45" stroke="#FFD166" strokeWidth="2.5">
        <line x1="1040" y1="120" x2="1040" y2="96" /><line x1="1040" y1="280" x2="1040" y2="304" />
        <line x1="960" y1="200" x2="936" y2="200" /><line x1="1120" y1="200" x2="1144" y2="200" />
        <line x1="983" y1="143" x2="966" y2="126" /><line x1="1097" y1="257" x2="1114" y2="274" />
        <line x1="1097" y1="143" x2="1114" y2="126" /><line x1="983" y1="257" x2="966" y2="274" />
      </g>
      <polygon points="0,580 180,320 360,550 560,280 780,520 1000,300 1200,480 1440,340 1440,900 0,900" fill="#0a1428" opacity=".85" />
      <g opacity=".6" fill="#0d1f4a">
        <polygon points="80,580 110,460 140,580" /><polygon points="86,545 110,430 134,545" fill="#1a3575" />
        <polygon points="190,570 225,440 260,570" /><polygon points="197,535 225,408 253,535" fill="#1a3575" />
        <polygon points="310,575 350,438 390,575" /><polygon points="318,540 350,405 382,540" fill="#1a3575" />
        <polygon points="1100,570 1140,435 1180,570" /><polygon points="1108,535 1140,402 1172,535" fill="#1a3575" />
        <polygon points="1230,580 1265,455 1300,580" /><polygon points="1237,548 1265,422 1293,548" fill="#1a3575" />
      </g>
      <rect x="0" y="630" width="1440" height="270" fill="#081020" />
      <g>
        <g transform="translate(130,590)">
          <rect width="108" height="65" rx="4" fill="#1B2D5E" stroke="#FFB347" strokeWidth="1.8" />
          <line x1="0" y1="22" x2="108" y2="22" stroke="#FFB347" strokeWidth=".9" opacity=".5" />
          <line x1="0" y1="43" x2="108" y2="43" stroke="#FFB347" strokeWidth=".9" opacity=".5" />
          <line x1="36" y1="0" x2="36" y2="65" stroke="#FFB347" strokeWidth=".9" opacity=".5" />
          <line x1="72" y1="0" x2="72" y2="65" stroke="#FFB347" strokeWidth=".9" opacity=".5" />
          <line x1="26" y1="65" x2="14" y2="100" stroke="#2a3a6a" strokeWidth="4" />
          <line x1="82" y1="65" x2="94" y2="100" stroke="#2a3a6a" strokeWidth="4" />
        </g>
        <g transform="translate(265,578)">
          <rect width="108" height="65" rx="4" fill="#1B2D5E" stroke="#FFB347" strokeWidth="1.8" />
          <line x1="0" y1="22" x2="108" y2="22" stroke="#FFB347" strokeWidth=".9" opacity=".5" />
          <line x1="0" y1="43" x2="108" y2="43" stroke="#FFB347" strokeWidth=".9" opacity=".5" />
          <line x1="36" y1="0" x2="36" y2="65" stroke="#FFB347" strokeWidth=".9" opacity=".5" />
          <line x1="72" y1="0" x2="72" y2="65" stroke="#FFB347" strokeWidth=".9" opacity=".5" />
          <line x1="26" y1="65" x2="14" y2="100" stroke="#2a3a6a" strokeWidth="4" />
          <line x1="82" y1="65" x2="94" y2="100" stroke="#2a3a6a" strokeWidth="4" />
        </g>
        <g transform="translate(400,565)">
          <rect width="108" height="65" rx="4" fill="#1B2D5E" stroke="#FFB347" strokeWidth="1.8" />
          <line x1="0" y1="22" x2="108" y2="22" stroke="#FFB347" strokeWidth=".9" opacity=".5" />
          <line x1="0" y1="43" x2="108" y2="43" stroke="#FFB347" strokeWidth=".9" opacity=".5" />
          <line x1="36" y1="0" x2="36" y2="65" stroke="#FFB347" strokeWidth=".9" opacity=".5" />
          <line x1="72" y1="0" x2="72" y2="65" stroke="#FFB347" strokeWidth=".9" opacity=".5" />
          <line x1="26" y1="65" x2="14" y2="100" stroke="#2a3a6a" strokeWidth="4" />
          <line x1="82" y1="65" x2="94" y2="100" stroke="#2a3a6a" strokeWidth="4" />
        </g>
      </g>
      <g fill="#060e22">
        <polygon points="700,900 750,680 800,900" /><polygon points="708,825 750,648 792,825" fill="#0d1f45" />
        <polygon points="850,900 910,660 970,900" /><polygon points="860,840 910,626 960,840" fill="#0d1f45" />
        <polygon points="1020,900 1075,690 1130,900" /><polygon points="1028,840 1075,658 1122,840" fill="#0d1f45" />
        <polygon points="1220,900 1265,710 1310,900" />
      </g>
      <circle cx="184" cy="618" r="5" fill="#FFB347"><animate attributeName="opacity" values="1;.2;1" dur="2.2s" repeatCount="indefinite" /></circle>
      <circle cx="319" cy="606" r="5" fill="#FFB347"><animate attributeName="opacity" values=".2;1;.2" dur="2s" repeatCount="indefinite" /></circle>
      <circle cx="454" cy="592" r="5" fill="#FFB347"><animate attributeName="opacity" values="1;.2;1" dur="1.8s" begin=".4s" repeatCount="indefinite" /></circle>
    </svg>
  );
}

function Slide2Bg() {
  return (
    <svg viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="s2sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1a3e" /><stop offset="50%" stopColor="#1b3a6e" /><stop offset="100%" stopColor="#0a1428" />
        </linearGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#s2sky)" />
      <g fill="rgba(255,255,255,.18)">
        <ellipse cx="200" cy="140" rx="90" ry="38" /><ellipse cx="260" cy="132" rx="75" ry="32" /><ellipse cx="150" cy="155" rx="70" ry="30" />
        <ellipse cx="700" cy="100" rx="80" ry="34" /><ellipse cx="770" cy="90" rx="65" ry="28" /><ellipse cx="650" cy="112" rx="65" ry="28" />
        <ellipse cx="1200" cy="120" rx="75" ry="32" /><ellipse cx="1260" cy="110" rx="60" ry="26" />
      </g>
      <ellipse cx="720" cy="800" rx="900" ry="200" fill="#0d1f45" />
      <rect x="0" y="720" width="1440" height="180" fill="#0d1f45" />
      <ellipse cx="200" cy="800" rx="350" ry="120" fill="#1B2D5E" opacity=".75" />
      <ellipse cx="1240" cy="810" rx="320" ry="110" fill="#1B2D5E" opacity=".75" />
      <g transform="translate(720,0)">
        <line x1="0" y1="780" x2="0" y2="260" stroke="#e2e8f0" strokeWidth="10" strokeLinecap="round" />
        <circle cx="0" cy="260" r="12" fill="#cbd5e1" />
        <path d="M0,260 Q-24,170 -14,80 Q0,60 14,80 Q24,170 0,260" fill="rgba(255,255,255,.88)">
          <animateTransform attributeName="transform" type="rotate" from="0 0 260" to="360 0 260" dur="7s" repeatCount="indefinite" />
        </path>
      </g>
      <g transform="translate(330,100)">
        <line x1="0" y1="680" x2="0" y2="340" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
        <circle cx="0" cy="340" r="7" fill="#cbd5e1" />
        <path d="M0,340 Q-14,270 -8,200 Q0,184 8,200 Q14,270 0,340" fill="rgba(255,255,255,.82)">
          <animateTransform attributeName="transform" type="rotate" from="120 0 340" to="480 0 340" dur="5.5s" repeatCount="indefinite" />
        </path>
      </g>
      <g transform="translate(1110,80)">
        <line x1="0" y1="700" x2="0" y2="360" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
        <circle cx="0" cy="360" r="7" fill="#cbd5e1" />
        <path d="M0,360 Q-14,290 -8,220 Q0,204 8,220 Q14,290 0,360" fill="rgba(255,255,255,.82)">
          <animateTransform attributeName="transform" type="rotate" from="240 0 360" to="600 0 360" dur="6.5s" repeatCount="indefinite" />
        </path>
      </g>
      <g fill="rgba(255,255,255,.4)">
        <circle cx="400" cy="55" r="2" /><circle cx="500" cy="78" r="1.5" /><circle cx="900" cy="40" r="2" />
        <circle cx="1000" cy="65" r="1.5" /><circle cx="300" cy="38" r="1.5" />
      </g>
    </svg>
  );
}

function Slide3Bg() {
  return (
    <svg viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="s3sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d1f3d" /><stop offset="60%" stopColor="#1b3a6e" /><stop offset="100%" stopColor="#0a1428" />
        </linearGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#s3sky)" />
      <circle cx="1100" cy="130" r="70" fill="#FFD166" opacity=".2" />
      <circle cx="1100" cy="130" r="44" fill="#FFD166" opacity=".5" />
      <circle cx="1100" cy="130" r="28" fill="#FFF9C4" opacity=".9" />
      <g fill="#081020" opacity=".6">
        <rect x="60" y="500" width="80" height="380" /><rect x="155" y="430" width="65" height="450" />
        <rect x="235" y="470" width="58" height="410" /><rect x="310" y="510" width="70" height="370" />
        <rect x="1030" y="480" width="75" height="400" /><rect x="1118" y="440" width="68" height="440" />
        <rect x="1200" y="500" width="80" height="380" /><rect x="1294" y="455" width="65" height="425" />
      </g>
      <g fill="rgba(255,179,71,.3)">
        <rect x="70" y="515" width="10" height="8" rx="1" /><rect x="90" y="515" width="10" height="8" rx="1" />
        <rect x="70" y="534" width="10" height="8" rx="1" /><rect x="90" y="534" width="10" height="8" rx="1" />
        <rect x="163" y="445" width="10" height="8" rx="1" /><rect x="183" y="445" width="10" height="8" rx="1" />
        <rect x="1040" y="494" width="10" height="8" rx="1" /><rect x="1060" y="494" width="10" height="8" rx="1" />
      </g>
      <g transform="translate(570,320)">
        <rect x="0" y="110" width="300" height="220" rx="4" fill="#1B2D5E" />
        <polygon points="-24,110 150,0 324,110" fill="#0d1f3d" />
        <g fill="none" stroke="#FFB347" strokeWidth="1.8">
          <rect x="30" y="30" width="52" height="34" rx="2" fill="#1B2D5E" /><rect x="92" y="22" width="52" height="34" rx="2" fill="#1B2D5E" />
          <rect x="156" y="18" width="52" height="34" rx="2" fill="#1B2D5E" /><rect x="218" y="24" width="52" height="34" rx="2" fill="#1B2D5E" />
        </g>
        <rect x="22" y="138" width="70" height="55" rx="3" fill="#0d1f3d" stroke="rgba(255,179,71,.4)" strokeWidth="1.5" />
        <rect x="210" y="138" width="70" height="55" rx="3" fill="#0d1f3d" stroke="rgba(255,179,71,.4)" strokeWidth="1.5" />
        <rect x="120" y="245" width="60" height="85" rx="4" fill="#081020" />
      </g>
      <path d="M720,350 Q850,260 1040,480" fill="none" stroke="#FFB347" strokeWidth="1.8" strokeDasharray="8,5" opacity=".5">
        <animate attributeName="stroke-dashoffset" from="0" to="-26" dur="1.6s" repeatCount="indefinite" />
      </path>
      <path d="M720,350 Q600,270 400,470" fill="none" stroke="#FFB347" strokeWidth="1.8" strokeDasharray="8,5" opacity=".5">
        <animate attributeName="stroke-dashoffset" from="0" to="-26" dur="2s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function Slide4Bg() {
  return (
    <svg viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="s4bg" cx="60%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#1a2e5e" /><stop offset="100%" stopColor="#060e22" />
        </radialGradient>
        <radialGradient id="s4earth" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1565a0" /><stop offset="100%" stopColor="#0a3d6b" />
        </radialGradient>
      </defs>
      <rect width="1440" height="900" fill="url(#s4bg)" />
      <g fill="rgba(255,255,255,.5)">
        <circle cx="100" cy="80" r="2" /><circle cx="220" cy="60" r="1.5" /><circle cx="350" cy="110" r="1" />
        <circle cx="500" cy="50" r="2" /><circle cx="180" cy="200" r="1.5" /><circle cx="420" cy="170" r="1" />
        <circle cx="1200" cy="70" r="2" /><circle cx="1320" cy="120" r="1.5" /><circle cx="950" cy="80" r="2" />
      </g>
      <g transform="translate(900,450)">
        <circle r="260" fill="url(#s4earth)" opacity=".9" />
        <g fill="#22c55e" opacity=".72">
          <ellipse cx="-60" cy="-80" rx="90" ry="120" transform="rotate(-20,-60,-80)" />
          <ellipse cx="80" cy="-30" rx="60" ry="90" transform="rotate(15,80,-30)" />
          <ellipse cx="-70" cy="100" rx="70" ry="42" transform="rotate(-10,-70,100)" />
          <ellipse cx="110" cy="120" rx="55" ry="38" transform="rotate(20,110,120)" />
          <ellipse cx="-120" cy="30" rx="38" ry="60" />
        </g>
        <ellipse cx="-80" cy="-90" rx="90" ry="65" fill="rgba(255,255,255,.07)" transform="rotate(-30,-80,-90)" />
        <circle r="320" fill="none" stroke="rgba(255,179,71,.15)" strokeWidth="1.5" strokeDasharray="12,8" />
        <circle r="380" fill="none" stroke="rgba(255,179,71,.08)" strokeWidth="1" strokeDasharray="8,12" />
        <circle cx="-320" cy="0" r="18" fill="#FFD166" opacity=".85">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="12s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="-380" r="13" fill="#FFB347" opacity=".8">
          <animateTransform attributeName="transform" type="rotate" from="90" to="450" dur="12s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
}

type SlideData = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  desc: string;
  btn1: { href: string; text: string };
  btn2: { href: string; text: string };
  Bg: () => React.JSX.Element;
};

const slides: SlideData[] = [
  {
    eyebrow: 'Temiz Enerji Geleceği',
    title: 'Doğayı Korurken',
    titleAccent: 'Enerji Üretin',
    desc: 'Güneş panelleri ile kendi temiz enerjinizi üretin, doğaya katkı sağlayın ve faturalarınızı sıfıra yaklaştırın.',
    btn1: { href: '/iletisim', text: 'Ücretsiz Keşif Talep Et' },
    btn2: { href: '/urunler', text: 'Ürünleri İncele' },
    Bg: Slide1Bg,
  },
  {
    eyebrow: 'Yenilenebilir Enerji',
    title: 'Geleceğin Enerjisi',
    titleAccent: 'Bugün Burada',
    desc: 'Güneş ve rüzgar enerjisinin gücünü evinize ve işyerinize taşıyın. Sürdürülebilir bir gelecek için doğru adımı atın.',
    btn1: { href: '/iletisim', text: 'Hemen Başlayın' },
    btn2: { href: '/hesaplayici', text: 'Nasıl Çalışır?' },
    Bg: Slide2Bg,
  },
  {
    eyebrow: 'Villa & Endüstriyel GES',
    title: 'Çatınız Artık Bir',
    titleAccent: 'Enerji Santrali',
    desc: 'Villa ve endüstriyel yapılar için özel tasarlanmış güneş enerji sistemleriyle enerji bağımsızlığınızı kazanın.',
    btn1: { href: '/hakkimizda', text: 'Projelerimizi Gör' },
    btn2: { href: '/iletisim', text: 'Teklif Al' },
    Bg: Slide3Bg,
  },
  {
    eyebrow: 'Sürdürülebilir Dünya',
    title: 'Gezegenimiz İçin',
    titleAccent: 'Temiz Seçim',
    desc: 'Her kurduğumuz güneş paneli daha az CO₂, daha temiz hava ve daha yaşanabilir bir dünya demek.',
    btn1: { href: '/iletisim', text: 'Fark Yaratın' },
    btn2: { href: '/hakkimizda', text: 'Misyonumuz' },
    Bg: Slide4Bg,
  },
];

export default function HeroSlider() {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive(prev => (prev + 1) % slides.length);
    }, 5000);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const handleGo = (idx: number) => {
    setActive(((idx % slides.length) + slides.length) % slides.length);
    resetTimer();
  };

  return (
    <div className="relative overflow-hidden" style={{ height: '100vh', minHeight: 600 }}>
      {slides.map(({ eyebrow, title, titleAccent, desc, btn1, btn2, Bg }, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === active ? 1 : 0, pointerEvents: i === active ? 'all' : 'none' }}
        >
          <div className="absolute inset-0">{<Bg />}</div>
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 flex items-center h-full pt-20">
            <div className="max-w-7xl mx-auto px-6 w-full">
              <span className="inline-block border border-white/30 text-white/80 text-sm font-semibold px-4 py-1.5 rounded-full mb-5 backdrop-blur-sm bg-white/10">
                {eyebrow}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
                {title}<br /><span style={{ color: '#FFD166' }}>{titleAccent}</span>
              </h1>
              <p className="text-white/60 text-lg mb-8 max-w-xl">{desc}</p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href={btn1.href}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-base"
                >
                  {btn1.text}
                </Link>
                <Link
                  href={btn2.href}
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-base"
                  style={{ color: '#fff' }}
                >
                  {btn2.text}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Left arrow */}
      <button
        onClick={() => handleGo(active - 1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/35 hover:bg-orange-500/70 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors"
        aria-label="Önceki"
      >
        <ChevronLeft size={24} />
      </button>

      {/* Right arrow */}
      <button
        onClick={() => handleGo(active + 1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/35 hover:bg-orange-500/70 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors"
        aria-label="Sonraki"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => handleGo(i)}
            className="h-2 rounded-full transition-all duration-300 border-0"
            style={{
              width: i === active ? 28 : 8,
              background: i === active ? '#fff' : 'rgba(255,255,255,.5)',
              cursor: 'pointer',
              padding: 0,
            }}
            aria-label={`Slayt ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
