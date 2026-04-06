import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createCompanyWithBackend, type CompanyOption } from '../services/authService';
import { PATHS } from '../../../routes/paths';

export function RegisterCompanyPage() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [cif, setCif] = useState('');
  const [sector, setSector] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const company = await createCompanyWithBackend({
        nombre: nombre.trim(),
        cif: cif.trim(),
        sector: sector.trim() || undefined,
      });

      navigate(PATHS.registerRrhh, {
        replace: true,
        state: { createdCompany: company satisfies CompanyOption },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la empresa.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="centered-screen auth-screen">
      <div className="card auth-card">
        <span className="badge">Nueva empresa</span>
        <h1>Crear empresa</h1>
        <p>Si tu empresa no aparece en el listado, crea su ficha y vuelve al registro RRHH.</p>

        <form onSubmit={handleSubmit} className="form-stack">
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

          {error ? <div className="alert alert-error">{error}</div> : null}

          <button type="submit" className="button" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar empresa'}
          </button>
        </form>
      </div>

      <div className="return-actions">
        <Link to={PATHS.registerRrhh} className="button button-secondary">
          Volver al registro RRHH
        </Link>
      </div>
    </div>
  );
}
