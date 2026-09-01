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

// One page load, one request: the BFF puts the two catalog resources together.
export type Catalog = {
  categories: Category[];
  products: Product[];
};

export type CartItem = {
  productId: number;
  productName: string;
  categoryId: number;
  categoryName: string;
  unit: string;
  quantity: number;
};

export type Customer = {
  fullName: string;
  address: string;
  email: string;
};

// The orders API answers with stable codes rather than sentences; strings.errors turns
// them into Hebrew.
export type FieldError = {
  field: string;
  code: string;
};
