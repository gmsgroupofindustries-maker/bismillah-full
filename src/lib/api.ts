import {
  Product,
  Category,
  Brand,
  BikeBrand,
  Order,
  FilterState,
} from '../types.ts';
import { db } from './firebase.ts';
import { collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';

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

// Memory cache for static data fallbacks (used when hosting on cPanel without Node.js)
let cachedProducts: Product[] | null = null;
let cachedCategories: Category[] | null = null;
let cachedBrands: Brand[] | null = null;
let cachedBikeBrands: BikeBrand[] | null = null;
let cachedDistrictsData: { districts: string[]; shopInfo: any } | null = null;

// Helper to safely check if a response is valid JSON
async function parseJsonSafely(res: Response): Promise<any> {
  const contentType = res.headers.get('content-type') || '';
  if (!res.ok || !contentType.includes('application/json')) {
    throw new Error('Non-JSON response or endpoint missing');
  }
  return res.json();
}

// -------------------------------------------------------------
// 1. PRODUCTS & CATALOG
// -------------------------------------------------------------
export async function fetchProducts(filters: FilterState = {}) {
  try {
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
    return await parseJsonSafely(res);
  } catch (err) {
    // Static Fallback for cPanel (Apache) without active Node server
    if (!cachedProducts) {
      const fallbackRes = await fetch('/data/products.json');
      cachedProducts = await fallbackRes.json();
    }

    let items = [...(cachedProducts || [])];

    if (filters.category) {
      const cat = filters.category.toLowerCase();
      items = items.filter((p) => p.category?.slug.toLowerCase() === cat);
    }

    if (filters.brand) {
      const b = filters.brand.toLowerCase();
      items = items.filter((p) => p.brand?.slug.toLowerCase() === b);
    }

    if (filters.bikeBrand) {
      const bb = filters.bikeBrand.toLowerCase();
      items = items.filter((p) => p.bikeBrand?.slug.toLowerCase() === bb || p.bikeBrand?.name.toLowerCase() === bb);
    }

    if (filters.bikeModel) {
      const bm = filters.bikeModel.toLowerCase();
      items = items.filter((p) => p.bikeModel?.slug.toLowerCase() === bm || p.bikeModel?.name.toLowerCase().includes(bm));
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (filters.minPrice !== undefined) {
      items = items.filter((p) => (p.discountPrice || p.price) >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      items = items.filter((p) => (p.discountPrice || p.price) <= filters.maxPrice!);
    }

    if (filters.inStock) {
      items = items.filter((p) => p.stock > 0);
    }

    if (filters.isFeatured) {
      items = items.filter((p) => p.isFeatured);
    }

    if (filters.isPopular) {
      items = items.filter((p) => p.isPopular);
    }

    // Sorting
    switch (filters.sort) {
      case 'price-asc':
        items.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price-desc':
        items.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'name-asc':
        items.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        items.sort((a, b) => b.id - a.id);
        break;
    }

    const total = items.length;
    const page = filters.page ? parseInt(String(filters.page), 10) : 1;
    const limit = 16;
    const totalPages = Math.ceil(total / limit) || 1;
    const start = (page - 1) * limit;
    const paginatedProducts = items.slice(start, start + limit);

    return {
      products: paginatedProducts,
      total,
      page,
      totalPages,
      limit,
    };
  }
}

export async function fetchProductBySlug(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/products/${slug}`);
    return await parseJsonSafely(res);
  } catch (err) {
    if (!cachedProducts) {
      const fallbackRes = await fetch('/data/products.json');
      cachedProducts = await fallbackRes.json();
    }

    const product = cachedProducts?.find((p) => p.slug === slug);
    if (!product) {
      throw new Error('Product not found');
    }

    const relatedProducts = (cachedProducts || [])
      .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
      .slice(0, 4);

    return { product, relatedProducts };
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    return await parseJsonSafely(res);
  } catch (err) {
    if (!cachedCategories) {
      const fallbackRes = await fetch('/data/categories.json');
      cachedCategories = await fallbackRes.json();
    }
    return cachedCategories || [];
  }
}

export async function fetchBrands(): Promise<Brand[]> {
  try {
    const res = await fetch(`${API_BASE}/brands`);
    return await parseJsonSafely(res);
  } catch (err) {
    if (!cachedBrands) {
      const fallbackRes = await fetch('/data/brands.json');
      cachedBrands = await fallbackRes.json();
    }
    return cachedBrands || [];
  }
}

export async function fetchBikeBrands(): Promise<BikeBrand[]> {
  try {
    const res = await fetch(`${API_BASE}/bike-brands`);
    return await parseJsonSafely(res);
  } catch (err) {
    if (!cachedBikeBrands) {
      const fallbackRes = await fetch('/data/bike-brands.json');
      cachedBikeBrands = await fallbackRes.json();
    }
    return cachedBikeBrands || [];
  }
}

export async function fetchDistricts(): Promise<{ districts: string[]; shopInfo: any }> {
  try {
    const res = await fetch(`${API_BASE}/districts`);
    return await parseJsonSafely(res);
  } catch (err) {
    if (!cachedDistrictsData) {
      const fallbackRes = await fetch('/data/districts.json');
      cachedDistrictsData = await fallbackRes.json();
    }
    return cachedDistrictsData || { districts: [], shopInfo: {} };
  }
}

// -------------------------------------------------------------
// 2. CHECKOUT & ORDERING (WORKS WITH API & CLIENT-SIDE CPANEL)
// -------------------------------------------------------------
export async function createOrder(orderData: {
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  customerAddress: string;
  customerDistrict: string;
  notes?: string;
  items: Array<{ productId: number; quantity: number }>;
}) {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    return await parseJsonSafely(res);
  } catch (err) {
    // Static / Direct-to-Firestore Fallback for cPanel
    if (!cachedProducts) {
      const fallbackRes = await fetch('/data/products.json');
      cachedProducts = await fallbackRes.json();
    }

    const isInsideJashore = orderData.customerDistrict.toLowerCase().trim() === 'jashore';
    const deliveryFee = isInsideJashore ? 60 : 130;

    let subtotal = 0;
    const orderItems = orderData.items.map((item) => {
      const product = cachedProducts?.find((p) => p.id === item.productId);
      const price = product ? (product.discountPrice || product.price) : 0;
      const itemSubtotal = price * item.quantity;
      subtotal += itemSubtotal;
      return {
        id: Math.floor(Math.random() * 10000),
        orderId: 0,
        productId: item.productId,
        productName: product ? product.name : `Product #${item.productId}`,
        productSku: product ? product.sku : 'N/A',
        price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
        product,
      };
    });

    const totalAmount = subtotal + deliveryFee;
    const orderNumber = `BM-${Date.now().toString().slice(-6)}`;

    const order: Order = {
      id: Math.floor(Math.random() * 100000),
      orderNumber,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerWhatsapp: orderData.customerWhatsapp,
      customerAddress: orderData.customerAddress,
      customerDistrict: orderData.customerDistrict,
      notes: orderData.notes,
      totalAmount,
      deliveryFee,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: orderItems,
    };

    // Save to Firestore if available
    try {
      await addDoc(collection(db, 'orders'), {
        ...order,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (fsErr) {
      console.warn('Firestore order backup notice:', fsErr);
    }

    // Save to localStorage as backup
    try {
      const existing = JSON.parse(localStorage.getItem('bm_local_orders') || '[]');
      existing.unshift(order);
      localStorage.setItem('bm_local_orders', JSON.stringify(existing.slice(0, 50)));
    } catch (storageErr) {
      // Ignore
    }

    // Build WhatsApp Message
    const formattedPhone = '8801737979880';
    let msg = `🏍️ *New Order from Bismillah Motors Website!*\n\n`;
    msg += `*Order ID:* ${orderNumber}\n`;
    msg += `*Customer:* ${orderData.customerName}\n`;
    msg += `*Phone:* ${orderData.customerPhone}\n`;
    msg += `*WhatsApp:* ${orderData.customerWhatsapp}\n`;
    msg += `*Address:* ${orderData.customerAddress}, ${orderData.customerDistrict}\n\n`;
    msg += `*Ordered Items:*\n`;
    orderItems.forEach((i, idx) => {
      msg += `${idx + 1}. ${i.productName} (x${i.quantity}) - ৳${i.subtotal}\n`;
    });
    msg += `\n*Delivery Fee:* ৳${deliveryFee} (${orderData.customerDistrict})`;
    msg += `\n*Total Amount:* ৳${totalAmount}`;
    if (orderData.notes) {
      msg += `\n*Special Note:* ${orderData.notes}`;
    }
    msg += `\n\n*Payment Method:* Cash on Delivery (ক্যাশ অন ডেলিভারি)`;

    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(msg)}`;

    return {
      success: true,
      order,
      whatsappMessage: msg,
      whatsappUrl,
    };
  }
}

export async function trackOrder(orderNumber: string, phone?: string) {
  try {
    const params = new URLSearchParams();
    if (phone) params.append('phone', phone);
    const res = await fetch(`${API_BASE}/orders/track/${encodeURIComponent(orderNumber)}?${params.toString()}`);
    return await parseJsonSafely(res);
  } catch (err) {
    // Check localStorage fallback
    const localOrders: Order[] = JSON.parse(localStorage.getItem('bm_local_orders') || '[]');
    const found = localOrders.find((o) => o.orderNumber.toUpperCase() === orderNumber.toUpperCase().trim());
    if (found) return found;

    // Check Firestore fallback
    try {
      const docRef = doc(db, 'orders', orderNumber);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as Order;
      }
    } catch (e) {
      // Ignore
    }

    throw new Error('Order not found with the provided details');
  }
}

// -------------------------------------------------------------
// 3. ADMIN PORTAL APIS
// -------------------------------------------------------------
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
