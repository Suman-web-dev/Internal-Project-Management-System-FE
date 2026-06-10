import apiSlice from './apiSlice';

export const tasksApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query({
      query: (projectId) => `/projects/${projectId}/tasks`,
      providesTags: ['Task'],
      transformResponse: (response) => {
        const data = response.data || response;
        const tasks = Array.isArray(data) ? data : [];
        return tasks.map(task => ({
          ...task,
          id: task._id || task.id,
          assignedTo: task.assignedTo && Array.isArray(task.assignedTo)
            ? task.assignedTo.map(user => ({
                ...user,
                id: user._id || user.id
              }))
            : task.assignedTo
              ? {
                  ...task.assignedTo,
                  id: task.assignedTo._id || task.assignedTo.id
                }
              : task.assignedTo
        }));
      },
    }),
    getTaskById: builder.query({
      query: (taskId) => `/tasks/${taskId}`,
      providesTags: (result, error, taskId) => [{ type: 'Task', id: taskId }],
    }),
    createTask: builder.mutation({
      query: ({ projectId, taskData }) => ({
        url: `/projects/${projectId}/tasks`,
        method: 'POST',
        body: taskData,
      }),
      invalidatesTags: ['Task'],
    }),
    updateTask: builder.mutation({
      query: ({ taskId, taskData }) => ({
        url: `/tasks/${taskId}`,
        method: 'PUT',
        body: taskData,
      }),
      invalidatesTags: ['Task'],
    }),
    deleteTask: builder.mutation({
      query: ({ taskId }) => ({
        url: `/tasks/${taskId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApiSlice;
