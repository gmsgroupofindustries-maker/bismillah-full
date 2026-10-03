export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  _count?: {
    products: number;
  };
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string | null;
  _count?: {
    products: number;
  };
}

export interface BikeModel {
  id: number;
  name: string;
  slug: string;
  bikeBrandId: number;
  _count?: {
    products: number;
  };
}

export interface BikeBrand {
  id: number;
  name: string;
  slug: string;
  models: BikeModel[];
  _count?: {
    products: number;
  };
}

export interface ProductImage {
  id: number;
  url: string;
  isPrimary: boolean;
  productId: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  isFeatured: boolean;
  isPopular: boolean;
  categoryId: number;
  category: Category;
  brandId: number;
  brand: Brand;
  bikeBrandId?: number | null;
  bikeBrand?: BikeBrand | null;
  bikeModelId?: number | null;
  bikeModel?: BikeModel | null;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId?: number | null;
  productName: string;
  productSku: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string;
  customerAddress: string;
  customerDistrict: string;
  notes?: string | null;
  totalAmount: number;
  deliveryFee: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  category?: string;
  brand?: string;
  bikeBrand?: string;
  bikeModel?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  sort?: string;
  page?: number;
}

export interface AdminUser {
  userId: number;
  email: string;
  name: string;
  role: string;
}
