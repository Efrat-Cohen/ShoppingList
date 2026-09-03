import assert from 'node:assert/strict';
import test from 'node:test';
import { customer, fakeOrders, postJson, startApp } from '../testing/support';

test('stores the line the catalog describes, not the one the client sent', async (t) => {
  const orders = fakeOrders();
  const app = await startApp({ orders });
  t.after(app.close);

  const response = await app.request('/api/orders', postJson({
    customer,
    items: [{ productId: 10, categoryId: 1, quantity: 2 }],
  }));

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { orderId: 'order-1' });
  assert.deepEqual(orders.created[0]?.items, [{
    productId: 10,
    productName: 'בננות',
    categoryId: 1,
    categoryName: 'פירות וירקות',
    unit: 'ק"ג',
    quantity: 2,
  }]);
});

test('rejects a line whose product sits in a different category', async (t) => {
  const orders = fakeOrders();
  const app = await startApp({ orders });
  t.after(app.close);

  const response = await app.request('/api/orders', postJson({
    customer,
    items: [{ productId: 10, categoryId: 2, quantity: 1 }],
  }));

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    errors: [{ field: 'items.0.productId', code: 'unknown_product' }],
  });
  assert.deepEqual(orders.created, []);
});

// Without this the per-line quantity cap is bypassed by splitting a product across lines.
test('rejects the same product on two lines', async (t) => {
  const app = await startApp();
  t.after(app.close);

  const response = await app.request('/api/orders', postJson({
    customer,
    items: [
      { productId: 10, categoryId: 1, quantity: 60 },
      { productId: 10, categoryId: 1, quantity: 60 },
    ],
  }));

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    errors: [{ field: 'items', code: 'duplicate_product' }],
  });
});

test('answers a bad email with the code the client has a message for', async (t) => {
  const app = await startApp();
  t.after(app.close);

  const response = await app.request('/api/orders', postJson({
    customer: { ...customer, email: 'not-an-email' },
    items: [{ productId: 10, categoryId: 1, quantity: 1 }],
  }));

  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    errors: [{ field: 'customer.email', code: 'invalid_email' }],
  });
});
