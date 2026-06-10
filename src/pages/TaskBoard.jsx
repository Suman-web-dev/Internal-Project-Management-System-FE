import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { openModal, closeModal, addToast } from '../features/uiSlice';
import TaskCard from '../components/TaskCard';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import Layout from '../components/Layout';
import { validateTaskForm } from '../utils/validation';
import { TASK_STATUS, TASK_STATUS_LABELS, USER_ROLES } from '../utils/constants';
import { useSocket } from '../hooks/useSocket';
import FormInputComponent from '../components/FormInput';
import { useGetTasksQuery, useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } from '../services/tasksApiSlice';
import { useGetAllUsersQuery } from '../services/authApiSlice';
import MultiSelectDropdown from '../components/MultiSelectDropdown';
import ConfirmationModal from '../components/ConfirmationModal';

const TaskBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const { selectedProject, modals } = useSelector((state) => state.ui);
  const [formData, setFormData] = useState({ title: '', description: '', assignedTo: [] });
  const [formErrors, setFormErrors] = useState({});
  const [expandedColumns, setExpandedColumns] = useState({
    [TASK_STATUS.TODO]: false,
    [TASK_STATUS.IN_PROGRESS]: false,
    [TASK_STATUS.DONE]: false,
  });
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, taskId: null });

  const isAdmin = user?.role === USER_ROLES.ADMIN;
  
  // Force refetch when socket receives task updates
  const { refetch } = useGetTasksQuery(projectId);
  
  const handleTaskUpdate = useCallback(() => {
    refetch();
  }, [refetch]);
  
  const { emitTaskMove } = useSocket(token, handleTaskUpdate);

  const { data: tasks = [], isLoading, error } = useGetTasksQuery(projectId);
  const { data: allUsers = [] } = useGetAllUsersQuery();
  const availableUsers = Array.isArray(allUsers) ? allUsers.filter(user => user.role !== 'admin') : [];
  const [createTask] = useCreateTaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();

  const handleStatusChange = async (taskId, newStatus) => {
    const task = tasks.find((t) => t.id.toString() === taskId);
    if (task && task.status !== newStatus) {
      try {
        await updateTask({ taskId, taskData: { status: newStatus } }).unwrap();
        emitTaskMove({ ...task, status: newStatus });
        dispatch(addToast({ message: 'Task status updated successfully', type: 'success' }));
      } catch (error) {
        dispatch(addToast({ message: 'Failed to update task status', type: 'error' }));
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    const errors = validateTaskForm(formData.title, formData.description);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    try {
      await createTask({ projectId, taskData: formData }).unwrap();
      dispatch(closeModal('createTask'));
      dispatch(addToast({ message: 'Task created successfully', type: 'success' }));
      setFormData({ title: '', description: '', assignedTo: [] });
    } catch (error) {
      dispatch(addToast({ message: 'Failed to create task', type: 'error' }));
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    const errors = validateTaskForm(formData.title, formData.description);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    try {
      const { id, ...taskData } = formData;
      await updateTask({ 
        projectId, 
        taskId: formData.id, 
        taskData 
      }).unwrap();
      dispatch(closeModal('editTask'));
      dispatch(addToast({ message: 'Task updated successfully', type: 'success' }));
      setFormData({ title: '', description: '', assignedTo: [] });
    } catch (error) {
      dispatch(addToast({ message: 'Failed to update task', type: 'error' }));
    }
  };

  const handleDeleteTask = (taskId) => {
    setConfirmDelete({ isOpen: true, taskId });
  };

  const confirmDeleteTask = async () => {
    try {
      await deleteTask({ taskId: confirmDelete.taskId }).unwrap();
      dispatch(addToast({ message: 'Task deleted successfully', type: 'success' }));
    } catch (error) {
      dispatch(addToast({ message: 'Failed to delete task', type: 'error' }));
    }
    setConfirmDelete({ isOpen: false, taskId: null });
  };

  const cancelDeleteTask = () => {
    setConfirmDelete({ isOpen: false, taskId: null });
  };

  const handleEditTask = (task) => {
    setFormData({
      id: task.id,
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo?.id ? [task.assignedTo.id] : []
    });
    dispatch(openModal('editTask'));
  };

  const handleOpenCreateModal = () => {
    setFormData({ title: '', description: '', assignedTo: [] });
    dispatch(openModal('createTask'));
  };

  const handleCloseModal = (modalName) => {
    dispatch(closeModal(modalName));
    setFormData({ title: '', description: '', assignedTo: [] });
    setFormErrors({});
  };

  const handleBackToProjects = () => {
    navigate('/projects');
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  const toggleColumnExpansion = (columnId) => {
    setExpandedColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const columns = [
    { id: TASK_STATUS.TODO, title: TASK_STATUS_LABELS[TASK_STATUS.TODO] },
    { id: TASK_STATUS.IN_PROGRESS, title: TASK_STATUS_LABELS[TASK_STATUS.IN_PROGRESS] },
    { id: TASK_STATUS.DONE, title: TASK_STATUS_LABELS[TASK_STATUS.DONE] },
  ];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={handleBackToProjects}
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {selectedProject?.title || 'Task Board'}
            </h1>
          </div>
          <button
            onClick={handleOpenCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          >
            Add Task
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {columns.map((column) => {
              const columnTasks = getTasksByStatus(column.id);
              const isExpanded = expandedColumns[column.id];
              const displayTasks = isExpanded ? columnTasks : columnTasks.slice(0, 1);
              const hasMoreTasks = columnTasks.length > 1;

              return (
                <div key={column.id} className="bg-gray-100 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-700">{column.title}</h2>
                    <span className="text-xs sm:text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                      {columnTasks.length}
                    </span>
                  </div>
                  
                  {hasMoreTasks && (
                    <button
                      onClick={() => toggleColumnExpansion(column.id)}
                      className="w-full mb-3 flex items-center justify-center space-x-2 text-xs sm:text-sm text-blue-600 hover:text-blue-700 bg-blue-50 py-2 rounded-md transition-colors"
                    >
                      <span>{isExpanded ? 'Show Less' : `Show ${columnTasks.length - 1} More`}</span>
                      <svg 
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}

                  <div className="min-h-[200px]">
                    {displayTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        onStatusChange={handleStatusChange}
                        canEdit={isAdmin || task.assignedTo?.id === user?.id}
                        canDelete={isAdmin}
                      />
                    ))}
                    {!isExpanded && hasMoreTasks && (
                      <div className="text-center py-3 text-gray-500 text-sm">
                        + {columnTasks.length - 1} more task{columnTasks.length - 1 !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={modals.createTask}
        onClose={() => handleCloseModal('createTask')}
        title="Create New Task"
      >
        <form onSubmit={handleCreateTask}>
          <FormInputComponent
            label="Title"
            type="text"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={formErrors.title}
            placeholder="Enter task title"
            required
          />

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter task description"
              required
              rows={4}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
          </div>

          <MultiSelectDropdown
            label="Assign To"
            options={Array.isArray(availableUsers) ? availableUsers.map(user => ({ value: user.id, label: `${user.name} (${user.email})` })) : []}
            selectedValues={formData.assignedTo || []}
            onChange={(selectedUsers) => setFormData({ ...formData, assignedTo: selectedUsers })}
            placeholder="Select users to assign this task"
          />

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => handleCloseModal('createTask')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={modals.editTask}
        onClose={() => handleCloseModal('editTask')}
        title="Edit Task"
      >
        <form onSubmit={handleUpdateTask}>
          <FormInputComponent
            label="Title"
            type="text"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={formErrors.title}
            placeholder="Enter task title"
            required
          />

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter task description"
              required
              rows={4}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
          </div>

          <MultiSelectDropdown
            label="Assign To"
            options={Array.isArray(availableUsers) ? availableUsers.map(user => ({ value: user.id, label: `${user.name} (${user.email})` })) : []}
            selectedValues={formData.assignedTo || []}
            onChange={(selectedUsers) => setFormData({ ...formData, assignedTo: selectedUsers })}
            placeholder="Select users to assign this task"
          />

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => handleCloseModal('editTask')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Update
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={confirmDelete.isOpen}
        onClose={cancelDeleteTask}
        onConfirm={confirmDeleteTask}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </Layout>
  );
};

export default TaskBoard;
