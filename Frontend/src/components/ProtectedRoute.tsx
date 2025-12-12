// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'Admin' | 'Tutor' | 'User';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole) {
    // Check if user has required role
    const userRole = user?.role || user?.userType;
    
    if (requiredRole === 'Admin' && userRole !== 'Admin') {
      return <Navigate to="/" />;
    }
    
    if (requiredRole === 'Tutor' && !['Tutor', 'Admin'].includes(userRole || '')) {
      return <Navigate to="/" />;
    }
    
    if (requiredRole === 'User' && !['User', 'Tutor', 'Admin'].includes(userRole || '')) {
      return <Navigate to="/" />;
    }
  }

  return <>{children}</>;
};