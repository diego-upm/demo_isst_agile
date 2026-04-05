import { Link } from 'react-router-dom';
import { PATHS } from '../../../routes/paths';

export function RegisterChoicePage() {
  return (
    <div className="centered-screen auth-screen">
      <div className="card auth-card form-stack">
        <span className="badge">Crear usuario</span>
        <h1>Que tipo de usuario quieres crear?</h1>
        <p>Selecciona el tipo de cuenta para completar el formulario correspondiente.</p>

        <Link to={PATHS.registerProfessional} className="button">
          Perfil profesional
        </Link>
        <Link to={PATHS.registerRrhh} className="button button-secondary">
          Usuario RRHH
        </Link>
      </div>

      <div className="return-actions">
        <Link to={PATHS.login} className="button button-secondary">
          Volver
        </Link>
      </div>
    </div>
  );
}
