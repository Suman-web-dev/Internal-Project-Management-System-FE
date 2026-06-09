import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { USER_ROLES } from '../utils/constants';

const VALID_ROLES = ['admin', 'member'];

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { data } = response.data;
      const { token, user } = data;
      
      // Validate that the role is one of the allowed values
      if (user && user.role && !VALID_ROLES.includes(user.role.toLowerCase())) {
        return rejectWithValue('Invalid user role');
      }
      
      // Ensure role is lowercase for consistency
      if (user && user.role) {
        user.role = user.role.toLowerCase();
      }
      
      // Transform MongoDB _id to id for frontend consistency
      const normalizedUser = {
        ...user,
        id: user._id || user.id
      };
      
      return { token, user: normalizedUser };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  return null;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUserFromStorage: (state) => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      if (token && user) {
        // Validate role from storage
        if (user.role && !VALID_ROLES.includes(user.role.toLowerCase())) {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }
        state.token = token;
        // Transform MongoDB _id to id for frontend consistency
        state.user = {
          ...user,
          id: user._id || user.id
        };
        state.isAuthenticated = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        localStorage.setItem('token', action.payload.token);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, setUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
