import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { PATHS } from '../../../routes/paths';

export function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('rrhh@agileict.local');
  const [password, setPassword] = useState('demo1234');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const registrationSuccess =
    (location.state as { registrationSuccess?: string } | null)?.registrationSuccess || '';

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
      const authenticatedUser = await login({ email, password });
      const fallbackPath = authenticatedUser.role === 'RRHH' ? PATHS.rrhhDashboard : PATHS.professionalDashboard;
      const redirectTo = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || fallbackPath;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function loadDemoAccount(account: 'RRHH' | 'PROFESSIONAL') {
    if (account === 'RRHH') {
      setEmail('rrhh@agileict.local');
    } else {
      setEmail('pro@agileict.local');
    }
    setPassword('demo1234');
    setError('');
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
            <button type="button" className="button button-secondary" onClick={() => loadDemoAccount('RRHH')}>
              Cargar RRHH
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => loadDemoAccount('PROFESSIONAL')}
            >
              Cargar Profesional
            </button>
          </div>
          <small>
            Puedes usar `rrhh@agileict.local` o `pro@agileict.local` con contraseña `demo1234`. La redirección se
            hace automáticamente según el rol del usuario autenticado.
          </small>
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

          {error ? <div className="alert alert-error">{error}</div> : null}
          {registrationSuccess ? <div className="alert alert-success">{registrationSuccess}</div> : null}

          <button type="submit" className="button" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Iniciar sesión'}
          </button>

          <button type="button" className="button button-secondary" onClick={() => navigate(PATHS.registerChoice)}>
            Crear usuario
          </button>
        </form>
      </div>
    </div>
  );
}
