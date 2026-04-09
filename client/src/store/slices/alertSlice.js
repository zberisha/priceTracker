import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '@/services/api';

export const fetchAlerts = createAsyncThunk('alerts/fetchAll', async (query = {}, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams(query).toString();
    const { data } = await API.get(`/alerts?${params}`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to fetch alerts');
  }
});

export const createAlert = createAsyncThunk('alerts/create', async (alertData, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/alerts', alertData);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to create alert');
  }
});

export const markAlertRead = createAsyncThunk('alerts/markRead', async (id, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/alerts/${id}/read`);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to mark alert as read');
  }
});

export const markAllAlertsRead = createAsyncThunk('alerts/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await API.put('/alerts/read-all');
    return true;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed');
  }
});

export const deleteAlert = createAsyncThunk('alerts/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/alerts/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Failed to delete alert');
  }
});

const alertSlice = createSlice({
  name: 'alerts',
  initialState: { items: [], total: 0, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => { state.loading = true; })
      .addCase(fetchAlerts.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.items = payload.alerts;
        state.total = payload.total;
      })
      .addCase(fetchAlerts.rejected, (state, { payload }) => { state.loading = false; state.error = payload; })
      .addCase(createAlert.fulfilled, (state, { payload }) => { state.items.unshift(payload); })
      .addCase(markAlertRead.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex((a) => a._id === payload._id);
        if (idx !== -1) state.items[idx] = payload;
      })
      .addCase(markAllAlertsRead.fulfilled, (state) => {
        state.items = state.items.map((a) => ({ ...a, isRead: true }));
      })
      .addCase(deleteAlert.fulfilled, (state, { payload }) => {
        state.items = state.items.filter((a) => a._id !== payload);
      });
  },
});

export default alertSlice.reducer;
