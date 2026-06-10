import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { openModal, closeModal, addToast, setSelectedProject } from '../features/uiSlice';
import ProjectCard from '../components/ProjectCard';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import Loader from '../components/Loader';
import Layout from '../components/Layout';
import { validateProjectForm } from '../utils/validation';
import { USER_ROLES } from '../utils/constants';
import { useGetProjectsQuery, useCreateProjectMutation, useUpdateProjectMutation, useDeleteProjectMutation } from '../services/projectsApiSlice';
import { useGetAllUsersQuery } from '../services/authApiSlice';
import MultiSelectDropdown from '../components/MultiSelectDropdown';
import ConfirmationModal from '../components/ConfirmationModal';

const ProjectList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { modals } = useSelector((state) => state.ui);
  const [formData, setFormData] = useState({ name: '', description: '', members: [] });
  const [formErrors, setFormErrors] = useState({});
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, projectId: null });

  const isAdmin = user?.role === USER_ROLES.ADMIN;

  const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useGetProjectsQuery();
  const { data: users = [], isLoading: usersLoading } = useGetAllUsersQuery(undefined, {
    skip: !isAdmin,
  });
  const [createProject] = useCreateProjectMutation();
  const [updateProject] = useUpdateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  const handleProjectClick = (project) => {
    dispatch(setSelectedProject(project));
    navigate(`/projects/${project.id}/tasks`);
  };

  const handleDeleteProject = (projectId) => {
    setConfirmDelete({ isOpen: true, projectId });
  };

  const confirmDeleteProject = async () => {
    try {
      await deleteProject(confirmDelete.projectId).unwrap();
      dispatch(addToast({ message: 'Project deleted successfully', type: 'success' }));
    } catch (error) {
      dispatch(addToast({ message: 'Failed to delete project', type: 'error' }));
    }
    setConfirmDelete({ isOpen: false, projectId: null });
  };

  const cancelDeleteProject = () => {
    setConfirmDelete({ isOpen: false, projectId: null });
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    const errors = validateProjectForm(formData.name, formData.description);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    try {
      await createProject(formData).unwrap();
      dispatch(closeModal('createProject'));
      dispatch(addToast({ message: 'Project created successfully', type: 'success' }));
      setFormData({ name: '', description: '', members: [] });
    } catch (error) {
      dispatch(addToast({ message: 'Failed to create project', type: 'error' }));
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    const errors = validateProjectForm(formData.name, formData.description);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    try {
      const { id, ...projectData } = formData;
      await updateProject({ id: formData.id, projectData }).unwrap();
      dispatch(closeModal('editProject'));
      dispatch(addToast({ message: 'Project updated successfully', type: 'success' }));
      setFormData({ name: '', description: '', members: [] });
    } catch (error) {
      dispatch(addToast({ message: 'Failed to update project', type: 'error' }));
    }
  };

  const handleEditProject = (project) => {
    setFormData({
      id: project.id,
      name: project.name,
      description: project.description,
      members: project.members?.map(member => member.id) || []
    });
    dispatch(openModal('editProject'));
  };

  const handleOpenCreateModal = () => {
    dispatch(openModal('createProject'));
  };

  const handleCloseModal = (modalName) => {
    dispatch(closeModal(modalName));
    setFormData({ name: '', description: '', members: [] });
    setFormErrors({});
  };

  const filteredProjects = isAdmin
    ? projects
    : projects.filter((project) => project.members?.some((member) => member.id === user?.id));

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Projects</h1>
          {isAdmin && (
            <button
              onClick={handleOpenCreateModal}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              Create Project
            </button>
          )}
        </div>

        {projectsError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {projectsError.message || 'Failed to load projects'}
          </div>
        )}

        {projectsLoading || usersLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader size="lg" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No projects found</p>
            {isAdmin && (
              <button
                onClick={handleOpenCreateModal}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                Create your first project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project)}
                onDelete={handleDeleteProject}
                onEdit={handleEditProject}
                canDelete={isAdmin}
                canEdit={isAdmin}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={modals.createProject}
        onClose={() => handleCloseModal('createProject')}
        title="Create New Project"
      >
        <form onSubmit={handleCreateProject}>
          <FormInput
            label="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            placeholder="Enter project name"
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
              placeholder="Enter project description"
              required
              rows={4}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
          </div>

          <MultiSelectDropdown
            label="Assign Members"
            options={Array.isArray(users) ? users.map(user => ({ value: user.id, label: `${user.name} (${user.email})` })) : []}
            selectedValues={formData.members || []}
            onChange={(selectedMembers) => setFormData({ ...formData, members: selectedMembers })}
            placeholder="Select members to assign"
          />

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => handleCloseModal('createProject')}
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
        isOpen={modals.editProject}
        onClose={() => handleCloseModal('editProject')}
        title="Edit Project"
      >
        <form onSubmit={handleUpdateProject}>
          <FormInput
            label="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            placeholder="Enter project name"
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
              placeholder="Enter project description"
              required
              rows={4}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                formErrors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
          </div>

          <MultiSelectDropdown
            label="Assign Members"
            options={Array.isArray(users) ? users.map(user => ({ value: user.id, label: `${user.name} (${user.email})` })) : []}
            selectedValues={formData.members || []}
            onChange={(selectedMembers) => setFormData({ ...formData, members: selectedMembers })}
            placeholder="Select members to assign"
          />

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => handleCloseModal('editProject')}
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
        onClose={cancelDeleteProject}
        onConfirm={confirmDeleteProject}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </Layout>
  );
};

export default ProjectList;
