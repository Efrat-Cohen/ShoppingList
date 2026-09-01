import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { CartItem, Customer, FieldError } from '../../types';

const ORDERS_URL = '/api/orders';

type OrderState = {
  status: 'idle' | 'submitting' | 'succeeded' | 'failed';
  orderId: string | null;
  errors: FieldError[];
};

const initialState: OrderState = {
  status: 'idle',
  orderId: null,
  errors: [],
};

export const submitOrder = createAsyncThunk<
  { orderId: string },
  { customer: Customer; items: CartItem[] },
  { rejectValue: FieldError[] }
>('order/submit', async (payload, { rejectWithValue }) => {
  let response: Response;

  try {
    response = await fetch(ORDERS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Only the id and the quantity travel. Product names and categories are resolved
      // server-side from the catalog, so the cart cannot misreport what was ordered.
      body: JSON.stringify({
        customer: payload.customer,
        items: payload.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      }),
    });
  } catch {
    return rejectWithValue([{ field: '', code: 'network' }]);
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    return rejectWithValue(body?.errors ?? [{ field: '', code: 'server_error' }]);
  }

  // A 2xx whose body did not parse is not a success we can show anything for.
  if (typeof body?.orderId !== 'string') {
    return rejectWithValue([{ field: '', code: 'server_error' }]);
  }

  return body;
});

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrder: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitOrder.pending, (state) => {
        state.status = 'submitting';
        state.errors = [];
      })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.orderId = action.payload.orderId;
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.errors = action.payload ?? [{ field: '', code: 'server_error' }];
      });
  },
});

export const { resetOrder } = orderSlice.actions;

export default orderSlice.reducer;
