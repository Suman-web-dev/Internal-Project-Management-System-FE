import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/projects');
      // Handle nested response structure: { success: true, data: [...] }
      const data = response.data.data || response.data;
      const projects = Array.isArray(data) ? data : [];
      // Transform MongoDB _id to id for frontend consistency
      return projects.map(project => ({
        ...project,
        id: project._id || project.id,
        owner: project.owner ? { ...project.owner, id: project.owner._id || project.owner.id } : null,
        members: project.members ? project.members.map(member => ({
          ...member,
          id: member._id || member.id
        })) : []
      }));
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await api.post('/projects', projectData);
      // Handle nested response structure: { success: true, data: {...} }
      const project = response.data.data || response.data;
      // Transform MongoDB _id to id for frontend consistency
      return {
        ...project,
        id: project._id || project.id,
        owner: project.owner ? { ...project.owner, id: project.owner._id || project.owner.id } : null,
        members: project.members ? project.members.map(member => ({
          ...member,
          id: member._id || member.id
        })) : []
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project');
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, projectData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      // Handle nested response structure: { success: true, data: {...} }
      const project = response.data.data || response.data;
      // Transform MongoDB _id to id for frontend consistency
      return {
        ...project,
        id: project._id || project.id,
        owner: project.owner ? { ...project.owner, id: project.owner._id || project.owner.id } : null,
        members: project.members ? project.members.map(member => ({
          ...member,
          id: member._id || member.id
        })) : []
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete project');
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addProjectFromSocket: (state, action) => {
      const project = {
        ...action.payload,
        id: action.payload._id || action.payload.id,
        owner: action.payload.owner ? { ...action.payload.owner, id: action.payload.owner._id || action.payload.owner.id } : null,
        members: action.payload.members ? action.payload.members.map(member => ({
          ...member,
          id: member._id || member.id
        })) : []
      };
      state.projects.push(project);
    },
    updateProjectFromSocket: (state, action) => {
      const projectId = action.payload._id || action.payload.id;
      const index = state.projects.findIndex((p) => p.id === projectId);
      if (index !== -1) {
        const project = {
          ...action.payload,
          id: action.payload._id || action.payload.id,
          owner: action.payload.owner ? { ...action.payload.owner, id: action.payload.owner._id || action.payload.owner.id } : null,
          members: action.payload.members ? action.payload.members.map(member => ({
            ...member,
            id: member._id || member.id
          })) : []
        };
        state.projects[index] = project;
      }
    },
    removeProjectFromSocket: (state, action) => {
      const projectId = action.payload._id || action.payload.id;
      state.projects = state.projects.filter((p) => p.id !== projectId);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
        state.error = null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload);
        state.error = null;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.projects.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter((p) => p.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError: clearProjectsError, addProjectFromSocket, updateProjectFromSocket, removeProjectFromSocket } = projectsSlice.actions;
export default projectsSlice.reducer;
