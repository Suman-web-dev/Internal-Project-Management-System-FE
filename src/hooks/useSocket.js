import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { socketService } from '../services/socket';
import { addTaskFromSocket, updateTaskFromSocket, removeTaskFromSocket, moveTaskFromSocket } from '../features/tasksSlice';
import { addProjectFromSocket, updateProjectFromSocket, removeProjectFromSocket } from '../features/projectsSlice';
import { SOCKET_EVENTS } from '../utils/constants';

export const useSocket = (token) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) return;

    const socket = socketService.connect(token);

    socket.on(SOCKET_EVENTS.TASK_CREATED, (task) => {
      dispatch(addTaskFromSocket(task));
    });

    socket.on(SOCKET_EVENTS.TASK_UPDATED, (task) => {
      dispatch(updateTaskFromSocket(task));
    });

    socket.on(SOCKET_EVENTS.TASK_DELETED, (taskId) => {
      dispatch(removeTaskFromSocket(taskId));
    });

    socket.on(SOCKET_EVENTS.TASK_MOVED, (task) => {
      dispatch(moveTaskFromSocket(task));
    });

    socket.on(SOCKET_EVENTS.PROJECT_CREATED, (project) => {
      dispatch(addProjectFromSocket(project));
    });

    socket.on(SOCKET_EVENTS.PROJECT_UPDATED, (project) => {
      dispatch(updateProjectFromSocket(project));
    });

    socket.on(SOCKET_EVENTS.PROJECT_DELETED, (projectId) => {
      dispatch(removeProjectFromSocket(projectId));
    });

    return () => {
      socketService.disconnect();
    };
  }, [token, dispatch]);

  const emitTaskUpdate = useCallback((task) => {
    socketService.emit('task:update', task);
  }, []);

  const emitTaskMove = useCallback((task) => {
    socketService.emit('task:move', task);
  }, []);

  return {
    emitTaskUpdate,
    emitTaskMove,
    isConnected: socketService.isConnected(),
  };
};
