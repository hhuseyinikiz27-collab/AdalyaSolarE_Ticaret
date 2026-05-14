import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://adalyasolar.com';
const API  = process.env.NEXT_PUBLIC_API_URL  || 'http://localhost:5207';

async function get<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${API}${path}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, blogPosts] = await Promise.all([
    get<{ id: number; name: string; createdAt?: string }>('/api/products'),
    get<{ slug: string }>('/api/categories'),
    get<{ id: number; slug?: string; createdAt?: string }>('/api/blog/posts'),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE,                              priority: 1.0, changeFrequency: 'daily'   },
    { url: `${SITE}/urunler`,                 priority: 0.9, changeFrequency: 'daily'   },
    { url: `${SITE}/kampanyalar`,             priority: 0.8, changeFrequency: 'weekly'  },
    { url: `${SITE}/blog`,                    priority: 0.7, changeFrequency: 'weekly'  },
    { url: `${SITE}/referanslar`,             priority: 0.6, changeFrequency: 'monthly' },
    { url: `${SITE}/hakkimizda`,              priority: 0.6, changeFrequency: 'monthly' },
    { url: `${SITE}/iletisim`,                priority: 0.6, changeFrequency: 'monthly' },
    { url: `${SITE}/kurumsal`,                priority: 0.5, changeFrequency: 'monthly' },
    { url: `${SITE}/sss`,                     priority: 0.5, changeFrequency: 'monthly' },
    { url: `${SITE}/hesaplayici`,             priority: 0.5, changeFrequency: 'monthly' },
    { url: `${SITE}/siparis-takip`,           priority: 0.4, changeFrequency: 'monthly' },
    { url: `${SITE}/gizlilik-politikasi`,     priority: 0.3, changeFrequency: 'yearly'  },
    { url: `${SITE}/kullanim-kosullari`,      priority: 0.3, changeFrequency: 'yearly'  },
    { url: `${SITE}/iade-politikasi`,         priority: 0.3, changeFrequency: 'yearly'  },
  ];

  const productPages: MetadataRoute.Sitemap = products.map(p => ({
    url: `${SITE}/urunler/${slugify(p.name)}-${p.id}`,
    lastModified: p.createdAt ? new Date(p.createdAt) : new Date(),
    priority: 0.8,
    changeFrequency: 'weekly',
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map(c => ({
    url: `${SITE}/urunler?kategori=${c.slug}`,
    priority: 0.7,
    changeFrequency: 'weekly',
  }));

  const blogPages: MetadataRoute.Sitemap = blogPosts.map(p => ({
    url: `${SITE}/blog/${p.slug ?? p.id}`,
    lastModified: p.createdAt ? new Date(p.createdAt) : new Date(),
    priority: 0.6,
    changeFrequency: 'monthly',
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...blogPages];
}
