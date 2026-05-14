const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5207';

export interface ApiProductImage {
  id: number;
  url: string;
  sortOrder: number;
}

export interface ApiProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  imageUrl: string;
  images: ApiProductImage[];
  category: string;
  brand: string;
  stock: number;
  isFeatured: boolean;
  isNew: boolean;
  createdAt: string;
  favoriteCount: number;
  avgRating?: number;
  reviewCount?: number;
  specs?: Record<string, string>;
  volumeDiscountsJson?: string | null;
  flashSalePrice?: number | null;
  flashSaleEndsAt?: string | null;
  warrantyMonths?: number;
}

export interface ApiSecurityLog {
  id: number;
  action: string;
  details: string;
  createdAt: string;
}

export interface ApiUserSecurity {
  lastLoginAt: string | null;
  passwordChangedAt: string | null;
  lockoutUntil: string | null;
  lockoutReason: string | null;
  isLocked: boolean;
  spamBanUntil: string | null;
  isSpamBanned: boolean;
  logs: ApiSecurityLog[];
}

export interface ApiCampaign {
  id: number;
  title: string;
  subtitle: string;
  discount: string;
  description: string;
  endDate: string;
  gradientFrom: string;
  gradientTo: string;
  href: string;
  hrefLabel: string;
  badge: string;
  badgeBg: string;
  icon: string;
  iconClass: string;
  requirement: 'join' | 'registered' | 'corporate_contact';
  sortOrder: number;
  hasCoupon: boolean;
  // only available from admin endpoints
  couponCode?: string | null;
  isActive?: boolean;
}

export interface AuthResponse {
  token: string;
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  orderCount: number;
  adminNote?: string | null;
}

export interface ApiContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface AdminReview {
  id: number;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  adminReply: string | null;
  likeCount: number;
  createdAt: string;
  productName: string;
  productId: number;
}

export interface ApiOrderItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  productName: string;
  productImageUrl: string;
  warrantyMonths?: number;
}

export interface ApiOrder {
  id: number;
  total: number;
  status: string;
  shippingFullName: string;
  shippingPhone: string;
  shippingAddress: string;
  note: string;
  createdAt: string;
  items: ApiOrderItem[];
}

export interface ApiSavedCard {
  id: number;
  userId: number;
  cardHolderName: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  cardType: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateOrderPayload {
  items: { productId: number; quantity: number }[];
  shippingFullName: string;
  shippingPhone: string;
  shippingAddress: string;
  note?: string;
  couponCode?: string;
  giftCardCode?: string;
  loyaltyDiscount?: number;
}

export interface ApiCoupon {
  id: number;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  campaignId: number | null;
}

export interface MonthlyStatItem {
  year: number;
  month: number;
  revenue: number;
  count: number;
}

export interface DailyStatItem {
  date: string;
  revenue: number;
  count: number;
}

export interface ApiReview {
  id: number;
  productId: number;
  userId: number | null;
  userName: string;
  rating: number;
  comment: string;
  adminReply: string | null;
  likeCount: number;
  likedByMe: boolean;
  createdAt: string;
}

export interface ApiNotification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'order' | 'promo' | 'security';
  isRead: boolean;
  createdAt: string;
}

export interface ApiProjectReference {
  id: number;
  title: string;
  city: string;
  type: string;
  capacity: string;
  panels: number;
  year: string;
  description: string;
  imageUrl: string;
  savings: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt?: string;
}

export interface ApiQuoteRequest {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  city: string;
  projectType: string;
  systemSize: string;
  roof: string;
  monthlyBill: number | null;
  note: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  userId?: number | null;
}

export interface ApiInstallationRequest {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  installationType: string;
  systemSize: string;
  note: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  userId?: number | null;
}

export interface ApiWarrantyRegistration {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  serialNumber: string;
  warrantyMonths: number;
  purchaseDate: string;
  expiresAt: string;
  status: 'active' | 'expired';
  createdAt: string;
  userName?: string;
  userEmail?: string;
}

export interface ApiBulkOrderRequest {
  id: number;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  itemsJson: string;
  deliveryAddress: string;
  note: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  userName?: string | null;
  userEmail?: string | null;
}

export interface ApiProductDocument {
  id: number;
  name: string;
  fileUrl: string;
  fileType: string;
  sizeBytes: number;
}

export interface ApiGiftCard {
  id: number;
  code: string;
  amount: number;
  balance: number;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string | null;
  note: string;
}

