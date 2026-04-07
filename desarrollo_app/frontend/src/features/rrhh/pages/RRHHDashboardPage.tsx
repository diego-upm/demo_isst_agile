import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/common/PageHeader';
import { PATHS } from '../../../routes/paths';
import { useAuth } from '../../auth/hooks/useAuth';
import { getMyRrhhContext } from '../services/processService';

interface RrhhWelcomeContext {
  nombre: string;
  apellidos: string;
  empresaClienteNombre: string;
  empresaClienteSector?: string | null;
}

function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName.trim();
}

export function RRHHDashboardPage() {
  const { token } = useAuth();
  const [context, setContext] = useState<RrhhWelcomeContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No hay sesion activa para cargar la bienvenida RRHH.');
      setIsLoading(false);
      return;
    }

    const authToken = token;

    let isMounted = true;

    async function loadContext() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getMyRrhhContext(authToken);
        if (!isMounted) {
          return;
        }

        setContext({
          nombre: response.nombre,
          apellidos: response.apellidos,
          empresaClienteNombre: response.empresaClienteNombre,
          empresaClienteSector: response.empresaClienteSector,
        });
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(err instanceof Error ? err.message : 'No se pudo cargar la informacion de bienvenida.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadContext();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const welcomeTitle = context ? `Hola de nuevo ${getFirstName(context.nombre)}` : 'Panel RRHH';

  const companyDescription = context?.empresaClienteSector
    ? `Descripcion: ${context.empresaClienteSector}`
    : 'Descripcion: no disponible';

  return (
    <section>
      <PageHeader
        title={welcomeTitle}
        description="Vista inicial para la empresa cliente: suscripción, procesos de headhunting y gestión de selección."
        actions={
          <Link to={PATHS.rrhhProcesses} className="button">
            Ver procesos
          </Link>
        }
      />

      {error ? <div className="alert alert-error">{error}</div> : null}
      {isLoading ? <div className="card">Cargando bienvenida...</div> : null}

      <div className="rrhh-dashboard-layout">
        <article className="card rrhh-company-card">
          <h3>Empresa</h3>
          <p>{context?.empresaClienteNombre || 'Sin empresa asignada'}</p>
          <p>{companyDescription}</p>
        </article>

        <div className="grid-cards rrhh-bottom-cards">
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
      </div>
    </section>
  );
}
