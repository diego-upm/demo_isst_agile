import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerCompanyWithBackend } from '../services/authService';
import { PATHS } from '../../../routes/paths';

export function RegisterCompanyPage() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [cif, setCif] = useState('');
  const [sector, setSector] = useState('');
  const [responsableNombre, setResponsableNombre] = useState('');
  const [responsableApellidos, setResponsableApellidos] = useState('');
  const [responsableEmail, setResponsableEmail] = useState('');
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
      await registerCompanyWithBackend({
        empresaNombre: nombre.trim(),
        cif: cif.trim(),
        sector: sector.trim() || undefined,
        responsableNombre: responsableNombre.trim(),
        responsableApellidos: responsableApellidos.trim(),
        responsableEmail: responsableEmail.trim(),
        password,
      });

      navigate(PATHS.login, {
        replace: true,
        state: { registrationSuccess: 'Empresa y usuario RRHH creados correctamente. Ya puedes iniciar sesion.' },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la empresa y el usuario RRHH.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="centered-screen auth-screen">
      <div className="card auth-card">
        <span className="badge">Nueva empresa</span>
        <h1>Crear empresa y usuario RRHH</h1>
        <p>Da de alta la empresa y la primera cuenta responsable asociada.</p>

        <form onSubmit={handleSubmit} className="form-stack">
          <h3>Datos de empresa</h3>

          <label>
            <span>Nombre de empresa</span>
            <input value={nombre} onChange={(event) => setNombre(event.target.value)} required />
          </label>

          <label>
            <span>CIF</span>
            <input value={cif} onChange={(event) => setCif(event.target.value)} required />
          </label>

          <label>
            <span>Sector</span>
            <input value={sector} onChange={(event) => setSector(event.target.value)} />
          </label>

          <h3>Responsable RRHH</h3>

          <label>
            <span>Nombre del responsable</span>
            <input value={responsableNombre} onChange={(event) => setResponsableNombre(event.target.value)} required />
          </label>

          <label>
            <span>Apellidos del responsable</span>
            <input value={responsableApellidos} onChange={(event) => setResponsableApellidos(event.target.value)} required />
          </label>

          <label>
            <span>Email del responsable</span>
            <input type="email" value={responsableEmail} onChange={(event) => setResponsableEmail(event.target.value)} required />
          </label>

          <label>
            <span>Contrasena</span>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required />
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
            {isSubmitting ? 'Creando...' : 'Crear empresa y usuario RRHH'}
          </button>
        </form>
      </div>

      <div className="return-actions">
        <Link to={PATHS.registerRrhh} className="button button-secondary">
          Volver a seleccionar empresa
        </Link>
      </div>
    </div>
  );
}
