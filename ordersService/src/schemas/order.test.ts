import assert from 'node:assert/strict';
import test from 'node:test';
import { createOrderSchema, toFieldErrors } from './order';

const customer = {
  fullName: 'אפרת כהן',
  address: 'הרצל 1, תל אביב',
  email: 'efrat@example.com',
};

const bananas = {
  productId: 3,
  productName: 'בננות',
  categoryId: 1,
  categoryName: 'פירות וירקות',
  unit: 'ק"ג',
  quantity: 2,
};

// The route does exactly this and nothing else with a rejection, so the pairs asserted below
// are the ones the client receives and looks up in its strings file.
function errorsFor(body: unknown) {
  const parsed = createOrderSchema.safeParse(body);
  assert.equal(parsed.success, false, 'expected the order to be rejected');
  return toFieldErrors(parsed.error!);
}

test('accepts an order the client could plausibly send', () => {
  const parsed = createOrderSchema.safeParse({ customer, items: [bananas] });

  assert.equal(parsed.success, true);
  assert.deepEqual(parsed.data?.items, [bananas]);
});

// Without this the per-line quantity cap is bypassed by splitting a product across lines.
test('rejects the same product on two lines', () => {
  assert.deepEqual(
    errorsFor({ customer, items: [bananas, { ...bananas, quantity: 60 }] }),
    [{ field: 'items', code: 'duplicate_product' }],
  );
});

test('rejects a quantity above the cap', () => {
  assert.deepEqual(
    errorsFor({ customer, items: [{ ...bananas, quantity: 100 }] }),
    [{ field: 'items.0.quantity', code: 'invalid_quantity' }],
  );
});

test('rejects a fractional quantity', () => {
  assert.deepEqual(
    errorsFor({ customer, items: [{ ...bananas, quantity: 1.5 }] }),
    [{ field: 'items.0.quantity', code: 'invalid_quantity' }],
  );
});

test('rejects an empty cart', () => {
  assert.deepEqual(
    errorsFor({ customer, items: [] }),
    [{ field: 'items', code: 'empty_cart' }],
  );
});

test('rejects a name that is only whitespace', () => {
  assert.deepEqual(
    errorsFor({ customer: { ...customer, fullName: '   ' }, items: [bananas] }),
    [{ field: 'customer.fullName', code: 'required' }],
  );
});

test('rejects an address longer than the column holding it', () => {
  assert.deepEqual(
    errorsFor({ customer: { ...customer, address: 'א'.repeat(201) }, items: [bananas] }),
    [{ field: 'customer.address', code: 'too_long' }],
  );
});

test('names the customer field an invalid email sits in', () => {
  assert.deepEqual(
    errorsFor({ customer: { ...customer, email: 'not-an-email' }, items: [bananas] }),
    [{ field: 'customer.email', code: 'invalid_email' }],
  );
});

// A line the client mangled has to say which line and which property, not just "invalid".
test('points at the line and the property a bad item breaks on', () => {
  assert.deepEqual(
    errorsFor({ customer, items: [bananas, { ...bananas, productId: 4, unit: '' }] }),
    [{ field: 'items.1.unit', code: 'invalid_item' }],
  );
});

test('reports every field that failed rather than only the first', () => {
  const errors = errorsFor({
    customer: { fullName: '', address: '', email: 'nope' },
    items: [bananas],
  });

  assert.deepEqual(errors.map((error) => error.field), [
    'customer.fullName',
    'customer.address',
    'customer.email',
  ]);
});
