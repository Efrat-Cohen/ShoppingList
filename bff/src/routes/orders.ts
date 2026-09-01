import { Router } from 'express';
import { createOrderSchema, toFieldErrors } from '../schemas/order';
import type { OrdersService } from '../services/types';

export function createOrdersRouter(orders: OrdersService): Router {
  const router = Router();

  router.post('/', async (req, res) => {
    const parsed = createOrderSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ errors: toFieldErrors(parsed.error) });
      return;
    }

    res.status(201).json(await orders.createOrder(parsed.data));
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
