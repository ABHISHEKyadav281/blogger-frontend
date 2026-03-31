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

// Extract token from URL early if redirected from OAuth2 backend
let urlToken: string | null = null;
if (typeof window !== 'undefined') {
  const searchParams = new URLSearchParams(window.location.search);
  urlToken = searchParams.get("token") || searchParams.get("access_token");
  
  if (!urlToken && window.location.hash) {
    const hashStr = window.location.hash.substring(1);
    const hashParams = new URLSearchParams(hashStr.includes('?') ? hashStr.substring(hashStr.indexOf('?')) : hashStr);
    urlToken = hashParams.get("token") || hashParams.get("access_token");
  }

  if (urlToken) {
    localStorage.setItem("soloblogger_token", urlToken);
    localStorage.removeItem("soloblogger_user");
    window.history.replaceState({}, document.title, window.location.pathname);
  }
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

const getInitialUser = () => {
    if (!savedUser || !isTokenValid) return null;
    try {
        const user = JSON.parse(savedUser);
        // Migration of field from avatar to profilePictureUrl
        if (user.avatar && !user.profilePictureUrl) {
            user.profilePictureUrl = user.avatar;
        }
        return user;
    } catch {
        return null;
    }
};

const initialState: AuthState = {
  user: getInitialUser(),
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