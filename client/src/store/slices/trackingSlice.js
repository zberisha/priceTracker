import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '@/services/api';

export const fetchTrackings = createAsyncThunk('tracking/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/tracking');
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch trackings');
  }
});

export const createTracking = createAsyncThunk('tracking/create', async (trackingData, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/tracking', trackingData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to create tracking');
  }
});

export const deleteTracking = createAsyncThunk('tracking/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/tracking/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to delete tracking');
  }
});

const trackingSlice = createSlice({
  name: 'tracking',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrackings.pending, (state) => { state.loading = true; })
      .addCase(fetchTrackings.fulfilled, (state, { payload }) => { state.loading = false; state.items = payload; })
      .addCase(fetchTrackings.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(createTracking.fulfilled, (state, { payload }) => { state.items.unshift(payload); })
      .addCase(deleteTracking.fulfilled, (state, { payload }) => {
        state.items = state.items.filter((t) => t._id !== payload);
      });
  },
});

export default trackingSlice.reducer;
