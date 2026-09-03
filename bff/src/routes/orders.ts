import { Router } from 'express';
import { createOrderSchema, toFieldErrors, type OrderItemInput } from '../schemas/order';
import type { CatalogService, OrdersService } from '../services/types';
import type { FieldError, OrderItem } from '../types';

export function createOrdersRouter(catalog: CatalogService, orders: OrdersService): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    const parsed = createOrderSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ errors: toFieldErrors(parsed.error) });
      return;
    }

    const resolved = await resolveItems(catalog, parsed.data.items);

    if ('errors' in resolved) {
      res.status(400).json({ errors: resolved.errors });
      return;
    }

    res.status(201).json(await orders.createOrder({
      customer: parsed.data.customer,
      items: resolved.items,
    }));
  });

  // There is deliberately no route for reading an order back. A stored order holds a name,
  // an address and an email, and nothing in front of this service authenticates anyone.

  return router;
}

// The client sends ids and a quantity; the name, unit and category name come from the
// catalog. A line naming a product that does not exist, or one that sits in a different
// category than the client thinks, is rejected rather than stored as the client described it.
async function resolveItems(
  catalog: CatalogService,
  items: OrderItemInput[],
): Promise<{ items: OrderItem[] } | { errors: FieldError[] }> {
  const [categories, products] = await Promise.all([
    catalog.getCategories(),
    catalog.getProducts(),
  ]);

  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const productsById = new Map(products.map((product) => [product.id, product]));

  const resolved: OrderItem[] = [];
  const errors: FieldError[] = [];

  items.forEach((item, index) => {
    const product = productsById.get(item.productId);
    const category = product && categoriesById.get(product.categoryId);

    if (!product || !category || product.categoryId !== item.categoryId) {
      errors.push({ field: `items.${index}.productId`, code: 'unknown_product' });
      return;
    }

    resolved.push({
      productId: product.id,
      productName: product.name,
      categoryId: category.id,
      categoryName: category.name,
      unit: product.unit,
      quantity: item.quantity,
    });
  });

  return errors.length > 0 ? { errors } : { items: resolved };
}
