export type Product = {
  id: number;
  name: string;
  unit: string;
};

export type Category = {
  id: number;
  name: string;
  products: Product[];
};

export type Customer = {
  fullName: string;
  address: string;
  email: string;
};

// What the browser sends: an id and a quantity. Nothing else is trusted from the client.
export type OrderLine = {
  productId: number;
  quantity: number;
};

// What the orders service stores, once this service has filled in the product details.
export type OrderItem = OrderLine & {
  productName: string;
  categoryId: number;
  categoryName: string;
  unit: string;
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
