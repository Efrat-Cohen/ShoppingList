export type Category = {
  id: number;
  name: string;
};

export type Product = {
  id: number;
  name: string;
  unit: string;
  categoryId: number;
};

// What GET /api/catalog answers with: the two resources behind this service, fetched in
// parallel and handed over in one response. Both stay flat - products carry their
// categoryId, and the client filters by it.
export type Catalog = {
  categories: Category[];
  products: Product[];
};

export type Customer = {
  fullName: string;
  address: string;
  email: string;
};

// A cart line after the catalog lookup: what the orders service stores and answers with.
// The client sends the ids and the quantity, this service fills in the rest.
export type OrderItem = {
  productId: number;
  productName: string;
  categoryId: number;
  categoryName: string;
  unit: string;
  quantity: number;
};

export type CreateOrderRequest = {
  customer: Customer;
  items: OrderItem[];
};

export type FieldError = {
  field: string;
  code: string;
};

// Raised when one of the two services behind this one answers with a failure. Carries the
// status and codes to pass on, so an upstream 400 does not become a 500 here.
export class UpstreamError extends Error {
  constructor(
    readonly status: number,
    readonly errors: FieldError[],
  ) {
    super(`upstream responded with ${status}`);
    this.name = 'UpstreamError';
  }
}
