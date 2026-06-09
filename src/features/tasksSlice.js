import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${projectId}/tasks`);
      // Handle nested response structure: { success: true, data: [...] }
      const data = response.data.data || response.data;
      const tasks = Array.isArray(data) ? data : [];
      // Transform MongoDB _id to id for frontend consistency
      return tasks.map(task => ({
        ...task,
        id: task._id || task.id,
        assignedTo: task.assignedTo ? {
          ...task.assignedTo,
          id: task.assignedTo._id || task.assignedTo.id
        } : task.assignedTo
      }));
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async ({ projectId, taskData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/projects/${projectId}/tasks`, taskData);
      // Handle nested response structure: { success: true, data: {...} }
      const task = response.data.data || response.data;
      // Transform MongoDB _id to id for frontend consistency
      return {
        ...task,
        id: task._id || task.id,
        assignedTo: task.assignedTo ? {
          ...task.assignedTo,
          id: task.assignedTo._id || task.assignedTo.id
        } : task.assignedTo
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ projectId, taskId, taskData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, taskData);
      // Handle nested response structure: { success: true, data: {...} }
      const task = response.data.data || response.data;
      // Transform MongoDB _id to id for frontend consistency
      return {
        ...task,
        id: task._id || task.id,
        assignedTo: task.assignedTo ? {
          ...task.assignedTo,
          id: task.assignedTo._id || task.assignedTo.id
        } : task.assignedTo
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async ({ projectId, taskId }, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${projectId}/tasks/${taskId}`);
      return taskId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);

export const moveTask = createAsyncThunk(
  'tasks/moveTask',
  async ({ projectId, taskId, status }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/projects/${projectId}/tasks/${taskId}/move`, { status });
      // Handle nested response structure: { success: true, data: {...} }
      const task = response.data.data || response.data;
      // Transform MongoDB _id to id for frontend consistency
      return {
        ...task,
        id: task._id || task.id,
        assignedTo: task.assignedTo ? {
          ...task.assignedTo,
          id: task.assignedTo._id || task.assignedTo.id
        } : task.assignedTo
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to move task');
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addTaskFromSocket: (state, action) => {
      const task = {
        ...action.payload,
        id: action.payload._id || action.payload.id,
        assignedTo: action.payload.assignedTo ? {
          ...action.payload.assignedTo,
          id: action.payload.assignedTo._id || action.payload.assignedTo.id
        } : action.payload.assignedTo
      };
      state.tasks.push(task);
    },
    updateTaskFromSocket: (state, action) => {
      const taskId = action.payload._id || action.payload.id;
      const index = state.tasks.findIndex((t) => t.id === taskId);
      if (index !== -1) {
        const task = {
          ...action.payload,
          id: action.payload._id || action.payload.id,
          assignedTo: action.payload.assignedTo ? {
            ...action.payload.assignedTo,
            id: action.payload.assignedTo._id || action.payload.assignedTo.id
          } : action.payload.assignedTo
        };
        state.tasks[index] = task;
      }
    },
    removeTaskFromSocket: (state, action) => {
      const taskId = action.payload._id || action.payload.id;
      state.tasks = state.tasks.filter((t) => t.id !== taskId);
    },
    moveTaskFromSocket: (state, action) => {
      const taskId = action.payload._id || action.payload.id;
      const index = state.tasks.findIndex((t) => t.id === taskId);
      if (index !== -1) {
        state.tasks[index] = { ...state.tasks[index], status: action.payload.status };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
        state.error = null;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
        state.error = null;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(moveTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(moveTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(moveTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError: clearTasksError, addTaskFromSocket, updateTaskFromSocket, removeTaskFromSocket, moveTaskFromSocket } = tasksSlice.actions;
export default tasksSlice.reducer;
