import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { Category } from '../../types';

// Same-origin path. In development Vite proxies it to the .NET API, in docker nginx does.
const CATALOG_URL = '/api/catalog/categories';

type CatalogState = {
  categories: Category[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
};

const initialState: CatalogState = {
  categories: [],
  status: 'idle',
};

export const fetchCatalog = createAsyncThunk('catalog/fetch', async () => {
  const response = await fetch(CATALOG_URL);

  if (!response.ok) {
    throw new Error(`catalog request failed with status ${response.status}`);
  }

  return (await response.json()) as Category[];
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
        state.categories = action.payload;
      })
      .addCase(fetchCatalog.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default catalogSlice.reducer;
