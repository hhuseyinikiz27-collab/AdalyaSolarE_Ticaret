import type { Metadata } from 'next';
import { Suspense } from 'react';
import ProductDetailClient from './ProductDetailClient';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5207';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const parts = slug.split('-');
  const id = parseInt(parts[parts.length - 1], 10);

  if (isNaN(id)) return { title: 'Ürün | Adalya Solar Enerji' };

  try {
    const res = await fetch(`${BASE}/api/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return { title: 'Ürün | Adalya Solar Enerji' };
    const p = await res.json();
    return {
      title: `${p.name} | Adalya Solar Enerji`,
      description: (p.description || '').slice(0, 160) || 'Adalya Solar Enerji ürün detayları.',
      openGraph: {
        title: `${p.name} | Adalya Solar Enerji`,
        description: (p.description || '').slice(0, 160),
        images: p.imageUrl ? [`${BASE}${p.imageUrl.startsWith('/') ? '' : '/'}${p.imageUrl}`] : [],
      },
    };
  } catch {
    return { title: 'Ürün | Adalya Solar Enerji' };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const parts = slug.split('-');
  const id = parseInt(parts[parts.length - 1], 10);

  let jsonLd: Record<string, unknown> | null = null;
  if (!isNaN(id)) {
    try {
      const res = await fetch(`${BASE}/api/products/${id}`, { cache: 'no-store' });
      if (res.ok) {
        const p = await res.json();
        const price = p.discountPrice ?? p.price;
        const imageUrl = p.imageUrl
          ? (p.imageUrl.startsWith('http') ? p.imageUrl : `${BASE}${p.imageUrl}`)
          : undefined;
        jsonLd = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: p.name,
          description: p.description,
          brand: { '@type': 'Brand', name: p.brand },
          ...(imageUrl && { image: imageUrl }),
          offers: {
            '@type': 'Offer',
            priceCurrency: 'TRY',
            price: price,
            availability: p.stock > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://adalyasolar.com'}/urunler/${slug}`,
          },
          ...(p.avgRating && p.reviewCount > 0 && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: p.avgRating,
              reviewCount: p.reviewCount,
            },
          }),
        };
      }
    } catch { /* JSON-LD opsiyonel */ }
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    <Suspense
      fallback={
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-gray-100 rounded-2xl h-96 animate-pulse" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-10 animate-pulse" />
              ))}
            </div>
          </div>
        </main>
      }
    >
      <ProductDetailClient slug={slug} />
    </Suspense>
    </>
  );
}
