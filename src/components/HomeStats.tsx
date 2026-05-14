'use client';
import { useEffect, useRef } from 'react';

const statsData = [
  { target: 10000, suffix: '+', label: 'Kurulu Ürün' },
  { target: 500, suffix: '+', label: 'Marka & Model' },
  { target: 98, suffix: '%', label: 'Müşteri Memnuniyeti' },
  { target: 25, suffix: ' Yıl', label: 'Panel Garantisi' },
];

function countUp(el: HTMLElement, target: number, ms: number) {
  let start: number | null = null;
  function frame(ts: number) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / ms, 1);
    el.textContent = String(Math.floor((1 - Math.pow(1 - progress, 3)) * target));
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

export default function HomeStats() {
  const sectionRef = useRef<HTMLElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !counted.current) {
        counted.current = true;
        sectionRef.current?.querySelectorAll<HTMLElement>('[data-target]').forEach(el => {
          const countEl = el.querySelector<HTMLElement>('.count-num');
          if (countEl) countUp(countEl, Number(el.dataset.target), 1800);
        });
      }
    }, { threshold: 0.3 });
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#0d1f3d] py-14">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 text-center">
          {statsData.map(({ target, suffix, label }, i) => (
            <div
              key={label}
              className={`py-8 ${i < statsData.length - 1 ? 'border-r border-white/20' : ''}`}
              data-target={target}
            >
              <div className="text-4xl font-extrabold text-white mb-1">
                <span className="count-num">0</span>
                <span className="text-white/50 text-3xl">{suffix}</span>
              </div>
              <p className="text-white/50 text-sm mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
