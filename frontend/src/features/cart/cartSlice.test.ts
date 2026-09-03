import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import reducer, { MAX_QUANTITY, addItem, clearCart } from './cartSlice';
import type { CartItem } from '../../types';

const bananas: CartItem = {
  productId: 3,
  productName: 'בננות',
  categoryId: 1,
  categoryName: 'פירות וירקות',
  unit: 'ק"ג',
  quantity: 2,
};

const milk: CartItem = {
  productId: 7,
  productName: 'חלב',
  categoryId: 2,
  categoryName: 'מוצרי חלב',
  unit: 'ליטר',
  quantity: 1,
};

describe('cartSlice', () => {
  it('adds a product that is not in the cart yet', () => {
    const state = reducer(undefined, addItem(bananas));

    assert.deepEqual(state.items, [bananas]);
  });

  it('tops up the quantity instead of adding a second line for the same product', () => {
    const first = reducer(undefined, addItem(bananas));
    const state = reducer(first, addItem({ ...bananas, quantity: 3 }));

    assert.equal(state.items.length, 1);
    assert.equal(state.items[0].quantity, 5);
  });

  it('keeps different products on their own lines', () => {
    const first = reducer(undefined, addItem(bananas));
    const state = reducer(first, addItem(milk));

    assert.deepEqual(state.items.map((item) => item.productId), [3, 7]);
  });

  it('caps a top-up at MAX_QUANTITY', () => {
    const first = reducer(undefined, addItem({ ...bananas, quantity: MAX_QUANTITY }));
    const state = reducer(first, addItem({ ...bananas, quantity: 10 }));

    assert.equal(state.items[0].quantity, MAX_QUANTITY);
  });

  it('empties the cart', () => {
    const first = reducer(undefined, addItem(bananas));
    const state = reducer(first, clearCart());

    assert.deepEqual(state.items, []);
  });
});
