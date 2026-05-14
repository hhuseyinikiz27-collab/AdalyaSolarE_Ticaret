'use client';

import { useEffect } from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5207';

export default function TawkToWidget() {
  useEffect(() => {
    fetch(`${BASE_URL}/api/public/site-info`)
      .then(r => r.json())
      .then((info: Record<string, string>) => {
        const propertyId = info['tawkto.propertyId']?.trim();
        const widgetId = info['tawkto.widgetId']?.trim() || '1default';
        if (!propertyId) return;

        // Prevent double-loading
        if (document.getElementById('tawk-script')) return;

        (window as { Tawk_API?: object; Tawk_LoadStart?: Date }).Tawk_API = (window as { Tawk_API?: object }).Tawk_API || {};
        (window as { Tawk_LoadStart?: Date }).Tawk_LoadStart = new Date();

        const script = document.createElement('script');
        script.id = 'tawk-script';
        script.async = true;
        script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
        script.charset = 'UTF-8';
        script.setAttribute('crossorigin', '*');
        document.head.appendChild(script);
      })
      .catch(() => {});
  }, []);

  return null;
}
