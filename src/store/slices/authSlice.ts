import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, CustomerDetails } from './authSliceType';

// --- Initial State ---
const initialState: AuthState = {
  isOnboarded: false,
  mobileNumber: null,
  isAuthenticated: false,
  mpinSet: false,
  profileCompleted: false,
  mpin: null,
  token: null,
  loading: false,
  error: null,
  customerDetails: null,
  attempts: 0,
};
// --- Auth Slice ---
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setOnboarded(state) {
      state.isOnboarded = true;
    },
    setMobileNumber(state, action: PayloadAction<string>) {
      state.mobileNumber = action.payload;
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    setMpin(state, action: PayloadAction<string>) {
      state.mpin = action.payload;
      state.mpinSet = true;
    },
    setCustomerDetails(state, action: PayloadAction<CustomerDetails>) {
      state.customerDetails = action.payload;
      state.mpinSet = action.payload.MPIN_Flag === 'Y';
      state.isAuthenticated = true;
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    incrementAttempts(state) {
      state.attempts += 1;
    },
    resetAttempts(state) {
      state.attempts = 0;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.token = null;
      state.mobileNumber = null;
      state.mpin = null;
      state.mpinSet = false;
      state.profileCompleted = false;
      state.customerDetails = null;
      state.attempts = 0;
    },
    resetAuthState: () => initialState,
  },
});

export const {
  setOnboarded,
  setMobileNumber,
  setToken,
  setMpin,
  setCustomerDetails,
  setLoading,
  setError,
  incrementAttempts,
  resetAttempts,
  logout,
  resetAuthState,
} = authSlice.actions;
export default authSlice.reducer;
