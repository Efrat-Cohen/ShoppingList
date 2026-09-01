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

export type Customer = {
  fullName: string;
  address: string;
  email: string;
};

export type OrderItem = {
  productId: number;
  productName: string;
  categoryId: number;
  categoryName: string;
  unit: string;
  quantity: number;
};

export type Order = {
  orderId: string;
  customer: Customer;
  items: OrderItem[];
  createdAt: string;
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
