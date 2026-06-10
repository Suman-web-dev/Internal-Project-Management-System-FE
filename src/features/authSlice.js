import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const VALID_ROLES = ['admin', 'member'];

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: Cookies.get('user') ? JSON.parse(Cookies.get('user')) : null,
    token: Cookies.get('token') || null,
    isAuthenticated: !!Cookies.get('token'),
  },
  reducers: {
    setUser: (state, action) => {
      const { token, user } = action.payload;
      console.log('setUser called with token:', token ? 'present' : 'missing', 'user:', user);
      if (user && user.role && !VALID_ROLES.includes(user.role.toLowerCase())) {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        Cookies.remove('token');
        Cookies.remove('user');
        return;
      }
      state.token = token;
      state.user = {
        ...user,
        id: user?._id || user?.id
      };
      state.isAuthenticated = true;
      console.log('Setting cookies - token:', token.substring(0, 20) + '...');
      Cookies.set('token', token, { expires: 7, secure: false, sameSite: 'lax' });
      Cookies.set('user', JSON.stringify(state.user), { expires: 7, secure: false, sameSite: 'lax' });
      console.log('Cookies set. Verifying - token from cookies:', Cookies.get('token')?.substring(0, 20) + '...');
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      Cookies.remove('token');
      Cookies.remove('user');
    },
    setUserFromStorage: (state) => {
      const token = Cookies.get('token');
      const userCookie = Cookies.get('user');
      const user = userCookie ? JSON.parse(userCookie) : null;
      if (token && user) {
        if (user.role && !VALID_ROLES.includes(user.role.toLowerCase())) {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          Cookies.remove('token');
          Cookies.remove('user');
          return;
        }
        state.token = token;
        state.user = {
          ...user,
          id: user?._id || user?.id
        };
        state.isAuthenticated = true;
      }
    },
  },
});

export const { setUser, logout, setUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
