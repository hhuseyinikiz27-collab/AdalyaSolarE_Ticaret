import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://adalyasolar.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/hesabim/', '/sepet/', '/odeme/', '/giris/', '/kayit/'],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
