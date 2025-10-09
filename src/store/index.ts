import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from './api/baseApi';
import { procurementApi } from './api/procurementApi';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    // API reducers
    [baseApi.reducerPath]: baseApi.reducer,
    [procurementApi.reducerPath]: procurementApi.reducer,
    
    // Feature reducers
    auth: authReducer,
    ui: uiReducer,
  },
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'persist/FLUSH',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PERSIST',
          'persist/PURGE',
          'persist/REGISTER',
        ],
        // Ignore these field paths in the state
        ignoredPaths: ['api.queries', 'procurementApi.queries'],
      },
    })
      .concat(baseApi.middleware)
      .concat(procurementApi.middleware)
      .concat([
        // Add custom middleware for analytics, logging, etc.
      ]),
      
  devTools: process.env.NODE_ENV !== 'production',
});

// Setup RTK Query listeners for caching, invalidation, refetching, etc.
setupListeners(store.dispatch);

// Types
export type AppDispatch = typeof store.dispatch;
export type { RootState } from '@/types';

// Action creators for common operations
export const createAsyncThunk = (type: string) => {
  return { pending: `${type}/pending`, fulfilled: `${type}/fulfilled`, rejected: `${type}/rejected` };
};

// Store enhancers
if (process.env.NODE_ENV === 'development') {
  // Development-only enhancements can be added here
  // For example, redux-logger or other dev tools
  // Note: redux-logger needs to be installed separately if needed
}

// Export store for use in provider
export default store;