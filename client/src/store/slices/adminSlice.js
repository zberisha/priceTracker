import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '@/services/api';

export const fetchKpis = createAsyncThunk('admin/kpis', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/admin/kpis');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch KPIs');
  }
});

export const fetchAdminUsers = createAsyncThunk('admin/users', async (query = {}, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams(query).toString();
    const { data } = await API.get(`/admin/users?${params}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch users');
  }
});

export const toggleUserStatus = createAsyncThunk('admin/toggleUser', async (userId, { rejectWithValue }) => {
  try {
    const { data } = await API.patch(`/admin/users/${userId}/toggle-status`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to toggle user');
  }
});

export const changeUserPlan = createAsyncThunk('admin/changeUserPlan', async ({ userId, plan }, { rejectWithValue }) => {
  try {
    const { data } = await API.patch(`/admin/users/${userId}/plan`, { plan });
    return { userId, subscription: data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to change plan');
  }
});

export const fetchSubscriptionBreakdown = createAsyncThunk('admin/subBreakdown', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/admin/subscriptions/breakdown');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch breakdown');
  }
});

export const fetchScraperStatus = createAsyncThunk('admin/scraperStatus', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/admin/scraper/status');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch scraper status');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    kpis: null,
    users: { items: [], total: 0, page: 1, pages: 0 },
    subscriptionBreakdown: null,
    scraperStatus: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchKpis.pending, (state) => { state.loading = true; })
      .addCase(fetchKpis.fulfilled, (state, { payload }) => { state.loading = false; state.kpis = payload; })
      .addCase(fetchKpis.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(fetchAdminUsers.fulfilled, (state, { payload }) => {
        state.users = { items: payload.users, total: payload.total, page: payload.page, pages: payload.pages };
      })
      .addCase(toggleUserStatus.fulfilled, (state, { payload }) => {
        const idx = state.users.items.findIndex((u) => u._id === payload._id);
        if (idx !== -1) state.users.items[idx].isActive = payload.isActive;
      })
      .addCase(changeUserPlan.fulfilled, (state, { payload }) => {
        const idx = state.users.items.findIndex((u) => u._id === payload.userId);
        if (idx !== -1) state.users.items[idx].subscription = payload.subscription;
      })
      .addCase(fetchSubscriptionBreakdown.fulfilled, (state, { payload }) => { state.subscriptionBreakdown = payload; })
      .addCase(fetchScraperStatus.fulfilled, (state, { payload }) => { state.scraperStatus = payload; });
  },
});

export default adminSlice.reducer;
