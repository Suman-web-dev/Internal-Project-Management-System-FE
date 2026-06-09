import React from 'react';
import { format } from 'date-fns';

const ProjectCard = ({ project, onClick, onDelete, canDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'archived':
        return 'Archived';
      default:
        return status;
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer p-6 border border-gray-100 hover:border-blue-200 group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {project.name}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
              {getStatusLabel(project.status)}
            </span>
          </div>
        </div>
        {canDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project.id);
            }}
            className="text-gray-400 hover:text-red-500 focus:outline-none transition-colors p-1 rounded hover:bg-red-50"
            title="Delete project"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
        {project.description || 'No description provided'}
      </p>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {project.members?.slice(0, 3).map((member, index) => (
              <div
                key={index}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white shadow-sm"
                title={member.name || member.email}
              >
                {member.name?.charAt(0).toUpperCase() || member.email?.charAt(0).toUpperCase()}
              </div>
            ))}
            {project.members?.length > 3 && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white shadow-sm">
                +{project.members.length - 3}
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}
          </span>
        </div>
        <span className="text-xs text-gray-400">
          {project.createdAt && format(new Date(project.createdAt), 'MMM d, yyyy')}
        </span>
      </div>
    </div>
  );
};

export default ProjectCard;
