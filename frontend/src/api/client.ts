import axios from 'axios';
import type { LoginInput, Order, OrderCreate, Product, TokenResponse, User } from '../types';

export const TOKEN_KEY = 'relic_access_token';
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/api', timeout: 12000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 &&
      !error.config?.url?.includes('/auth/login')) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('relic:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export const catalogApi = {
  list: async (): Promise<Product[]> => (await api.get<Product[]>('/products')).data,
  detail: async (id: number): Promise<Product> => (await api.get<Product>(`/products/${id}`)).data,
};
export const authApi = {
  login: async (payload: LoginInput): Promise<TokenResponse> => (await api.post<TokenResponse>('/auth/login', payload)).data,
  me: async (): Promise<User> => (await api.get<User>('/users/me')).data,
};
export const ordersApi = {
  list: async (): Promise<Order[]> => (await api.get<Order[]>('/orders')).data,
  create: async (payload: OrderCreate): Promise<Order> => (await api.post<Order>('/orders', payload)).data,
};

export function errorMessage(error: unknown): string {
  if (axios.isAxiosError<{ detail?: string }>(error)) {
    if (!error.response) return 'Сервер недоступен. Запусти FastAPI на порту 8000.';
    return error.response.data?.detail ?? `Ошибка сервера (${error.response.status})`;
  }
  return 'Произошла непредвиденная ошибка.';
}
