import { configureStore } from '@reduxjs/toolkit';
import productReducer from './slices/productSlice';
import competitorReducer from './slices/competitorSlice';
import alertReducer from './slices/alertSlice';
import trackingReducer from './slices/trackingSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import categoryReducer from './slices/categorySlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    products: productReducer,
    competitors: competitorReducer,
    alerts: alertReducer,
    tracking: trackingReducer,
    subscription: subscriptionReducer,
    categories: categoryReducer,
    admin: adminReducer,
  },
});
