import React, { useState } from 'react';
import { format } from 'date-fns';
import { TASK_STATUS, TASK_STATUS_LABELS } from '../utils/constants';

// Task card component - displays individual task with status change dropdown
const TaskCard = ({ task, onEdit, onDelete, onStatusChange, canEdit, canDelete }) => {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Handle status change and close dropdown
  const handleStatusChange = (newStatus) => {
    onStatusChange(task.id, newStatus);
    setShowStatusDropdown(false);
  };

  // Get color class based on task status for visual distinction
  const getStatusColor = (status) => {
    switch (status) {
      case TASK_STATUS.TODO:
        return 'bg-gray-100 text-gray-700';
      case TASK_STATUS.IN_PROGRESS:
        return 'bg-blue-100 text-blue-700';
      case TASK_STATUS.DONE:
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-4 mb-3 border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-200 group`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900 text-sm flex-1 pr-2">{task.title}</h4>
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowStatusDropdown(!showStatusDropdown);
              }}
              className="text-gray-400 hover:text-blue-500 focus:outline-none p-1 rounded hover:bg-blue-50 transition-colors"
              title="Change status"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </button>
            {showStatusDropdown && (
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                {Object.values(TASK_STATUS).map((status) => (
                  <button
                    key={status}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(status);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                      task.status === status ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {TASK_STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            )}
          </div>
          {canEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="text-gray-400 hover:text-blue-500 focus:outline-none p-1 rounded hover:bg-blue-50 transition-colors"
              title="Edit task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="text-gray-400 hover:text-red-500 focus:outline-none p-1 rounded hover:bg-red-50 transition-colors"
              title="Delete task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">{task.description || 'No description'}</p>
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
          {TASK_STATUS_LABELS[task.status]}
        </span>
        {task.assignedTo ? (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-medium shadow-sm">
              {task.assignedTo.name?.charAt(0).toUpperCase() || task.assignedTo.email?.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-500 truncate max-w-[100px]">{task.assignedTo.name || task.assignedTo.email}</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-xs text-gray-400">Unassigned</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
