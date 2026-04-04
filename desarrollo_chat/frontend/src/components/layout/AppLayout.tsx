import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { PATHS } from '../../routes/paths';

interface NavigationItem {
  label: string;
  to: string;
}

const rrhhNavigation: NavigationItem[] = [
  { label: 'Inicio RRHH', to: PATHS.rrhhDashboard },
  { label: 'Suscripción', to: PATHS.rrhhSubscription },
  { label: 'Procesos', to: PATHS.rrhhProcesses },
  { label: 'Selección', to: PATHS.rrhhSelection },
];

const professionalNavigation: NavigationItem[] = [
  { label: 'Inicio Profesional', to: PATHS.professionalDashboard },
  { label: 'Mi perfil', to: PATHS.professionalProfile },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = user?.role === 'RRHH' ? rrhhNavigation : professionalNavigation;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand-block">
            <span className="badge">MVP</span>
            <h2>AgileICT</h2>
            <p>Headhunting tecnológico senior</p>
          </div>

          <nav className="nav-list">
            {navigation.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to} className={isActive ? 'nav-item active' : 'nav-item'}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-box">
            <strong>{user?.fullName}</strong>
            <span>{user?.email}</span>
            <span>Rol: {user?.role}</span>
          </div>
          <button type="button" className="button button-secondary" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
