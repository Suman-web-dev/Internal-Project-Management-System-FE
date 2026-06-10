import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from '../utils/constants';
import Cookies from 'js-cookie';

const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      const token = Cookies.get('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      } else {
        console.error('No token in cookies');
      }
      return headers;
    },
  }),
  tagTypes: ['Auth', 'Project', 'Task', 'User'],
  endpoints: () => ({}),
});

export default apiSlice;