export interface ApiBundleItem {
  id: number;
  productId: number;
  quantity: number;
  productName: string;
  productImageUrl: string;
  productPrice: number;
}

export interface ApiBundle {
  id: number;
  name: string;
  description: string;
  bundlePrice: number;
  originalPrice: number;
  isActive: boolean;
  createdAt: string;
  items: ApiBundleItem[];
}

export interface BundleUpsertPayload {
  name: string;
  description: string;
  bundlePrice: number;
  isActive: boolean;
  items: { productId: number; quantity: number }[];
}

export interface ApiBlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content?: string; // JSON string array, only in detail
  category: string;
  author: string;
  authorTitle: string;
  date: string;
  readTime: number;
  imageUrl: string;
  tags: string; // JSON string array
  isPublished?: boolean;
  createdAt?: string;
}

export interface ApiReturnRequest {
  id: number;
  orderId: number;
  type: 'iade' | 'iptal';
  reason: string;
  status: 'beklemede' | 'onaylandi' | 'reddedildi' | 'tamamlandi';
  adminNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
  orderTotal?: number;
  orderCreatedAt?: string;
  // admin fields
  userName?: string;
  userEmail?: string;
}

export interface ApiProductQuestion {
  id: number;
  userName: string;
  question: string;
  answer: string | null;
  createdAt: string;
  answeredAt: string | null;
  // admin fields
  productId?: number;
  productName?: string;
  isVisible?: boolean;
}

export interface ApiProductVariant {
  id: number;
  productId: number;
  groupName: string;
  value: string;
  priceAdjustment: number;
  stock: number;
  isDefault: boolean;
  sortOrder: number;
}

export interface ApiAddress {
  id: number;
  userId: number;
  title: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  neighborhood: string;
  street: string;
  isDefault: boolean;
}

export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  sortOrder: number;
}

export interface AdminStats {
  totalProducts: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalReviews: number;
  totalFavorites: number;
  totalLikes: number;
}

function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Bir hata oluştu.' }));
    throw new Error(err.message || 'Bir hata oluştu.');
  }
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text);
}

function authRequest<T>(path: string, body: object, token?: string): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

async function adminRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers || {}),
      },
    });
  } catch {
    throw new Error('Sunucuya bağlanılamadı. Backend çalışıyor mu? (' + BASE_URL + ')');
  }
  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.dispatchEvent(new Event('user-logout'));
      window.location.href = '/giris?timeout=1';
    }
    throw new Error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Bir hata oluştu.' }));
    throw new Error(err.message || 'Bir hata oluştu.');
  }
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text);
}

