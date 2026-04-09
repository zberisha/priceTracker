import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '@/services/api';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (query = {}, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams(query).toString();
    const { data } = await API.get(`/products?${params}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch products');
  }
});

export const fetchProductById = createAsyncThunk('products/fetchById', async (id, { rejectWithValue }) => {
  try {
    const { data } = await API.get(`/products/${id}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch product');
  }
});

export const createProduct = createAsyncThunk('products/create', async (productData, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/products', productData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to create product');
  }
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, updates }, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/products/${id}`, updates);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to update product');
  }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/products/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to delete product');
  }
});

export const fetchPriceHistory = createAsyncThunk('products/priceHistory', async ({ id, query = {} }, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams(query).toString();
    const { data } = await API.get(`/products/${id}/prices?${params}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch price history');
  }
});

export const scrapeNow = createAsyncThunk('products/scrapeNow', async (id, { rejectWithValue }) => {
  try {
    const { data } = await API.post(`/products/${id}/scrape`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Scraping failed');
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    current: null,
    priceHistory: [],
    total: 0,
    page: 1,
    pages: 1,
    loading: false,
    scraping: false,
    error: null,
  },
  reducers: {
    clearCurrentProduct: (state) => {
      state.current = null;
      state.priceHistory = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload.products;
        state.total = payload.total;
        state.page = payload.page;
        state.pages = payload.pages;
      })
      .addCase(fetchProducts.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })

      .addCase(fetchProductById.pending, (state) => { state.loading = true; })
      .addCase(fetchProductById.fulfilled, (state, { payload }) => { state.loading = false; state.current = payload; })
      .addCase(fetchProductById.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })

      .addCase(createProduct.fulfilled, (state, { payload }) => { state.items.unshift(payload); })
      .addCase(updateProduct.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex((p) => p._id === payload._id);
        if (idx !== -1) state.items[idx] = payload;
        if (state.current?._id === payload._id) state.current = payload;
      })
      .addCase(deleteProduct.fulfilled, (state, { payload }) => {
        state.items = state.items.filter((p) => p._id !== payload);
      })

      .addCase(fetchPriceHistory.fulfilled, (state, { payload }) => { state.priceHistory = payload; })

      .addCase(scrapeNow.pending, (state) => { state.scraping = true; state.error = null; })
      .addCase(scrapeNow.fulfilled, (state, { payload }) => {
        state.scraping = false;
        state.current = payload.product;
      })
      .addCase(scrapeNow.rejected, (state, { payload }) => { state.scraping = false; state.error = payload; });
  },
});

export const { clearCurrentProduct, clearError } = productSlice.actions;
export default productSlice.reducer;
