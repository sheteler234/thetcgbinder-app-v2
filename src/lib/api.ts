import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { 
  Product, 
  Category, 
  User, 
  Order, 
  CartItem, 
  ApiResponse, 
  PaginatedResponse, 
  SearchFilters,
  LoginCredentials,
  RegisterData,
  CheckoutData,
  AuthTokens
} from './types';

class ApiClient {
  private client: AxiosInstance;
  private baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  constructor() {
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('access_token', response.data.accessToken);
              localStorage.setItem('refresh_token', response.data.refreshToken);
              
              // Retry original request
              error.config.headers.Authorization = `Bearer ${response.data.accessToken}`;
              return this.client.request(error.config);
            } catch {
              this.clearTokens();
              window.location.href = '/auth/login';
            }
          } else {
            this.clearTokens();
            window.location.href = '/auth/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const response: AxiosResponse<ApiResponse<{ user: User; tokens: AuthTokens }>> = 
      await this.client.post('/auth/login', credentials);
    return response.data;
  }

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    const response: AxiosResponse<ApiResponse<{ user: User; tokens: AuthTokens }>> = 
      await this.client.post('/auth/register', data);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    const response: AxiosResponse<ApiResponse<AuthTokens>> = 
      await this.client.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  async logout(): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = 
      await this.client.post('/auth/logout');
    this.clearTokens();
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = 
      await this.client.get('/auth/me');
    return response.data;
  }

  // Product endpoints
  async getProducts(filters?: SearchFilters): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(item => params.append(`${key}[]`, item.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response: AxiosResponse<PaginatedResponse<Product>> = 
      await this.client.get(`/products?${params.toString()}`);
    return response.data;
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    const response: AxiosResponse<ApiResponse<Product>> = 
      await this.client.get(`/products/${id}`);
    return response.data;
  }

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Product>> {
    const response: AxiosResponse<ApiResponse<Product>> = 
      await this.client.post('/products', product);
    return response.data;
  }

  async updateProduct(id: string, product: Partial<Product>): Promise<ApiResponse<Product>> {
    const response: AxiosResponse<ApiResponse<Product>> = 
      await this.client.put(`/products/${id}`, product);
    return response.data;
  }

  async deleteProduct(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = 
      await this.client.delete(`/products/${id}`);
    return response.data;
  }

  // Category endpoints
  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response: AxiosResponse<ApiResponse<Category[]>> = 
      await this.client.get('/categories');
    return response.data;
  }

  async getCategory(id: string): Promise<ApiResponse<Category>> {
    const response: AxiosResponse<ApiResponse<Category>> = 
      await this.client.get(`/categories/${id}`);
    return response.data;
  }

  async createCategory(category: Omit<Category, 'id'>): Promise<ApiResponse<Category>> {
    const response: AxiosResponse<ApiResponse<Category>> = 
      await this.client.post('/categories', category);
    return response.data;
  }

  async updateCategory(id: string, category: Partial<Category>): Promise<ApiResponse<Category>> {
    const response: AxiosResponse<ApiResponse<Category>> = 
      await this.client.put(`/categories/${id}`, category);
    return response.data;
  }

  async deleteCategory(id: string): Promise<ApiResponse<null>> {
    const response: AxiosResponse<ApiResponse<null>> = 
      await this.client.delete(`/categories/${id}`);
    return response.data;
  }

  // Order endpoints
  async getOrders(): Promise<ApiResponse<Order[]>> {
    const response: AxiosResponse<ApiResponse<Order[]>> = 
      await this.client.get('/orders');
    return response.data;
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    const response: AxiosResponse<ApiResponse<Order>> = 
      await this.client.get(`/orders/${id}`);
    return response.data;
  }

  async createOrder(orderData: CheckoutData & { items: CartItem[] }): Promise<ApiResponse<Order>> {
    const response: AxiosResponse<ApiResponse<Order>> = 
      await this.client.post('/orders', orderData);
    return response.data;
  }

  // Search endpoint
  async searchProducts(query: string): Promise<ApiResponse<Product[]>> {
    const response: AxiosResponse<ApiResponse<Product[]>> = 
      await this.client.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  // Upload endpoint for images
  async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('image', file);

    const response: AxiosResponse<ApiResponse<{ url: string }>> = 
      await this.client.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    return response.data;
  }

  // Stripe payment intent
  async createPaymentIntent(amount: number): Promise<ApiResponse<{ clientSecret: string }>> {
    const response: AxiosResponse<ApiResponse<{ clientSecret: string }>> = 
      await this.client.post('/payments/create-intent', { amount });
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;

// Mock API for development (when backend is not available)
export class MockApiClient {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'danielshalar5@gmail.com',
      name: 'Daniel Shalar',
      role: 'admin',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      email: 'user@example.com',
      name: 'Test User',
      role: 'customer',
      createdAt: new Date().toISOString(),
    },
  ];

  private currentUser: User | null = null;

  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    await this.delay(1000);
    
    const user = this.mockUsers.find(u => u.email === credentials.email);
    
    if (!user || (credentials.email === 'danielshalar5@gmail.com' && credentials.password !== 'admin1234@')) {
      throw new Error('Invalid credentials');
    }
    
    if (credentials.email !== 'danielshalar5@gmail.com' && credentials.password !== 'password123') {
      throw new Error('Invalid credentials');
    }

    const tokens: AuthTokens = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: Date.now() + 3600000, // 1 hour
    };

    this.currentUser = user;
    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);

    return {
      data: { user, tokens },
      message: 'Login successful',
    };
  }

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    await this.delay(1000);

    const existingUser = this.mockUsers.find(u => u.email === data.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };

    this.mockUsers.push(newUser);

    const tokens: AuthTokens = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresAt: Date.now() + 3600000,
    };

    this.currentUser = newUser;
    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);

    return {
      data: { user: newUser, tokens },
      message: 'Registration successful',
    };
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    await this.delay(500);
    
    if (!this.currentUser) {
      const token = localStorage.getItem('access_token');
      if (token === 'mock-access-token') {
        this.currentUser = this.mockUsers[0]; // Default to admin for mock
      } else {
        throw new Error('Not authenticated');
      }
    }

    return {
      data: this.currentUser,
    };
  }

  async logout(): Promise<ApiResponse<null>> {
    await this.delay(500);
    this.currentUser = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    return {
      data: null,
      message: 'Logout successful',
    };
  }
}

export const mockApiClient = new MockApiClient();
