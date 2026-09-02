import type { Category, CreateOrderRequest, Order, Product } from '../types';

// The two ports this service is written against, each mirroring the resources the service
// behind it exposes. Routers depend on these interfaces; only the composition root in
// index.ts knows which implementation is behind them.
export interface CatalogService {
  getCategories(): Promise<Category[]>;
  getProducts(): Promise<Product[]>;
}

export interface OrdersService {
  createOrder(order: CreateOrderRequest): Promise<{ orderId: string }>;
  getOrder(orderId: string): Promise<Order | null>;
}
