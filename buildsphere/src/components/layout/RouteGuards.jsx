import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { WorkspaceProvider } from '../../context/WorkspaceContext';
import DashboardLayout from './DashboardLayout';

/** Only signed-in demo users can see /app. Others are sent to login and brought back afterwards. */
export function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return (
    <WorkspaceProvider key={user.email}>
      <DashboardLayout />
    </WorkspaceProvider>
  );
}

/** Login and signup redirect to the workspace when a session already exists. */
export function GuestOnly({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (user) return <Navigate to={location.state?.from?.pathname || '/app'} replace />;
  return children;
}
