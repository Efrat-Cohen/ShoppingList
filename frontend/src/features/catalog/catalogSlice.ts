import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Catalog, Category, Product } from '../../types';

// Same-origin path. In development Vite proxies it to the BFF, in docker nginx does.
const CATALOG_URL = '/api/catalog';

type CatalogState = {
  categories: Category[];
  products: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
};

const initialState: CatalogState = {
  categories: [],
  products: [],
  status: 'idle',
};

export const fetchCatalog = createAsyncThunk('catalog/fetch', async () => {
  const response = await fetch(CATALOG_URL);

  if (!response.ok) {
    throw new Error(`catalog request failed with status ${response.status}`);
  }

  return (await response.json()) as Catalog;
});

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalog.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCatalog.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = action.payload.categories;
        state.products = action.payload.products;
      })
      .addCase(fetchCatalog.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default catalogSlice.reducer;
