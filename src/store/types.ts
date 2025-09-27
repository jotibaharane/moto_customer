// src/store/types.ts
import {Action, ThunkAction} from '@reduxjs/toolkit';
import {persistor, store} from './index';

/**
 * Root state type for useSelector.
 */
export type RootState = ReturnType<typeof store.getState>;

/**
 * App dispatch type for useDispatch.
 */
export type AppDispatch = typeof store.dispatch;

/**
 * Thunk action type for async actions.
 */
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

/**
 * Store type for typing the Redux store.
 */
export type StoreType = typeof store;

/**
 * Persistor type for redux-persist.
 */
export type PersistorType = typeof persistor;
