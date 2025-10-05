import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import type { AuthState, User } from '@/types';

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Cookie configuration
const COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  expires: 7, // 7 days
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.error = null;
    },

    // Set error state
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set user credentials (login/register success)
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: User }>
    ) => {
      const { token, user } = action.payload;
      
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;

      // Store token in httpOnly-style cookie
      Cookies.set('auth-token', token, COOKIE_OPTIONS);
      
      // Store user data in localStorage for persistence
      try {
        localStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.warn('Failed to store user data in localStorage:', error);
      }
    },

    // Update user profile
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        
        // Update localStorage
        try {
          localStorage.setItem('user', JSON.stringify(state.user));
        } catch (error) {
          console.warn('Failed to update user data in localStorage:', error);
        }
      }
    },

    // Logout user
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;

      // Remove token cookie
      Cookies.remove('auth-token');
      
      // Clear localStorage
      try {
        localStorage.removeItem('user');
      } catch (error) {
        console.warn('Failed to clear user data from localStorage:', error);
      }
    },

    // Restore session from stored data
    restoreSession: (state) => {
      try {
        const token = Cookies.get('auth-token');
        const userStr = localStorage.getItem('user');
        
        if (token && userStr) {
          const user = JSON.parse(userStr);
          state.user = user;
          state.token = token;
          state.isAuthenticated = true;
        }
      } catch (error) {
        console.warn('Failed to restore session:', error);
        // Clear corrupted data
        Cookies.remove('auth-token');
        localStorage.removeItem('user');
      }
    },

    // Token refresh
    refreshToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      Cookies.set('auth-token', action.payload, COOKIE_OPTIONS);
    },

    // Update verification status
    setVerified: (state, action: PayloadAction<boolean>) => {
      if (state.user) {
        state.user.verified = action.payload;
        
        try {
          localStorage.setItem('user', JSON.stringify(state.user));
        } catch (error) {
          console.warn('Failed to update verification status:', error);
        }
      }
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setCredentials,
  updateUser,
  logout,
  restoreSession,
  refreshToken,
  setVerified,
} = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => 
  state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => 
  state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => 
  state.auth.error;

export default authSlice.reducer;