import { Router } from 'express';
import { orderDraftSchema, toFieldErrors } from '../schemas/order';
import type { CatalogService, OrdersService } from '../services/types';
import type { OrderItem, Product } from '../types';

export function createOrdersRouter(catalog: CatalogService, orders: OrdersService): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    const parsed = orderDraftSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ errors: toFieldErrors(parsed.error) });
      return;
    }

    const index = await buildProductIndex(catalog);
    const items: OrderItem[] = [];

    for (const line of parsed.data.items) {
      const product = index.get(line.productId);

      if (!product) {
        res.status(400).json({ errors: [{ field: 'items', code: 'unknown_product' }] });
        return;
      }

      items.push({ ...product, quantity: line.quantity });
    }

    const created = await orders.createOrder({ customer: parsed.data.customer, items });
    res.status(201).json(created);
  });

  router.get('/:orderId', async (req, res) => {
    const order = await orders.getOrder(req.params.orderId);

    if (!order) {
      res.status(404).json({ errors: [{ field: 'orderId', code: 'not_found' }] });
      return;
    }

    res.json(order);
  });

  return router;
}

type ResolvedProduct = Omit<OrderItem, 'quantity'>;

// Product names, units and categories come from the catalog rather than from the request,
// so a client cannot decide what it is ordering by editing the payload.
async function buildProductIndex(catalog: CatalogService): Promise<Map<number, ResolvedProduct>> {
  const categories = await catalog.getCategories();
  const index = new Map<number, ResolvedProduct>();

  for (const category of categories) {
    for (const product of category.products as Product[]) {
      index.set(product.id, {
        productId: product.id,
        productName: product.name,
        unit: product.unit,
        categoryId: category.id,
        categoryName: category.name,
      });
    }
  }

  return index;
}
