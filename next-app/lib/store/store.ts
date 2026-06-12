'use client';

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';

// Redux Persist configuration — persist the whole auth slice (token + user)
// so the session survives a page reload. (A whitelist here would be wrong: it
// filters fields *within* this slice, which has no `auth` field of its own.)
const persistConfig = {
  key: 'auth',
  storage,
};

// Create persisted reducer
const persistedAuthReducer = persistReducer(persistConfig, authReducer);

// Create store
export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
});

// Create persistor
export const persistor = persistStore(store);

// TypeScript types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
