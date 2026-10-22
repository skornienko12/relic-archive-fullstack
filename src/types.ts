// Fields mirror backend/main.py Pydantic response models.
export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  size: string;
  featured: boolean;
}
export interface User { id: number; username: string }
export interface LoginInput { username: string; password: string }
export interface TokenResponse { access_token: string; token_type: 'bearer' }
export interface OrderItemInput { product_id: number; quantity: number }
export interface OrderCreate { items: OrderItemInput[] }
export interface Order { id: number; user_id: number; total: number; items: OrderItemInput[]; created_at: string }
export type RequestState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'data'; data: T };
