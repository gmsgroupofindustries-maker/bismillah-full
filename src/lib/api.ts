import {
  Product,
  Category,
  Brand,
  BikeBrand,
  Order,
  FilterState,
} from '../types.ts';

const API_BASE = '/api';

export function getAdminToken(): string | null {
  return localStorage.getItem('bm_admin_token');
}

export function setAdminToken(token: string) {
  localStorage.setItem('bm_admin_token', token);
}

export function removeAdminToken() {
  localStorage.removeItem('bm_admin_token');
}

export async function fetchProducts(filters: FilterState = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.brand) params.append('brand', filters.brand);
  if (filters.bikeBrand) params.append('bikeBrand', filters.bikeBrand);
  if (filters.bikeModel) params.append('bikeModel', filters.bikeModel);
  if (filters.search) params.append('search', filters.search);
  if (filters.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
  if (filters.inStock) params.append('inStock', 'true');
  if (filters.isFeatured) params.append('isFeatured', 'true');
  if (filters.isPopular) params.append('isPopular', 'true');
  if (filters.sort) params.append('sort', filters.sort);
  if (filters.page) params.append('page', String(filters.page));
  params.append('limit', '16');

  const res = await fetch(`${API_BASE}/products?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json() as Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  }>;
}

export async function fetchProductBySlug(slug: string) {
  const res = await fetch(`${API_BASE}/products/${slug}`);
  if (!res.ok) throw new Error('Failed to fetch product details');
  return res.json() as Promise<{ product: Product; relatedProducts: Product[] }>;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchBrands(): Promise<Brand[]> {
  const res = await fetch(`${API_BASE}/brands`);
  if (!res.ok) throw new Error('Failed to fetch brands');
  return res.json();
}

export async function fetchBikeBrands(): Promise<BikeBrand[]> {
  const res = await fetch(`${API_BASE}/bike-brands`);
  if (!res.ok) throw new Error('Failed to fetch bike brands');
  return res.json();
}

export async function fetchDistricts(): Promise<{ districts: string[]; shopInfo: any }> {
  const res = await fetch(`${API_BASE}/districts`);
  if (!res.ok) throw new Error('Failed to fetch districts');
  return res.json();
}

export async function createOrder(orderData: {
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  customerAddress: string;
  customerDistrict: string;
  notes?: string;
  items: Array<{ productId: number; quantity: number }>;
}) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to place order');
  return data as {
    success: boolean;
    order: Order;
    whatsappMessage: string;
    whatsappUrl: string;
  };
}

export async function trackOrder(orderNumber: string, phone?: string) {
  const params = new URLSearchParams();
  if (phone) params.append('phone', phone);
  const res = await fetch(`${API_BASE}/orders/track/${encodeURIComponent(orderNumber)}?${params.toString()}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to track order');
  return data as Order;
}

// Admin APIs
export async function adminLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Authentication failed');
  setAdminToken(data.token);
  return data;
}

export async function adminGoogleLogin(email: string) {
  const res = await fetch(`${API_BASE}/auth/google-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Google admin authentication failed');
  setAdminToken(data.token);
  return data;
}

export async function adminGetDashboard() {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/admin/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load dashboard metrics');
  return res.json();
}

export async function adminGetOrders(status?: string, search?: string, page = 1) {
  const token = getAdminToken();
  const params = new URLSearchParams({ page: String(page), limit: '20' });
  if (status && status !== 'all') params.append('status', status);
  if (search) params.append('search', search);

  const res = await fetch(`${API_BASE}/admin/orders?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load admin orders');
  return res.json();
}

export async function adminUpdateOrderStatus(orderId: number, status: string) {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update status');
  return res.json();
}

export async function adminSaveProduct(productData: any, id?: number) {
  const token = getAdminToken();
  const url = id ? `${API_BASE}/admin/products/${id}` : `${API_BASE}/admin/products`;
  const method = id ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save product');
  return data;
}

export async function adminDeleteProduct(id: number) {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/admin/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return res.json();
}

export async function adminUpdateStock(id: number, stock: number) {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}/admin/products/${id}/stock`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ stock }),
  });
  if (!res.ok) throw new Error('Failed to update stock');
  return res.json();
}
