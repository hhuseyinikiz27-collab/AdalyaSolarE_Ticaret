'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageLoader() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  // Link tıklamasında başlat
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('mailto') || href.startsWith('tel') || href.startsWith('#') || anchor.target === '_blank') return;

      try {
        const url = new URL(href, window.location.origin);
        if (url.pathname !== window.location.pathname) {
          setVisible(true);
          setProgress(20);
        }
      } catch {}
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Sayfa değişince tamamla
  useEffect(() => {
    if (!visible) return;
    setProgress(100);
    const t = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 400);
    return () => clearTimeout(t);
  }, [pathname]);

  // Yüklenirken ilerlet
  useEffect(() => {
    if (!visible || progress >= 90) return;
    const t = setTimeout(() => setProgress((p) => Math.min(p + 15, 90)), 250);
    return () => clearTimeout(t);
  }, [visible, progress]);

  // Navigasyon takılırsa 8 saniye sonra zorla tamamla
  useEffect(() => {
    if (!visible) return;
    const t1 = setTimeout(() => setProgress(100), 8000);
    const t2 = setTimeout(() => { setVisible(false); setProgress(0); }, 8400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [visible]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] transition-all duration-300 ease-out"
      style={{
        width: `${progress}%`,
        opacity: visible ? 1 : 0,
      }}
    />
  );
}
