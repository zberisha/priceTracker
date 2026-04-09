import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '@/services/api';

export const fetchCompetitors = createAsyncThunk('competitors/fetchAll', async (productId, { rejectWithValue }) => {
  try {
    const url = productId ? `/competitors?product=${productId}` : '/competitors';
    const { data } = await API.get(url);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch competitors');
  }
});

export const createCompetitor = createAsyncThunk('competitors/create', async (competitorData, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/competitors', competitorData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to create competitor');
  }
});

export const deleteCompetitor = createAsyncThunk('competitors/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/competitors/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to delete competitor');
  }
});

const competitorSlice = createSlice({
  name: 'competitors',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompetitors.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCompetitors.fulfilled, (state, { payload }) => { state.loading = false; state.items = payload; })
      .addCase(fetchCompetitors.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(createCompetitor.fulfilled, (state, { payload }) => { state.items.unshift(payload); })
      .addCase(deleteCompetitor.fulfilled, (state, { payload }) => {
        state.items = state.items.filter((c) => c._id !== payload);
      });
  },
});

export const { clearError: clearCompetitorError } = competitorSlice.actions;
export default competitorSlice.reducer;
