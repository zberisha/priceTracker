import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '@/services/api';

export const fetchCategories = createAsyncThunk('categories/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/categories');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch categories');
  }
});

export const createCategory = createAsyncThunk('categories/create', async (categoryData, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/categories', categoryData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to create category');
  }
});

export const updateCategory = createAsyncThunk('categories/update', async ({ id, updates }, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/categories/${id}`, updates);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to update category');
  }
});

export const deleteCategory = createAsyncThunk('categories/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/categories/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to delete category');
  }
});

const categorySlice = createSlice({
  name: 'categories',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    clearCategoryError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCategories.fulfilled, (state, { payload }) => { state.loading = false; state.items = payload; })
      .addCase(fetchCategories.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(createCategory.fulfilled, (state, { payload }) => { state.items.push(payload); state.items.sort((a, b) => a.name.localeCompare(b.name)); })
      .addCase(updateCategory.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex((c) => c._id === payload._id);
        if (idx !== -1) state.items[idx] = payload;
        state.items.sort((a, b) => a.name.localeCompare(b.name));
      })
      .addCase(deleteCategory.fulfilled, (state, { payload }) => {
        state.items = state.items.filter((c) => c._id !== payload);
      });
  },
});

export const { clearCategoryError } = categorySlice.actions;
export default categorySlice.reducer;
