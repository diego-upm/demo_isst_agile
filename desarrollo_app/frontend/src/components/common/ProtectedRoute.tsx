import { Navigate, Outlet } from 'react-router-dom';
import { LoadingScreen } from '../feedback/LoadingScreen';
import { useAuth } from '../../features/auth/hooks/useAuth';
import type { UserRole } from '../../types/auth';
import { PATHS } from '../../routes/paths';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={PATHS.login} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'RRHH' ? PATHS.rrhhDashboard : PATHS.professionalDashboard} replace />;
  }

  return <Outlet />;
}
