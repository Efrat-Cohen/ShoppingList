import type { Category, Order, Product } from '../types';
import type { CreateOrderInput } from '../schemas/order';

// The two ports this service is written against, each mirroring the resources the service
// behind it exposes. Routers depend on these interfaces; only the composition root in
// index.ts knows which implementation is behind them.
export interface CatalogService {
  getCategories(): Promise<Category[]>;
  getProducts(): Promise<Product[]>;
}

export interface OrdersService {
  createOrder(order: CreateOrderInput): Promise<{ orderId: string }>;
  getOrder(orderId: string): Promise<Order | null>;
}
