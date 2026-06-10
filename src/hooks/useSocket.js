import { useEffect, useCallback } from 'react';
import { socketService } from '../services/socket';

export const useSocket = (token, onTaskUpdate, projectId) => {
  useEffect(() => {
    if (!token) return;

    socketService.connect(token);

    // Join project room to receive project-specific updates
    if (projectId) {
      console.log('Joining project room:', projectId);
      socketService.emit('joinProject', projectId);
    }

    // Listen for task updates from other users (backend uses camelCase)
    socketService.on('taskUpdated', (updatedTask) => {
      console.log('Received taskUpdated event:', updatedTask);
      if (onTaskUpdate) {
        onTaskUpdate(updatedTask);
      }
    });

    socketService.on('taskCreated', (newTask) => {
      console.log('Received taskCreated event:', newTask);
      if (onTaskUpdate) {
        onTaskUpdate(newTask);
      }
    });

    socketService.on('taskDeleted', (deletedTask) => {
      console.log('Received taskDeleted event:', deletedTask);
      if (onTaskUpdate) {
        onTaskUpdate(deletedTask);
      }
    });

    socketService.on('taskMoved', (movedTask) => {
      console.log('Received taskMoved event:', movedTask);
      if (onTaskUpdate) {
        onTaskUpdate(movedTask);
      }
    });

    return () => {
      if (projectId) {
        console.log('Leaving project room:', projectId);
        socketService.emit('leaveProject', projectId);
      }
      socketService.off('taskUpdated');
      socketService.off('taskCreated');
      socketService.off('taskDeleted');
      socketService.off('taskMoved');
      socketService.disconnect();
    };
  }, [token, onTaskUpdate, projectId]);

  const emitTaskMove = useCallback((task) => {
    console.log('Emitting task:move event:', task);
    socketService.emit('task:move', task);
  }, []);

  return {
    emitTaskMove,
    isConnected: socketService.isConnected(),
  };
};
