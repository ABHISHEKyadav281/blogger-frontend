// store/slices/authSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

// Read from local storage for initial state
const savedUser = localStorage.getItem('soloblogger_user');
const savedToken = localStorage.getItem('soloblogger_token');

let isTokenValid = !!savedToken;
if (savedToken) {
  try {
    const decoded: any = jwtDecode(savedToken);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      isTokenValid = false;
    }
  } catch (error) {
    isTokenValid = false;
  }
}

const initialState: AuthState = {
  user: savedUser && isTokenValid ? JSON.parse(savedUser) : null,
  isAuthenticated: isTokenValid,
  token: isTokenValid ? savedToken : null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    stopLoading: (state) => {
      state.isLoading = false;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  clearError,
  stopLoading,
} = authSlice.actions;

export default authSlice.reducer;