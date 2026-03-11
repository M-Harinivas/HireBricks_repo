import { Navigate } from 'react-router-dom';
import { useAuth, type Role } from '@/hooks/useAuth';

export const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: Role[] }) => {
  const { profile, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
