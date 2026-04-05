import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../../routes/paths';
import { useAuth } from '../../auth/hooks/useAuth';
import { getMyRrhhContext, listProcesosByEmpresa, type ProcesoResponse } from '../services/processService';

function mapProcessStatus(status?: string): string {
  if (status === 'ACTIVE') return 'Activo';
  if (status === 'IN_SELECTION') return 'En seleccion';
  if (status === 'CLOSED') return 'Cerrado';
  if (status === 'CANCELLED') return 'Cancelado';
  return 'Sin estado';
}

export function ProcessesPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [processes, setProcesses] = useState<ProcesoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No hay sesion activa para consultar procesos.');
      setIsLoading(false);
      return;
    }

    const authToken = token;
    let isMounted = true;

    async function loadProcesses() {
      setIsLoading(true);
      setError(null);

      try {
        const rrhhContext = await getMyRrhhContext(authToken);
        const loadedProcesses = await listProcesosByEmpresa(authToken, rrhhContext.empresaClienteId);

        if (!isMounted) {
          return;
        }

        setProcesses(loadedProcesses);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(err instanceof Error ? err.message : 'No se pudieron cargar los procesos.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProcesses();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const hasProcesses = useMemo(() => processes.length > 0, [processes]);

  const handleOpenDetail = (processId: string) => {
    navigate(`${PATHS.rrhhSelection}?processId=${encodeURIComponent(processId)}`);
  };

  return (
    <section>
      <PageHeader
        title="Procesos de headhunting"
        description="Listado base para el caso de uso iniciar y gestionar procesos de selección."
        actions={
          <button type="button" className="button" onClick={() => navigate(PATHS.rrhhProcessesNew)}>
            Crear nuevo proceso
          </button>
        }
      />

      {error ? <div className="alert alert-error">{error}</div> : null}
      {isLoading ? <div className="card">Cargando procesos...</div> : null}

      {!isLoading && !hasProcesses ? (
        <div className="card">Todavia no hay procesos creados para tu empresa.</div>
      ) : null}

      {!isLoading && hasProcesses ? (
        <div className="list-stack">
          {processes.map((process) => (
          <article key={process.id} className="card">
            <div className="card-row">
              <div>
                <span className="badge">{mapProcessStatus(process.estado)}</span>
                <h3>{process.titulo || 'Proceso sin titulo'}</h3>
                <p>{process.tecnologiasRequeridas || 'Tecnologias sin definir'}</p>
              </div>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => handleOpenDetail(process.id)}
              >
                Abrir detalle
              </button>
            </div>
          </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}
