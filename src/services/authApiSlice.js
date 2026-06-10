import apiSlice from './apiSlice';

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    getMe: builder.query({
      query: () => '/auth/me',
    }),
    getAllUsers: builder.query({
      query: () => '/auth/users',
      providesTags: ['User'],
      transformResponse: (response) => {
        const data = response.data || response;
        const users = Array.isArray(data) ? data : [];
        return users.map(user => ({
          ...user,
          id: user._id || user.id
        }));
      },
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/auth/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useGetAllUsersQuery,
  useDeleteUserMutation,
} = authApiSlice;
