import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Show a brief loading spinner to prevent redirect flashes 
    // while Zustand potentially hydrates state
    const timer = setTimeout(() => setIsChecking(false), 50);
    return () => clearTimeout(timer);
  }, []);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role?.toUpperCase() || "";
    const isAllowed = allowedRoles.some(r => r.toUpperCase() === userRole);
    
    if (!user || !isAllowed) {
      // Redirect to their actual role's home page to prevent infinite redirect loops
      if (userRole === "PROVIDER" && location.pathname !== "/provider") {
        return <Navigate to="/provider" replace />;
      }
      if (userRole === "ADMIN" && location.pathname !== "/admin") {
        return <Navigate to="/admin" replace />;
      }
      if (userRole === "USER" && location.pathname !== "/dashboard") {
        return <Navigate to="/dashboard" replace />;
      }
      // Fallback if they are already on their dashboard but somehow not allowed (?) or unknown role:
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
