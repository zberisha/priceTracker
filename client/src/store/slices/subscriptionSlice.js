import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '@/services/api';

export const fetchSubscription = createAsyncThunk('subscription/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/subscriptions');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch subscription');
  }
});

export const fetchPlans = createAsyncThunk('subscription/plans', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/subscriptions/plans');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch plans');
  }
});

export const updateSubscription = createAsyncThunk('subscription/update', async (plan, { rejectWithValue }) => {
  try {
    const { data } = await API.put('/subscriptions', { plan });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to update subscription');
  }
});

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: { current: null, plans: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscription.pending, (state) => { state.loading = true; })
      .addCase(fetchSubscription.fulfilled, (state, { payload }) => { state.loading = false; state.current = payload; })
      .addCase(fetchSubscription.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(fetchPlans.fulfilled, (state, { payload }) => { state.plans = payload; })
      .addCase(updateSubscription.fulfilled, (state, { payload }) => { state.current = payload; });
  },
});

export default subscriptionSlice.reducer;
