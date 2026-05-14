import { ApiProduct } from '@/lib/api';
import { Product, Category, TechnicalSpecs } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5207';

const CATEGORY_IMAGES: Record<string, string[]> = {
  'gunes-panelleri': [
    'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1611365892117-00ac5ef43c90?w=800&h=600&fit=crop',
  ],
  'bataryalar': [
    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
  ],
  'inverterler': [
    'https://images.unsplash.com/photo-1548407260-da850faa41e3?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=600&fit=crop',
  ],
  'montaj-aksesuarlari': [
    'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
  ],
};

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&h=600&fit=crop',
];

function getCategoryImage(category: string, productId: number): string {
  const pool = CATEGORY_IMAGES[category] ?? DEFAULT_IMAGES;
  return pool[productId % pool.length];
}

function toAbsolute(url: string): string {
  if (!url) return '';
  return url.startsWith('http') ? url : `${BASE_URL}${url}`;
}

function resolveImages(p: ApiProduct): string[] {
  const extra = (p.images ?? []).map((i) => toAbsolute(i.url)).filter(Boolean);
  const main = p.imageUrl ? toAbsolute(p.imageUrl) : null;
  const fallback = getCategoryImage(p.category, p.id);

  if (extra.length > 0) return extra;
  if (main) return [main];
  return [fallback];
}

export function makeProductSlug(name: string, id: number): string {
  const slug = name
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug}-${id}`;
}

export function slugToProductId(slug: string): number {
  const parts = slug.split('-');
  const id = parseInt(parts[parts.length - 1], 10);
  return isNaN(id) ? parseInt(slug, 10) : id;
}

function resolveSpecs(p: ApiProduct): TechnicalSpecs {
  // Backend JSON string olarak dönebilir, parse et
  let apiSpecs: Record<string, string> | null = null;
  const raw = p.specs as unknown;
  if (typeof raw === 'string' && raw.trim()) {
    try { apiSpecs = JSON.parse(raw); } catch { apiSpecs = null; }
  } else if (raw && typeof raw === 'object' && Object.keys(raw).length > 0) {
    apiSpecs = raw as Record<string, string>;
  }

  if (apiSpecs && Object.keys(apiSpecs).length > 0) return apiSpecs as TechnicalSpecs;

  // localStorage fallback (backend specs döndürmüyorsa)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(`adalya_specs_${p.id}`);
    if (stored) {
      try { return JSON.parse(stored) as TechnicalSpecs; } catch { /* ignore */ }
    }
  }

  return {} as TechnicalSpecs;
}

export function toProduct(p: ApiProduct): Product {
  const hasDiscount = p.discountPrice != null && p.discountPrice < p.price;
  return {
    id: p.id,
    name: p.name,
    slug: makeProductSlug(p.name, p.id),
    category: p.category as Category,
    price: hasDiscount ? p.discountPrice! : p.price,
    originalPrice: hasDiscount ? p.price : undefined,
    images: resolveImages(p),
    brand: p.brand,
    model: p.brand,
    stock: p.stock,
    rating: p.avgRating ?? 4.5,
    reviewCount: p.reviewCount ?? 0,
    favoriteCount: p.favoriteCount ?? 0,
    description: p.description,
    shortDescription: p.description.slice(0, 100),
    specs: resolveSpecs(p),
    tags: [],
    isNew: p.isNew,
    isFeatured: p.isFeatured,
    volumeDiscounts: (() => {
      if (!p.volumeDiscountsJson) return undefined;
      try { return JSON.parse(p.volumeDiscountsJson); } catch { return undefined; }
    })(),
    flashSalePrice: p.flashSalePrice ?? undefined,
    flashSaleEndsAt: p.flashSaleEndsAt ?? undefined,
    warrantyMonths: p.warrantyMonths,
  };
}
