import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/common/PageHeader';
import { PATHS } from '../../../routes/paths';

export function ProfessionalDashboardPage() {
  return (
    <section>
      <PageHeader
        title="Panel Profesional Senior"
        description="Vista inicial para registro, actualización de disponibilidad y gestión de perfil profesional."
        actions={
          <Link to={PATHS.professionalProfile} className="button">
            Editar perfil
          </Link>
        }
      />

      <div className="grid-cards">
        <article className="card">
          <h3>Perfil privado</h3>
          <p>El frontend ya reserva la zona donde se mostrará el consentimiento de visibilidad.</p>
        </article>
        <article className="card">
          <h3>Disponibilidad</h3>
          <p>Preparado para conectar preferencias, estado laboral y tecnologías principales.</p>
        </article>
        <article className="card">
          <h3>Autorizaciones</h3>
          <p>Espacio base para futuras solicitudes de empresa y respuesta del profesional.</p>
        </article>
      </div>
    </section>
  );
}
