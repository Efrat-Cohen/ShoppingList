import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { createApp, type Dependencies } from '../app';
import type { CatalogService, OrdersService } from '../services/types';
import type { Category, CreateOrderRequest, Customer, Product } from '../types';

// A catalog small enough that a test can spell out the whole expected response.
export const categories: Category[] = [
  { id: 1, name: 'פירות וירקות' },
  { id: 2, name: 'מוצרי חלב' },
];

export const products: Product[] = [
  { id: 10, name: 'בננות', unit: 'ק"ג', categoryId: 1 },
  { id: 20, name: 'חלב', unit: 'ליטר', categoryId: 2 },
];

export const customer: Customer = {
  fullName: 'ישראלה ישראלי',
  address: 'הרצל 1, תל אביב',
  email: 'israela@example.com',
};

// The two ports the app is written against, as fakes. A test that cares about one method
// passes just that one and keeps the rest of the catalog behaving normally.
export function fakeCatalog(overrides: Partial<CatalogService> = {}): CatalogService {
  return {
    getCategories: async () => categories,
    getProducts: async () => products,
    ...overrides,
  };
}

export type FakeOrders = OrdersService & {
  // What the app actually handed on, so a test can assert on it rather than on a mock's
  // call log. This is the only way to see what the BFF resolved a line into.
  created: CreateOrderRequest[];
};

export function fakeOrders(overrides: Partial<OrdersService> = {}): FakeOrders {
  const created: CreateOrderRequest[] = [];

  return {
    created,
    createOrder: async (order) => {
      created.push(order);
      return { orderId: 'order-1' };
    },
    ...overrides,
  };
}

// Everything createApp needs, defaulted to fakes. Port 0 lets the OS pick, so test files
// run side by side without agreeing on a number.
export async function startApp(deps: Partial<Dependencies> = {}) {
  const app = createApp({
    catalog: fakeCatalog(),
    orders: fakeOrders(),
    allowedOrigins: [],
    ...deps,
  });

  const server = app.listen(0);
  await once(server, 'listening');
  const { port } = server.address() as AddressInfo;

  return {
    request: (path: string, init?: RequestInit) => fetch(`http://127.0.0.1:${port}${path}`, init),
    close: () => new Promise<void>((resolve) => {
      server.close(() => resolve());
    }),
  };
}

export function postJson(body: unknown): RequestInit {
  return {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}
