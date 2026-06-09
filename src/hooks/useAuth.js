import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login as loginAction, logout as logoutAction, clearError } from '../features/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const login = async (email, password) => {
    const result = await dispatch(loginAction({ email, password }));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/projects');
      return true;
    }
    return false;
  };

  const logout = () => {
    dispatch(logoutAction());
    navigate('/login');
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    clearAuthError,
  };
};
