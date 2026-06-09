export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateRequired = (value) => {
  return value !== null && value !== undefined && value !== '';
};

export const validateLoginForm = (email, password) => {
  const errors = {};
  
  if (!validateEmail(email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  if (!validatePassword(password)) {
    errors.password = 'Password must be at least 6 characters';
  }
  
  return errors;
};

export const validateProjectForm = (name, description) => {
  const errors = {};
  
  if (!validateRequired(name)) {
    errors.name = 'Name is required';
  }
  
  if (!validateRequired(description)) {
    errors.description = 'Description is required';
  }
  
  return errors;
};

export const validateTaskForm = (title, description) => {
  const errors = {};
  
  if (!validateRequired(title)) {
    errors.title = 'Title is required';
  }
  
  if (!validateRequired(description)) {
    errors.description = 'Description is required';
  }
  
  return errors;
};