export const api = {
  categories: {
    getAll: () => request<ApiCategory[]>('/api/categories'),
  },

  stockNotify: {
    request: (productId: number, email: string) =>
      request<{ message: string }>('/api/stock-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, email }),
      }),
  },

  newsletter: {
    subscribe: (email: string) =>
      request<{ message: string }>('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }),
    unsubscribe: (email: string) =>
      request<{ message: string }>('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      }),
  },

  products: {
    getOrderCount: (id: number) => request<{ count: number }>(`/api/products/${id}/order-count`),
    getAll: (params?: { category?: string; search?: string }) => {
      const qs = new URLSearchParams();
      if (params?.category) qs.set('category', params.category);
      if (params?.search) qs.set('search', params.search);
      const query = qs.toString() ? `?${qs}` : '';
      return request<ApiProduct[]>(`/api/products${query}`);
    },
    getById: (id: number) => request<ApiProduct>(`/api/products/${id}`),
    getFeatured: () => request<ApiProduct[]>('/api/products/featured'),
    getDocuments: (id: number) => request<ApiProductDocument[]>(`/api/products/${id}/documents`),
  },

  auth: {
    login: (email: string, password: string) =>
      authRequest<AuthResponse>('/api/auth/login', { email, password }),
    register: (name: string, email: string, password: string, phone?: string, referralCode?: string) =>
      authRequest<AuthResponse>('/api/auth/register', { name, email, password, ...(phone ? { phone } : {}), ...(referralCode ? { referralCode } : {}) }),
    forgotPassword: (email: string) =>
      authRequest<{ message: string }>('/api/auth/forgot-password', { email }),
    resetPassword: (token: string, newPassword: string) =>
      authRequest<{ message: string }>('/api/auth/reset-password', { token, newPassword }),
    updateProfile: (name: string, phone: string) => {
      const token = getToken();
      return request<{ id: number; name: string; email: string; phone: string; photoUrl: string; role: string }>(
        '/api/auth/profile',
        { method: 'PUT', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ name, phone }) }
      );
    },
    uploadPhoto: async (file: File): Promise<{ photoUrl: string }> => {
      const token = getToken();
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${BASE_URL}/api/auth/profile/photo`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (!res.ok) throw new Error('Fotoğraf yüklenemedi.');
      return res.json();
    },
    getMe: () => adminRequest<{ id: number; name: string; email: string; phone: string; photoUrl: string; role: string }>('/api/auth/me'),
    changePassword: (currentPassword: string, newPassword: string) => {
      const token = getToken();
      return request<{ message: string }>('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    },
    deleteAccount: () => adminRequest<void>('/api/auth/account', { method: 'DELETE' }),
    getFlashNotify: () => adminRequest<{ enabled: boolean }>('/api/auth/flash-notify'),
    setFlashNotify: (enabled: boolean) => adminRequest<{ enabled: boolean }>('/api/auth/flash-notify', { method: 'PUT', body: JSON.stringify({ enabled }) }),
    googleLogin: (idToken: string) =>
      authRequest<AuthResponse>('/api/auth/google', { idToken }),
  },

  coupons: {
    validate: (code: string) =>
      adminRequest<{ code: string; discountType: string; discountValue: number; minOrderAmount: number }>(
        '/api/coupons/validate', { method: 'POST', body: JSON.stringify({ code }) }
      ),
  },

  reviews: {
    getByProduct: (productId: number) =>
      request<(ApiReview & { photosJson?: string | null })[]>(`/api/reviews/product/${productId}`),
    uploadPhotos: async (reviewId: number, files: File[]): Promise<{ photos: string[] }> => {
      const token = getToken();
      const form = new FormData();
      files.forEach(f => form.append('files', f));
      const res = await fetch(`${BASE_URL}/api/reviews/${reviewId}/photos`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (!res.ok) throw new Error('Fotoğraf yüklenemedi.');
      return res.json();
    },
    create: (productId: number, rating: number, comment: string) => {
      const token = getToken();
      return request<ApiReview>(`/api/reviews?productId=${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ rating, comment }),
      });
    },
    like: (id: number) => {
      const token = getToken();
      return request<{ liked: boolean; likeCount: number }>(`/api/reviews/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
    },
  },

  cards: {
    getAll: () => adminRequest<ApiSavedCard[]>('/api/cards'),
    create: (data: { cardHolderName: string; last4: string; expiryMonth: string; expiryYear: string; cardType: string; isDefault: boolean }) =>
      adminRequest<ApiSavedCard>('/api/cards', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: number) => adminRequest<void>(`/api/cards/${id}`, { method: 'DELETE' }),
    setDefault: (id: number) => adminRequest<ApiSavedCard>(`/api/cards/${id}/default`, { method: 'PUT' }),
  },

  notifications: {
    getAll: () => adminRequest<ApiNotification[]>('/api/notifications'),
    getUnreadCount: () => adminRequest<{ count: number }>('/api/notifications/unread-count'),
    markRead: (id: number) => adminRequest<void>(`/api/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => adminRequest<void>('/api/notifications/read-all', { method: 'PUT' }),
    delete: (id: number) => adminRequest<void>(`/api/notifications/${id}`, { method: 'DELETE' }),
  },

  orders: {
    track: (id: number) => request<{ id: number; status: string; total: number; createdAt: string; shippingFullName: string; shippingAddress: string; trackingCode?: string; cargoCompany?: string; items: { productId: number; quantity: number; unitPrice: number; productName: string }[] }>(`/api/orders/track/${id}`),
    getMy: () => adminRequest<ApiOrder[]>('/api/orders'),
    create: (data: CreateOrderPayload) =>
      adminRequest<{ id: number; total: number; status: string; createdAt: string }>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    cancel: (id: number) =>
      adminRequest<{ message: string }>(`/api/orders/${id}/cancel`, { method: 'PUT' }),
  },

  favorites: {
    getIds: () => adminRequest<number[]>('/api/favorites/ids'),
    getAll: () => adminRequest<{ id: number; productId: number; createdAt: string; product: { id: number; name: string; price: number; imageUrl: string; category: string; brand: string; stock: number; isNew: boolean; isFeatured: boolean } }[]>('/api/favorites'),
    toggle: (productId: number) =>
      adminRequest<{ isFavorite: boolean }>(`/api/favorites/toggle/${productId}`, { method: 'POST' }),
  },

  addresses: {
    getAll: () => adminRequest<ApiAddress[]>('/api/addresses'),
    create: (data: Omit<ApiAddress, 'id' | 'userId'>) =>
      adminRequest<ApiAddress>('/api/addresses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Omit<ApiAddress, 'id' | 'userId'>) =>
      adminRequest<ApiAddress>(`/api/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      adminRequest<void>(`/api/addresses/${id}`, { method: 'DELETE' }),
  },

  admin: {
    seedImages: () =>
      adminRequest<{ seeded: number; message: string }>('/api/admin/seed-images', { method: 'POST' }),

    products: {
      getAll: () => adminRequest<ApiProduct[]>('/api/admin/products'),
      create: (data: { name: string; description: string; price: number; category: string; brand: string; stock: number; isFeatured: boolean; isNew: boolean; discountPrice?: number | null; specs?: Record<string, string> }) =>
        adminRequest<ApiProduct>('/api/admin/products', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: number, data: Partial<{ name: string; description: string; price: number; category: string; brand: string; stock: number; isFeatured: boolean; isNew: boolean; discountPrice: number | null; clearDiscount: boolean; specs: Record<string, string>; volumeDiscountsJson: string; flashSalePrice: number; flashSaleEndsAt: string; clearFlashSale: boolean; warrantyMonths: number }>) =>
        adminRequest<ApiProduct>(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: number) =>
        adminRequest<void>(`/api/admin/products/${id}`, { method: 'DELETE' }),
      uploadImage: async (id: number, file: File): Promise<{ imageUrl: string }> => {
        const token = getToken();
        const form = new FormData();
        form.append('file', file);
        const res = await fetch(`${BASE_URL}/api/admin/products/${id}/image`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: form,
        });
        if (!res.ok) throw new Error('Resim yüklenemedi.');
        return res.json();
      },
      getImages: (id: number) =>
        adminRequest<ApiProductImage[]>(`/api/admin/products/${id}/images`),
      addImageByUrl: (id: number, url: string) =>
        adminRequest<ApiProductImage>(`/api/admin/products/${id}/images/url`, {
          method: 'POST', body: JSON.stringify({ url }),
        }),
      addImageByUpload: async (id: number, file: File): Promise<ApiProductImage> => {
        const token = getToken();
        const form = new FormData();
        form.append('file', file);
        const res = await fetch(`${BASE_URL}/api/admin/products/${id}/images/upload`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: form,
        });
        if (!res.ok) throw new Error('Resim yüklenemedi.');
        return res.json();
      },
      deleteImage: (productId: number, imageId: number) =>
        adminRequest<void>(`/api/admin/products/${productId}/images/${imageId}`, { method: 'DELETE' }),
      bulkUpdate: (data: { ids: number[]; price?: number; discountPrice?: number; clearDiscount?: boolean; stock?: number; isFeatured?: boolean; isNew?: boolean }) =>
        adminRequest<{ updated: number }>('/api/admin/products/bulk-update', { method: 'POST', body: JSON.stringify(data) }),
      notifyFlashSale: (productId: number, data: { flashPrice: number; originalPrice: number; endsAt: string }) =>
        adminRequest<{ productSlug: string; users: { name: string; email: string }[] }>(
          `/api/admin/products/${productId}/notify-flash-sale`,
          { method: 'POST', body: JSON.stringify(data) }
        ),
    },

    users: {
      getAll: () => adminRequest<AdminUser[]>('/api/admin/users'),
      delete: (id: number) => adminRequest<void>(`/api/admin/users/${id}`, { method: 'DELETE' }),
      updateRole: (id: number, role: string) =>
        adminRequest<void>(`/api/admin/users/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
      getOrders: (id: number) => adminRequest<unknown[]>(`/api/admin/users/${id}/orders`),
      getNote: (id: number) => adminRequest<{ note: string | null }>(`/api/admin/users/${id}/note`),
      updateNote: (id: number, note: string | null) =>
        adminRequest<{ note: string | null }>(`/api/admin/users/${id}/note`, { method: 'PUT', body: JSON.stringify({ note }) }),
    },

    orders: {
      getAll: () => adminRequest<unknown[]>('/api/admin/orders'),
      getNewCount: () => adminRequest<{ count: number }>('/api/admin/orders/new-count'),
      updateStatus: (id: number, status: string, extra?: { trackingCode?: string; cargoCompany?: string }) =>
        adminRequest<void>(`/api/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, ...extra }) }),
      getNote: (id: number) => adminRequest<{ note: string | null }>(`/api/admin/orders/${id}/note`),
      updateNote: (id: number, note: string | null) =>
        adminRequest<{ note: string | null }>(`/api/admin/orders/${id}/note`, { method: 'PUT', body: JSON.stringify({ note }) }),
    },

    categories: {
      getAll: () => adminRequest<ApiCategory[]>('/api/admin/categories'),
      create: (data: { name: string; slug: string; icon: string; description: string; sortOrder: number }) =>
        adminRequest<ApiCategory>('/api/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: number, data: { name: string; slug: string; icon: string; description: string; sortOrder: number }) =>
        adminRequest<ApiCategory>(`/api/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: number) =>
        adminRequest<void>(`/api/admin/categories/${id}`, { method: 'DELETE' }),
    },

    stats: {
      get: () => adminRequest<AdminStats>('/api/admin/stats'),
      monthly: (months = 6) => adminRequest<MonthlyStatItem[]>(`/api/admin/stats/monthly?months=${months}`),
      daily: (months = 1) => adminRequest<DailyStatItem[]>(`/api/admin/stats/daily?months=${months}`),
      topProducts: (days = 30, take = 10) =>
        adminRequest<{ productId: number; productName: string; totalQuantity: number; totalRevenue: number; orderCount: number }[]>
          (`/api/admin/stats/top-products?days=${days}&take=${take}`),
    },

    export: {
      downloadOrders: () => `${BASE_URL}/api/admin/export/orders`,
      downloadCustomers: () => `${BASE_URL}/api/admin/export/customers`,
      downloadProducts: () => `${BASE_URL}/api/admin/export/products`,
    },

    coupons: {
      getAll: () => adminRequest<ApiCoupon[]>('/api/admin/coupons'),
      getExpiringCount: () => adminRequest<{ count: number }>('/api/admin/coupons/expiring-count'),
      create: (data: { code: string; discountType: string; discountValue: number; minOrderAmount: number; maxUses: number; expiresAt?: string; campaignId?: number | null }) =>
        adminRequest<ApiCoupon>('/api/admin/coupons', { method: 'POST', body: JSON.stringify(data) }),
      toggle: (id: number) => adminRequest<{ id: number; code: string; isActive: boolean }>(`/api/admin/coupons/${id}/toggle`, { method: 'PUT' }),
      delete: (id: number) => adminRequest<void>(`/api/admin/coupons/${id}`, { method: 'DELETE' }),
    },

    reviews: {
      getAll: () => adminRequest<AdminReview[]>('/api/admin/reviews'),
      getUnansweredCount: () => adminRequest<{ count: number }>('/api/admin/reviews/unanswered-count'),
      reply: (id: number, reply: string) =>
        adminRequest<void>(`/api/admin/reviews/${id}/reply`, { method: 'POST', body: JSON.stringify({ reply }) }),
      delete: (id: number) => adminRequest<void>(`/api/admin/reviews/${id}`, { method: 'DELETE' }),
    },

    messages: {
      getAll: () => adminRequest<ApiContactMessage[]>('/api/admin/messages'),
      getUnreadCount: () => adminRequest<{ count: number }>('/api/admin/messages/unread-count'),
      markAsRead: (id: number) => adminRequest<void>(`/api/admin/messages/${id}/read`, { method: 'PUT' }),
      delete: (id: number) => adminRequest<void>(`/api/admin/messages/${id}`, { method: 'DELETE' }),
    },

    campaigns: {
      getAll: () => adminRequest<ApiCampaign[]>('/api/admin/campaigns'),
      create: (data: Omit<ApiCampaign, 'id' | 'hasCoupon'> & { couponCode?: string | null }) =>
        adminRequest<ApiCampaign>('/api/admin/campaigns', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: number, data: Omit<ApiCampaign, 'id' | 'hasCoupon'> & { couponCode?: string | null }) =>
        adminRequest<ApiCampaign>(`/api/admin/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
      delete: (id: number) =>
        adminRequest<void>(`/api/admin/campaigns/${id}`, { method: 'DELETE' }),
    },

    returns: {
      getAll: (status?: string) => {
        const qs = status ? `?status=${encodeURIComponent(status)}` : '';
        return adminRequest<ApiReturnRequest[]>(`/api/returns/admin/all${qs}`);
      },
      getPendingCount: () => adminRequest<{ count: number }>('/api/returns/admin/pending-count'),
      updateStatus: (id: number, status: string, adminNote?: string) =>
        adminRequest<void>(`/api/returns/admin/${id}/status`, {
          method: 'PUT', body: JSON.stringify({ status, adminNote }),
        }),
    },

    loyalty: {
      deductForOrder: (orderId: number) =>
        adminRequest<void>(`/api/admin/loyalty/deduct-for-order/${orderId}`, { method: 'POST' }),
    },

    questions: {
      getAll: () => adminRequest<ApiProductQuestion[]>('/api/questions/admin/all'),
      getPendingCount: () => adminRequest<{ count: number }>('/api/questions/admin/pending-count'),
      answer: (id: number, answer: string) =>
        adminRequest<{ id: number; answer: string; answeredAt: string }>(
          `/api/questions/admin/${id}/answer`,
          { method: 'PUT', body: JSON.stringify({ answer }) }
        ),
      setVisibility: (id: number, isVisible: boolean) =>
        adminRequest<void>(`/api/questions/admin/${id}/visibility`, {
          method: 'PUT', body: JSON.stringify({ isVisible }),
        }),
      delete: (id: number) =>
        adminRequest<void>(`/api/questions/admin/${id}`, { method: 'DELETE' }),
    },

    documents: {
      getByProduct: (productId: number) =>
        adminRequest<ApiProductDocument[]>(`/api/admin/products/${productId}/documents`),
      upload: (productId: number, file: File, name: string) => {
        const token = getToken();
        const form = new FormData();
        form.append('file', file);
        form.append('name', name);
        return fetch(`${BASE_URL}/api/admin/products/${productId}/documents`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: form,
        }).then(async (r) => { if (!r.ok) throw new Error(await r.text()); return r.json() as Promise<ApiProductDocument>; });
      },
      delete: (productId: number, docId: number) =>
        adminRequest<void>(`/api/admin/products/${productId}/documents/${docId}`, { method: 'DELETE' }),
    },

    variants: {
      getByProduct: (productId: number) =>
        adminRequest<ApiProductVariant[]>(`/api/products/${productId}/variants`),
      create: (productId: number, data: Omit<ApiProductVariant, 'id' | 'productId'>) =>
        adminRequest<ApiProductVariant>(`/api/admin/products/${productId}/variants`, {
          method: 'POST', body: JSON.stringify(data),
        }),
      update: (id: number, data: Omit<ApiProductVariant, 'id' | 'productId'>) =>
        adminRequest<ApiProductVariant>(`/api/admin/variants/${id}`, {
          method: 'PUT', body: JSON.stringify(data),
        }),
      delete: (id: number) =>
        adminRequest<void>(`/api/admin/variants/${id}`, { method: 'DELETE' }),
    },

    security: {
      getUserSecurity: (id: number) => adminRequest<ApiUserSecurity>(`/api/admin/users/${id}/security`),
      unlockUser: (id: number) => adminRequest<{ message: string }>(`/api/admin/users/${id}/unlock`, { method: 'PUT' }),
      clearSpamBan: (id: number) => adminRequest<{ message: string }>(`/api/admin/users/${id}/clear-spam-ban`, { method: 'PUT' }),
      getSettings: () => adminRequest<Record<string, string>>('/api/admin/security-settings'),
      saveSettings: (data: Record<string, string>) =>
        adminRequest<void>('/api/admin/security-settings', { method: 'POST', body: JSON.stringify(data) }),
    },
  },

  contact: {
    submit: (data: { name: string; email: string; phone: string; subject: string; message: string }) =>
      request<{ message: string }>('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      }),
  },

  campaigns: {
    getPublic: () => request<ApiCampaign[]>('/api/public/campaigns'),
    getMyJoins: () => adminRequest<number[]>('/api/campaigns/my-joins'),
    getEligibleCodes: () => adminRequest<Record<string, string>>('/api/campaigns/eligible-codes'),
    join: (campaignId: number) =>
      adminRequest<{ message: string }>(`/api/campaigns/${campaignId}/join`, { method: 'POST' }),
  },

  returns: {
    getMy: () => adminRequest<ApiReturnRequest[]>('/api/returns'),
    create: (data: { orderId: number; type: string; reason: string }) =>
      adminRequest<{ id: number; status: string; createdAt: string }>('/api/returns', {
        method: 'POST', body: JSON.stringify(data),
      }),
    cancel: (id: number) => adminRequest<void>(`/api/returns/${id}`, { method: 'DELETE' }),
  },

  questions: {
    getByProduct: (productId: number) =>
      request<ApiProductQuestion[]>(`/api/questions/product/${productId}`),
    ask: (productId: number, question: string) =>
      adminRequest<ApiProductQuestion>('/api/questions', {
        method: 'POST', body: JSON.stringify({ productId, question }),
      }),
  },

  variants: {
    getByProduct: (productId: number) =>
      request<ApiProductVariant[]>(`/api/products/${productId}/variants`),
  },

  abandonedCart: {
    track: (data: { items: { productId: number; productName: string; quantity: number; unitPrice: number; imageUrl: string | null }[]; total: number }) =>
      adminRequest<void>('/api/abandoned-cart/track', { method: 'POST', body: JSON.stringify(data) }),
    clear: () => adminRequest<void>('/api/abandoned-cart', { method: 'DELETE' }),
  },

  loyalty: {
    getBalance: () => adminRequest<{ points: number; transactions: { id: number; points: number; type: string; description: string; createdAt: string }[] }>('/api/loyalty'),
    redeem: (points: number) => adminRequest<{ discount: number; remainingPoints: number }>('/api/loyalty/redeem', { method: 'POST', body: JSON.stringify({ points }) }),
    cancelRedeem: () => adminRequest<void>('/api/loyalty/redeem/cancel', { method: 'DELETE' }),
    getLeaderboard: () => request<{ name: string; points: number; referralCount: number }[]>('/api/loyalty/leaderboard'),
    getMyRank: () => adminRequest<{ rank: number; points: number }>('/api/loyalty/leaderboard/my-rank'),
    giftPoints: (receiverEmail: string, points: number) =>
      adminRequest<{ message: string; remainingPoints: number }>('/api/loyalty/gift', {
        method: 'POST', body: JSON.stringify({ receiverEmail, points }),
      }),
  },

  blog: {
    getAll: (category?: string) => {
      const qs = category ? `?category=${encodeURIComponent(category)}` : '';
      return request<ApiBlogPost[]>(`/api/blogs${qs}`);
    },
    getBySlug: (slug: string) => request<ApiBlogPost>(`/api/blogs/${slug}`),
    adminGetAll: () => adminRequest<ApiBlogPost[]>('/api/blogs/admin/all'),
    create: (data: Omit<ApiBlogPost, 'id' | 'createdAt'>) =>
      adminRequest<ApiBlogPost>('/api/blogs', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: Omit<ApiBlogPost, 'id' | 'createdAt'>) =>
      adminRequest<ApiBlogPost>(`/api/blogs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => adminRequest<void>(`/api/blogs/${id}`, { method: 'DELETE' }),
  },

  referral: {
    getMyCode: () => adminRequest<{ code: string; referralCount: number; earnedPoints: number }>('/api/referral'),
    validate: (code: string) => request<{ valid: boolean }>(`/api/referral/validate/${encodeURIComponent(code)}`),
  },

  giftCards: {
    validate: (code: string) => request<{ balance: number; amount: number }>(`/api/giftcards/validate/${encodeURIComponent(code)}`),
    use: (code: string, orderTotal: number) =>
      adminRequest<{ applied: number; remainingBalance: number }>('/api/giftcards/use', {
        method: 'POST', body: JSON.stringify({ code, orderTotal }),
      }),
    adminGetAll: () => adminRequest<ApiGiftCard[]>('/api/giftcards'),
    adminCreate: (data: { amount: number; code?: string; expiresAt?: string; note?: string }) =>
      adminRequest<ApiGiftCard>('/api/giftcards', { method: 'POST', body: JSON.stringify(data) }),
    adminDelete: (id: number) => adminRequest<void>(`/api/giftcards/${id}`, { method: 'DELETE' }),
  },

  projects: {
    getAll: () => request<ApiProjectReference[]>('/api/projects'),
    adminGetAll: () => adminRequest<ApiProjectReference[]>('/api/projects/admin'),
    adminCreate: (data: Omit<ApiProjectReference, 'id'>) =>
      adminRequest<ApiProjectReference>('/api/projects/admin', { method: 'POST', body: JSON.stringify(data) }),
    adminUpdate: (id: number, data: Omit<ApiProjectReference, 'id'>) =>
      adminRequest<ApiProjectReference>(`/api/projects/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    adminDelete: (id: number) =>
      adminRequest<void>(`/api/projects/admin/${id}`, { method: 'DELETE' }),
  },

  quote: {
    create: (data: { fullName: string; email: string; phone: string; companyName?: string; city: string; projectType: string; systemSize: string; roof: string; monthlyBill?: number; note?: string }) =>
      request<{ id: number; message: string }>('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...((() => { const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null; return t ? { Authorization: `Bearer ${t}` } : {}; })()) },
        body: JSON.stringify(data),
      }),
    getMy: () => adminRequest<{ id: number; projectType: string; systemSize: string; city: string; status: string; adminNote: string | null; createdAt: string }[]>('/api/quote/my'),
    adminGetAll: (status?: string, page = 1) => {
      const qs = new URLSearchParams({ page: String(page) });
      if (status) qs.set('status', status);
      return adminRequest<{ total: number; items: ApiQuoteRequest[] }>(`/api/quote/admin?${qs}`);
    },
    adminUpdate: (id: number, data: { status: string; adminNote?: string }) =>
      adminRequest<{ id: number; status: string; adminNote: string | null }>(`/api/quote/admin/${id}`, {
        method: 'PUT', body: JSON.stringify(data),
      }),
  },

  installation: {
    create: (data: { fullName: string; email: string; phone: string; address: string; city: string; installationType: string; systemSize: string; note?: string }) =>
      request<{ id: number; message: string }>('/api/installation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...((() => { const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null; return t ? { Authorization: `Bearer ${t}` } : {}; })()) },
        body: JSON.stringify(data),
      }),
    getMy: () => adminRequest<{ id: number; installationType: string; systemSize: string; city: string; status: string; adminNote: string | null; createdAt: string }[]>('/api/installation/my'),
    adminGetAll: (status?: string, page = 1) => {
      const qs = new URLSearchParams({ page: String(page) });
      if (status) qs.set('status', status);
      return adminRequest<{ total: number; items: ApiInstallationRequest[] }>(`/api/installation/admin?${qs}`);
    },
    adminUpdate: (id: number, data: { status: string; adminNote?: string }) =>
      adminRequest<{ id: number; status: string; adminNote: string | null }>(`/api/installation/admin/${id}`, {
        method: 'PUT', body: JSON.stringify(data),
      }),
  },

  bulkOrder: {
    create: (data: { companyName: string; contactName: string; email: string; phone: string; city: string; itemsJson: string; deliveryAddress: string; note?: string }) =>
      request<{ id: number; message: string }>('/api/bulk-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...((() => { const t = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null; return t ? { Authorization: `Bearer ${t}` } : {}; })()) },
        body: JSON.stringify(data),
      }),
    getMy: () => adminRequest<{ id: number; companyName: string; status: string; adminNote: string | null; createdAt: string }[]>('/api/bulk-order/my'),
    adminGetAll: (status?: string, page = 1) => {
      const qs = new URLSearchParams({ page: String(page) });
      if (status) qs.set('status', status);
      return adminRequest<{ total: number; items: ApiBulkOrderRequest[] }>(`/api/bulk-order/admin?${qs}`);
    },
    adminUpdate: (id: number, data: { status: string; adminNote?: string }) =>
      adminRequest<{ id: number; status: string; adminNote: string | null }>(`/api/bulk-order/admin/${id}`, {
        method: 'PUT', body: JSON.stringify(data),
      }),
  },

  warranty: {
    getMy: () => adminRequest<ApiWarrantyRegistration[]>('/api/warranty/my'),
    register: (orderId: number, productId: number, serialNumber: string) =>
      adminRequest<ApiWarrantyRegistration>('/api/warranty', {
        method: 'POST', body: JSON.stringify({ orderId, productId, serialNumber }),
      }),
    adminGetAll: (page = 1) => adminRequest<{ total: number; items: ApiWarrantyRegistration[] }>(`/api/warranty/admin?page=${page}`),
  },

  bundles: {
    getAll: () => request<ApiBundle[]>('/api/bundles'),
    getAllAdmin: () => adminRequest<ApiBundle[]>('/api/bundles/admin-all'),
    getById: (id: number) => request<ApiBundle>(`/api/bundles/${id}`),
    create: (data: BundleUpsertPayload) =>
      adminRequest<{ id: number }>('/api/bundles', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: BundleUpsertPayload) =>
      adminRequest<{ id: number }>(`/api/bundles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) => adminRequest<void>(`/api/bundles/${id}`, { method: 'DELETE' }),
  },
};
