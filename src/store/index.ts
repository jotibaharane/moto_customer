// src/store/index.ts

import baseApi from '@api/index';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import EncryptedPersistStorage from '@utils/encryptedStorage';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PersistConfig,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'redux-persist';
import authReducer from './slices/authSlice';
import loadPostFormReducer from './slices/loadPostFormSlice';
import mapReducer from './slices/mapSlice';
import vehicleSheetReducer from './slices/VehicleSheet';
const rootReducer = combineReducers({
  auth: authReducer,
  map: mapReducer,
  loadPostForm: loadPostFormReducer,
  vehicleSheet: vehicleSheetReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

const persistConfig: PersistConfig<ReturnType<typeof rootReducer>> = {
  key: 'root',
  storage: EncryptedPersistStorage,
  whitelist: ['auth'],
  version: 1,
  timeout: 0,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(baseApi.middleware),
  devTools: __DEV__,
});

setupListeners(store.dispatch);

export const persistor = persistStore(store, null, () => {
  console.log('Persist rehydration complete');
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> =
  import('@reduxjs/toolkit').ThunkAction<
    ReturnType,
    RootState,
    unknown,
    import('@reduxjs/toolkit').Action<string>
  >;
export type StoreType = typeof store;
export type PersistorType = typeof persistor;
