import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { useNavigate } from 'react-router-dom';
import { PATHS } from '../../../routes/paths';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  deleteProceso,
  getMyRrhhContext,
  listProcesosByEmpresa,
  type ProcesoResponse,
} from '../services/processService';

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
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [processToDelete, setProcessToDelete] = useState<ProcesoResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleAskDelete = (process: ProcesoResponse) => {
    setActionMessage(null);
    setProcessToDelete(process);
  };

  const handleCancelDelete = () => {
    if (isDeleting) {
      return;
    }

    setProcessToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!token || !processToDelete) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    setActionMessage(null);

    try {
      await deleteProceso(token, processToDelete.id);
      setProcesses((current) => current.filter((process) => process.id !== processToDelete.id));
      setActionMessage('Proceso eliminado correctamente.');
      setProcessToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el proceso.');
    } finally {
      setIsDeleting(false);
    }
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
      {actionMessage ? <div className="alert alert-success">{actionMessage}</div> : null}
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
                <p>{process.descripcion || 'Descripción no indicada'}</p>
              </div>
              <div className="page-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => handleOpenDetail(process.id)}
                >
                  Abrir detalle
                </button>
                <button
                  type="button"
                  className="button button-secondary button-danger"
                  onClick={() => handleAskDelete(process)}
                >
                  Eliminar proceso
                </button>
              </div>
            </div>
          </article>
          ))}
        </div>
      ) : null}

      {processToDelete ? (
        <div className="confirm-overlay" role="dialog" aria-modal="true">
          <article className="card confirm-card">
            <h3>Confirmar eliminacion</h3>
            <p>
              Vas a eliminar el proceso <strong>{processToDelete.titulo || processToDelete.id}</strong>. Esta accion no
              se puede deshacer.
            </p>
            <div className="page-actions">
              <button
                type="button"
                className="button button-secondary"
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="button button-danger"
                onClick={() => void handleConfirmDelete()}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Si, eliminar proceso'}
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
