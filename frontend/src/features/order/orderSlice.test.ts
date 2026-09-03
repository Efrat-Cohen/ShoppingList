import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import reducer, { submitOrder } from './orderSlice';
import { addItem } from '../cart/cartSlice';
import type { CartItem, Customer } from '../../types';

const customer: Customer = {
  fullName: 'ישראלה ישראלי',
  address: 'הרצל 1, תל אביב',
  email: 'israela@example.com',
};

const bananas: CartItem = {
  productId: 3,
  productName: 'בננות',
  categoryId: 1,
  categoryName: 'פירות וירקות',
  unit: 'ק"ג',
  quantity: 2,
};

const arg = { customer, items: [bananas] };

describe('orderSlice', () => {
  // A retry after a rejection has to come back clean: the errors the form is showing are
  // cleared when the second attempt starts, not when it succeeds.
  it('stores the order id and drops the errors of a previous attempt', () => {
    const failed = reducer(undefined, submitOrder.rejected(null, 'req-1', arg, [
      { field: 'email', code: 'invalid_email' },
    ]));
    const retrying = reducer(failed, submitOrder.pending('req-2', arg));

    assert.equal(retrying.status, 'submitting');
    assert.deepEqual(retrying.errors, []);

    const state = reducer(retrying, submitOrder.fulfilled({ orderId: 'abc-123' }, 'req-2', arg));

    assert.equal(state.status, 'succeeded');
    assert.equal(state.orderId, 'abc-123');
    assert.deepEqual(state.errors, []);
  });

  it('keeps the field errors the BFF rejected with', () => {
    const state = reducer(undefined, submitOrder.rejected(null, 'req-1', arg, [
      { field: 'email', code: 'invalid_email' },
    ]));

    assert.equal(state.status, 'failed');
    assert.deepEqual(state.errors, [{ field: 'email', code: 'invalid_email' }]);
  });

  it('falls back to server_error when the rejection carries no field errors', () => {
    const state = reducer(undefined, submitOrder.rejected(new Error('boom'), 'req-1', arg));

    assert.equal(state.status, 'failed');
    assert.deepEqual(state.errors, [{ field: '', code: 'server_error' }]);
  });

  // A stale order id must not survive a cart change: putting something new in the cart
  // starts a new order, so the confirmation screen cannot show the previous one.
  it('resets a succeeded order when something is added to the cart', () => {
    const succeeded = reducer(undefined, submitOrder.fulfilled({ orderId: 'abc-123' }, 'req-1', arg));
    const state = reducer(succeeded, addItem(bananas));

    assert.equal(state.status, 'idle');
    assert.equal(state.orderId, null);
    assert.deepEqual(state.errors, []);
  });
});
