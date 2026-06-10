import { useEffect, useCallback } from 'react';
import { socketService } from '../services/socket';

export const useSocket = (token, onTaskUpdate) => {
  useEffect(() => {
    if (!token) return;

    socketService.connect(token);

    // Listen for task updates from other users
    socketService.on('task:updated', (updatedTask) => {
      if (onTaskUpdate) {
        onTaskUpdate(updatedTask);
      }
    });

    socketService.on('task:created', (newTask) => {
      if (onTaskUpdate) {
        onTaskUpdate(newTask);
      }
    });

    socketService.on('task:deleted', (deletedTask) => {
      if (onTaskUpdate) {
        onTaskUpdate(deletedTask);
      }
    });

    return () => {
      socketService.off('task:updated');
      socketService.off('task:created');
      socketService.off('task:deleted');
      socketService.disconnect();
    };
  }, [token, onTaskUpdate]);

  const emitTaskMove = useCallback((task) => {
    socketService.emit('task:move', task);
  }, []);

  return {
    emitTaskMove,
    isConnected: socketService.isConnected(),
  };
};
