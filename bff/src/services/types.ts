import type { Category, Order } from '../types';
import type { CreateOrderInput } from '../schemas/order';

// The two ports this service is written against. Routers depend on these interfaces; only
// the composition root in index.ts knows which implementation is behind them.
export interface CatalogService {
  getCategories(): Promise<Category[]>;
}

export interface OrdersService {
  createOrder(order: CreateOrderInput): Promise<{ orderId: string }>;
  getOrder(orderId: string): Promise<Order | null>;
}
