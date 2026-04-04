import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { ProtectedRoute } from '../../components/common/ProtectedRoute';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { RRHHDashboardPage } from '../../features/rrhh/pages/RRHHDashboardPage';
import { ProcessesPage } from '../../features/rrhh/pages/ProcessesPage';
import { SelectionPage } from '../../features/rrhh/pages/SelectionPage';
import { SubscriptionPage } from '../../features/rrhh/pages/SubscriptionPage';
import { ProfessionalDashboardPage } from '../../features/professional/pages/ProfessionalDashboardPage';
import { ProfilePage } from '../../features/professional/pages/ProfilePage';
import { PATHS } from '../../routes/paths';

export function AppRouter() {
  return (
    <Routes>
      <Route path={PATHS.login} element={<LoginPage />} />

      <Route element={<ProtectedRoute allowedRoles={['RRHH', 'PROFESSIONAL']} />}>
        <Route element={<AppLayout />}>
          <Route path={PATHS.home} element={<Navigate to={PATHS.login} replace />} />

          <Route element={<ProtectedRoute allowedRoles={['RRHH']} />}>
            <Route path={PATHS.rrhhDashboard} element={<RRHHDashboardPage />} />
            <Route path={PATHS.rrhhSubscription} element={<SubscriptionPage />} />
            <Route path={PATHS.rrhhProcesses} element={<ProcessesPage />} />
            <Route path={PATHS.rrhhSelection} element={<SelectionPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['PROFESSIONAL']} />}>
            <Route path={PATHS.professionalDashboard} element={<ProfessionalDashboardPage />} />
            <Route path={PATHS.professionalProfile} element={<ProfilePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={PATHS.login} replace />} />
    </Routes>
  );
}
