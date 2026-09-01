import type { Category, Customer, OrderItem } from '../types';

// The two ports this service is written against. Routers depend on these interfaces; only
// the composition root in index.ts knows which implementation is behind them.
export interface CatalogService {
  getCategories(): Promise<Category[]>;
}

export interface OrdersService {
  createOrder(order: { customer: Customer; items: OrderItem[] }): Promise<{ orderId: string }>;
  getOrder(orderId: string): Promise<unknown | null>;
}
