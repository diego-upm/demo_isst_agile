import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerRrhhWithBackend } from '../services/authService';
import { PATHS } from '../../../routes/paths';

export function RegisterRrhhPage() {
  const navigate = useNavigate();
  const [empresaNombre, setEmpresaNombre] = useState('');
  const [cif, setCif] = useState('');
  const [sector, setSector] = useState('');
  const [responsableNombre, setResponsableNombre] = useState('');
  const [responsableApellidos, setResponsableApellidos] = useState('');
  const [responsableEmail, setResponsableEmail] = useState('');
  const [cargo, setCargo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('La confirmacion de contrasena no coincide.');
      return;
    }

    setIsSubmitting(true);

    try {
      await registerRrhhWithBackend({
        empresaNombre: empresaNombre.trim(),
        cif: cif.trim(),
        sector: sector.trim() || undefined,
        responsableNombre: responsableNombre.trim(),
        responsableApellidos: responsableApellidos.trim(),
        responsableEmail: responsableEmail.trim(),
        password,
        cargo: cargo.trim() || undefined,
      });

      navigate(PATHS.login, {
        replace: true,
        state: { registrationSuccess: 'Usuario RRHH creado correctamente. Ya puedes iniciar sesion.' },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el usuario RRHH.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="centered-screen auth-screen">
      <div className="card auth-card">
        <span className="badge">Alta RRHH</span>
        <h1>Crear usuario RRHH</h1>
        <p>Completa los datos de empresa y responsable para registrar una cuenta de RRHH.</p>

        <form onSubmit={handleSubmit} className="form-stack">
          <label>
            <span>Nombre de empresa</span>
            <input value={empresaNombre} onChange={(event) => setEmpresaNombre(event.target.value)} required />
          </label>

          <label>
            <span>CIF</span>
            <input value={cif} onChange={(event) => setCif(event.target.value)} required />
          </label>

          <label>
            <span>Sector</span>
            <input value={sector} onChange={(event) => setSector(event.target.value)} />
          </label>

          <label>
            <span>Nombre del responsable</span>
            <input
              value={responsableNombre}
              onChange={(event) => setResponsableNombre(event.target.value)}
              required
            />
          </label>

          <label>
            <span>Apellidos del responsable</span>
            <input
              value={responsableApellidos}
              onChange={(event) => setResponsableApellidos(event.target.value)}
              required
            />
          </label>

          <label>
            <span>Email del responsable</span>
            <input
              type="email"
              value={responsableEmail}
              onChange={(event) => setResponsableEmail(event.target.value)}
              required
            />
          </label>

          <label>
            <span>Cargo</span>
            <input value={cargo} onChange={(event) => setCargo(event.target.value)} />
          </label>

          <label>
            <span>Contrasena</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </label>

          <label>
            <span>Confirmar contrasena</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              required
            />
          </label>

          {error ? <div className="alert alert-error">{error}</div> : null}

          <button type="submit" className="button" disabled={isSubmitting}>
            {isSubmitting ? 'Creando...' : 'Crear usuario RRHH'}
          </button>
        </form>
      </div>

      <div className="return-actions">
        <Link to={PATHS.login} className="button button-secondary">
          Volver
        </Link>
      </div>
    </div>
  );
}
