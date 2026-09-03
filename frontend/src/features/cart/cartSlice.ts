import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '../../types';

export const MAX_QUANTITY = 99;

type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Adding a product that is already in the cart tops up its quantity instead of
    // creating a second line for it.
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find((item) => item.productId === action.payload.productId);

      if (existing) {
        existing.quantity = Math.min(MAX_QUANTITY, existing.quantity + action.payload.quantity);
        return;
      }

      state.items.push(action.payload);
    },

    // The only way back out of the cart for a single line. Without it a product the
    // catalog has since dropped - which the BFF rejects with unknown_product - leaves the
    // cart in a state no amount of retrying can submit.
    removeItem(state, action: PayloadAction<number>) {
      state.items = state.items.filter((item) => item.productId !== action.payload);
    },

    clearCart(state) {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
