import apiSlice from './apiSlice';

export const projectsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query({
      query: () => '/projects',
      providesTags: ['Project'],
      transformResponse: (response) => {
        const data = response.data || response;
        const projects = Array.isArray(data) ? data : [];
        return projects.map(project => ({
          ...project,
          id: project._id || project.id,
          owner: project.owner ? { ...project.owner, id: project.owner._id || project.owner.id } : null,
          members: project.members ? project.members.map(member => ({
            ...member,
            id: member._id || member.id
          })) : []
        }));
      },
    }),
    getProjectById: builder.query({
      query: (id) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation({
      query: (projectData) => ({
        url: '/projects',
        method: 'POST',
        body: projectData,
      }),
      invalidatesTags: ['Project'],
    }),
    updateProject: builder.mutation({
      query: ({ id, projectData }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body: projectData,
      }),
      invalidatesTags: ['Project'],
    }),
    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project'],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectsApiSlice;
