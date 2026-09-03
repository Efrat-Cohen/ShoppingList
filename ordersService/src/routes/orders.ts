import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { es, ORDERS_INDEX } from '../es/client';
import { createOrderSchema, toFieldErrors } from '../schemas/order';

export const ordersRouter = Router();

// Express 5 forwards rejected promises to the error middleware, so this handler
// deliberately does not wrap everything in try/catch.
ordersRouter.post('/', async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ errors: toFieldErrors(parsed.error) });
    return;
  }

  const { customer, items } = parsed.data;

  const order = {
    orderId: randomUUID(),
    customer,
    items,
    createdAt: new Date().toISOString(),
  };

  // refresh: 'wait_for' means the order is searchable by the time we answer 201, without
  // forcing a full index refresh.
  await es.index({
    index: ORDERS_INDEX,
    id: order.orderId,
    document: order,
    refresh: 'wait_for',
  });

  res.status(201).json(order);
});
