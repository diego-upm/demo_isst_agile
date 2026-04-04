import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PATHS } from '../../../routes/paths';
import type { UserRole } from '../../../types/auth';

export function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('rrhh@agileict.local');
  const [password, setPassword] = useState('demo1234');
  const [role, setRole] = useState<UserRole>('RRHH');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'RRHH' ? PATHS.rrhhDashboard : PATHS.professionalDashboard, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login({ email, password, role });
      const fallbackPath = role === 'RRHH' ? PATHS.rrhhDashboard : PATHS.professionalDashboard;
      const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || fallbackPath;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function loadDemo(roleToLoad: UserRole) {
    if (roleToLoad === 'RRHH') {
      setEmail('rrhh@agileict.local');
      setRole('RRHH');
    } else {
      setEmail('pro@agileict.local');
      setRole('PROFESSIONAL');
    }
    setPassword('demo1234');
  }

  return (
    <div className="centered-screen auth-screen">
      <div className="card auth-card">
        <span className="badge">Frontend inicial</span>
        <h1>Acceso a AgileICT</h1>
        <p>
          Base preparada para las dos áreas del MVP: Responsable de RRHH y Profesional Senior.
        </p>

        <div className="demo-box">
          <strong>Cuentas demo</strong>
          <div className="demo-actions">
            <button type="button" className="button button-secondary" onClick={() => loadDemo('RRHH')}>
              Cargar RRHH
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => loadDemo('PROFESSIONAL')}
            >
              Cargar Profesional
            </button>
          </div>
          <small>Contraseña de demo: demo1234</small>
        </div>

        <form onSubmit={handleSubmit} className="form-stack">
          <label>
            <span>Correo</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          <label>
            <span>Contraseña</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          <label>
            <span>Rol</span>
            <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              <option value="RRHH">Responsable RRHH</option>
              <option value="PROFESSIONAL">Profesional Senior</option>
            </select>
          </label>

          {error ? <div className="alert alert-error">{error}</div> : null}

          <button type="submit" className="button" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
