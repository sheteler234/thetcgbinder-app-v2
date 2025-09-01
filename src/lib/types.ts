export interface Category {
  id: string;
  name: string;
  parentId?: string;
  description?: string;
  image?: string;
}

export interface Set {
  id: string;
  name: string;
  description?: string;
  image?: string;
  releaseDate?: string;
  code?: string;
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  categoryId: string;
  rarity?: string;
  number?: string;
  condition?: 'NM' | 'LP' | 'MP' | 'HP' | 'DMG';
  image: string;
  additionalImage1?: string;
  additionalImage2?: string;
  price: number;
  stock: number;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  qty: number;
  addedAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'admin' | 'customer';
  createdAt: string;
  avatar?: string;
}

export interface OrderItem {
  productId: string;
  qty: number;
  priceAtPurchase: number;
  title: string;
  image: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  status: 'paid' | 'pending' | 'failed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  statusHistory?: Array<{
    status: Order['status'];
    timestamp: string;
    note?: string;
  }>;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  paymentMethod: string;
  paymentId: string;
  trackingNumber?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchFilters {
  query?: string;
  categoryId?: string;
  rarity?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  sortBy?: 'title' | 'price' | 'createdAt' | 'stock';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CheckoutData {
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  paymentMethod: 'stripe' | 'paypal' | 'apple_pay';
  saveAddress?: boolean;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number;
  createdAt: string;
}

export interface BinderPageData {
  products: Product[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
}
