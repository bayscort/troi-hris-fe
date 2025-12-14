import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { ReactNode } from 'react';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { authState } = useAuth();

  if (!authState.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;