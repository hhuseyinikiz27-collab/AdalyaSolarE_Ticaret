export interface Product {
  id: number;
  name: string;
  slug: string;
  category: Category;
  price: number;
  originalPrice?: number;
  images: string[];
  brand: string;
  model: string;
  stock: number;
  rating: number;
  reviewCount: number;
  favoriteCount?: number;
  description: string;
  shortDescription: string;
  specs: TechnicalSpecs;
  tags: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  volumeDiscounts?: { minQty: number; discountPct: number }[];
  flashSalePrice?: number | null;
  flashSaleEndsAt?: string | null;
  warrantyMonths?: number;
}

export type Category = 'gunes-panelleri' | 'bataryalar' | 'inverterler' | 'montaj-aksesuarlari';

export interface CategoryInfo {
  slug: Category;
  name: string;
  icon: string;
  description: string;
}

export interface TechnicalSpecs {
  guc?: string;
  kapasite?: string;
  verimlilik?: string;
  boyutlar: string;
  agirlik: string;
  garantiSuresi: string;
  kullanomru: string;
  uretimYili: string;
  calismaScakligi: string;
  sertifikalar: string[];
  [key: string]: string | string[] | undefined;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  photoUrl?: string;
  addresses: Address[];
  orders: Order[];
}

export interface Address {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  neighborhood: string;
  street: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  date: string;
  status: 'hazirlanıyor' | 'kargoda' | 'teslim-edildi' | 'iptal';
  total: number;
  items: CartItem[];
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}
