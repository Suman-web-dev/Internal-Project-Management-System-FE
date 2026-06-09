# Internal Project Management Tool

A real-time collaborative project management frontend application built with React, Redux Toolkit, and Socket.IO.

## Features

- **User Authentication**: Login with JWT token storage
- **Role-Based Access Control**: Admin and Member roles with different permissions
- **Project Management**: Create, view, and delete projects
- **Task Board**: Kanban-style board with drag-and-drop functionality
- **Real-Time Updates**: Socket.IO integration for live collaboration
- **Responsive Design**: Tailwind CSS for modern, responsive UI

## Tech Stack

- **React 19**: UI framework
- **Redux Toolkit**: State management
- **RTK Query**: API data fetching and caching
- **Socket.IO Client**: Real-time WebSocket communication
- **Tailwind CSS**: Utility-first CSS framework
- **React Router DOM**: Client-side routing
- **React Beautiful DND**: Drag-and-drop functionality
- **Axios**: HTTP client for API requests
- **date-fns**: Date formatting utilities

## Project Structure

`
src/
  components/       # Reusable UI components
    - FormInput.jsx
    - Modal.jsx
    - Loader.jsx
    - Toast.jsx
    - ProjectCard.jsx
    - TaskCard.jsx
  features/         # Redux slices and state management
    - authSlice.js
    - projectsSlice.js
    - tasksSlice.js
    - uiSlice.js
    - store.js
  pages/            # Screen components
    - Login.jsx
    - ProjectList.jsx
    - TaskBoard.jsx
  hooks/            # Custom React hooks
    - useAuth.js
    - useSocket.js
  services/         # API and socket services
    - api.js
    - socket.js
  utils/            # Helper utilities
    - constants.js
    - validation.js
  styles/           # Custom styles
  App.js            # Root component with routing
  index.js          # Entry point
`

## Installation

1. Install dependencies:
`ash
npm install
`

2. Create environment variables:
`ash
cp .env.example .env
`

3. Configure your API and Socket URLs in .env:
`
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
`

## Available Scripts

### 
pm start

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it.

### 
pm test

Launches the test runner in interactive watch mode.

### 
pm run build

Builds the app for production to the uild folder.

## User Roles

### Admin
- Create and delete projects
- Assign tasks to members
- Manage users
- Full access to all projects

### Member
- View assigned projects
- Update task status
- Add comments
- Limited to assigned projects

## Screens

### Login Screen
- Email and password authentication
- JWT token storage
- Error handling and validation

### Project List Screen
- Grid layout of project cards
- Admin-only project creation
- Project deletion (Admin only)
- Navigate to task board

### Task Board Screen
- Kanban board with three columns: Todo, In Progress, Done
- Drag-and-drop task management
- Real-time updates via Socket.IO
- Task creation, editing, and deletion
- Skeleton loaders and toast notifications

## API Endpoints

The application expects the following API endpoints:

- POST /auth/login - User authentication
- GET /projects - Fetch all projects
- POST /projects - Create new project
- PUT /projects/:id - Update project
- DELETE /projects/:id - Delete project
- GET /projects/:id/tasks - Fetch tasks for a project
- POST /projects/:id/tasks - Create new task
- PUT /projects/:id/tasks/:taskId - Update task
- DELETE /projects/:id/tasks/:taskId - Delete task
- PATCH /projects/:id/tasks/:taskId/move - Move task to different status

## Socket Events

The application listens to the following Socket.IO events:

- 	ask:created - New task created
- 	ask:updated - Task updated
- 	ask:deleted - Task deleted
- 	ask:moved - Task moved to different status
- project:created - New project created
- project:updated - Project updated
- project:deleted - Project deleted

## Development

The Tailwind CSS lint warnings in the IDE will disappear after running 
pm install to install the Tailwind CSS dependencies.

## License

This project is for internal use only.
