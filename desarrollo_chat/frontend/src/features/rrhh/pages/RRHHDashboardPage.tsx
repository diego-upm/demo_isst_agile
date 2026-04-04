import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/common/PageHeader';
import { PATHS } from '../../../routes/paths';

export function RRHHDashboardPage() {
  return (
    <section>
      <PageHeader
        title="Panel RRHH"
        description="Vista inicial para la empresa cliente: suscripción, procesos de headhunting y gestión de selección."
        actions={
          <Link to={PATHS.rrhhProcesses} className="button">
            Ver procesos
          </Link>
        }
      />

      <div className="grid-cards">
        <article className="card">
          <h3>Suscripción activa</h3>
          <p>Preparado para conectar con el endpoint de suscripción y mostrar plan, fechas y estado.</p>
        </article>

        <article className="card">
          <h3>Procesos de headhunting</h3>
          <p>Base para listar procesos abiertos, filtrarlos y entrar al detalle de cada selección.</p>
        </article>

        <article className="card">
          <h3>Selección confidencial</h3>
          <p>Zona reservada para candidatos autorizados, estados del proceso y trazabilidad futura.</p>
        </article>
      </div>
    </section>
  );
}
