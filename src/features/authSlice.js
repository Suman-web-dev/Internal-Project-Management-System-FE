import { createSlice } from '@reduxjs/toolkit';

const VALID_ROLES = ['admin', 'member'];

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
  },
  reducers: {
    setUser: (state, action) => {
      const { token, user } = action.payload;
      if (user && user.role && !VALID_ROLES.includes(user.role.toLowerCase())) {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return;
      }
      state.token = token;
      state.user = {
        ...user,
        id: user._id || user.id
      };
      state.isAuthenticated = true;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setUserFromStorage: (state) => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      if (token && user) {
        if (user.role && !VALID_ROLES.includes(user.role.toLowerCase())) {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }
        state.token = token;
        state.user = {
          ...user,
          id: user._id || user.id
        };
        state.isAuthenticated = true;
      }
    },
  },
});

export const { setUser, logout, setUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
