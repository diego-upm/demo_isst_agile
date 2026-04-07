import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/common/PageHeader';
import { useAuth } from '../../auth/hooks/useAuth';
import { PATHS } from '../../../routes/paths';
import {
  acceptCandidatureRequest,
  acceptVisibilityRequest,
  getMyCandidatures,
  rejectCandidatureRequest,
  rejectVisibilityRequest,
} from '../services/visibilityRequestsService';
import type { SelectionBoardItemResponse } from '../../rrhh/services/selectionService';

function mapVisibilityState(state?: string | null): string {
  if (state === 'ACEPTADO') return 'Identidad visible';
  if (state === 'RECHAZADO') return 'Identidad rechazada';
  if (state === 'SOLICITADO') return 'Identidad solicitada';
  return 'Sin solicitud';
}

function mapCandidateState(state?: string | null): string {
  if (state === 'ACEPTADO') return 'Aceptado';
  if (state === 'RECHAZADO') return 'Rechazado';
  if (state === 'PENDIENTE') return 'Pendiente';
  return 'Sin estado';
}

type CandidateFilter = 'all' | 'pending' | 'accepted' | 'rejected' | 'visibilityRequested' | 'identityVisible';

export function ProfessionalDashboardPage() {
  const { token } = useAuth();
  const [candidatures, setCandidatures] = useState<SelectionBoardItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<CandidateFilter>('all');

  useEffect(() => {
    if (!token) {
      setError('No hay sesion activa para cargar candidaturas.');
      setIsLoading(false);
      return;
    }

    const authToken = token;
    let isMounted = true;

    async function loadCandidatures() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getMyCandidatures(authToken);
        if (!isMounted) {
          return;
        }

        setCandidatures(response);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(err instanceof Error ? err.message : 'No se pudieron cargar las candidaturas.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCandidatures();

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function handleVisibilityDecision(candidaturaId: string, decision: 'accept' | 'reject') {
    if (!token) {
      return;
    }

    setBusyId(candidaturaId);
    setError(null);

    try {
      if (decision === 'accept') {
        await acceptVisibilityRequest(token, candidaturaId);
      } else {
        await rejectVisibilityRequest(token, candidaturaId);
      }

      const refreshed = await getMyCandidatures(token);
      setCandidatures(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la solicitud.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleCandidatureDecision(candidaturaId: string, decision: 'accept' | 'reject') {
    if (!token) {
      return;
    }

    setBusyId(candidaturaId);
    setError(null);

    try {
      if (decision === 'accept') {
        await acceptCandidatureRequest(token, candidaturaId);
      } else {
        await rejectCandidatureRequest(token, candidaturaId);
      }

      const refreshed = await getMyCandidatures(token);
      setCandidatures(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la candidatura.');
    } finally {
      setBusyId(null);
    }
  }

  const filteredCandidatures = useMemo(
    () =>
      candidatures.filter((item) => {
        if (filter === 'pending') return item.estado === 'PENDIENTE';
        if (filter === 'accepted') return item.estado === 'ACEPTADO';
        if (filter === 'rejected') return item.estado === 'RECHAZADO';
        if (filter === 'visibilityRequested') return item.solicitudVisibilidad === 'SOLICITADO';
        if (filter === 'identityVisible') return item.solicitudVisibilidad === 'ACEPTADO';
        return true;
      }),
    [candidatures, filter],
  );

  return (
    <section>
      <PageHeader
        title="Mis candidaturas"
        description="Consulta todos los procesos en los que has sido incluido y filtra por fase o visibilidad."
        actions={
          <Link to={PATHS.professionalProfile} className="button">
            Editar perfil
          </Link>
        }
      />

      <div className="grid-cards">
        <article className="card">
          <h3>Todos los procesos</h3>
          <p>Se muestran todas tus candidaturas, independientemente del estado interno.</p>
        </article>
        <article className="card">
          <h3>Filtros rápidos</h3>
          <p>Puedes filtrar por fase, visibilidad solicitada o identidad ya visible.</p>
        </article>
        <article className="card">
          <h3>Acciones</h3>
          <p>Responde a solicitudes de identidad o revisa el estado de cada proceso.</p>
        </article>
      </div>

      <article className="card" style={{ marginTop: '1rem' }}>
        <div className="selection-column-header">
          <div>
            <h3>Histórico de candidaturas</h3>
            <p>Primero aparecen todos los procesos; después puedes filtrar por fase o visibilidad.</p>
          </div>
          <span className="badge">{candidatures.length}</span>
        </div>

        {error ? <div className="alert alert-error">{error}</div> : null}
        {isLoading ? <div className="selection-empty" style={{ marginTop: '1rem' }}>Cargando candidaturas...</div> : null}

        {!isLoading ? (
          <div className="filter-bar" style={{ marginTop: '1rem' }}>
            <button type="button" className={filter === 'all' ? 'button button-small' : 'button button-secondary button-small'} onClick={() => setFilter('all')}>
              Todos
            </button>
            <button type="button" className={filter === 'pending' ? 'button button-small' : 'button button-secondary button-small'} onClick={() => setFilter('pending')}>
              Pendientes
            </button>
            <button type="button" className={filter === 'accepted' ? 'button button-small' : 'button button-secondary button-small'} onClick={() => setFilter('accepted')}>
              Aceptados
            </button>
            <button type="button" className={filter === 'rejected' ? 'button button-small' : 'button button-secondary button-small'} onClick={() => setFilter('rejected')}>
              Rechazados
            </button>
            <button type="button" className={filter === 'visibilityRequested' ? 'button button-small' : 'button button-secondary button-small'} onClick={() => setFilter('visibilityRequested')}>
              Identidad solicitada
            </button>
            <button type="button" className={filter === 'identityVisible' ? 'button button-small' : 'button button-secondary button-small'} onClick={() => setFilter('identityVisible')}>
              Identidad visible
            </button>
          </div>
        ) : null}

        {!isLoading && filteredCandidatures.length === 0 ? (
          <div className="selection-empty" style={{ marginTop: '1rem' }}>
            No hay candidaturas para el filtro seleccionado.
          </div>
        ) : null}

        {!isLoading && filteredCandidatures.length > 0 ? (
          <div className="selection-list" style={{ marginTop: '1rem' }}>
            {filteredCandidatures.map((request) => (
              <div key={request.candidaturaId ?? request.procesoId} className="selection-item">
                <div className="selection-item-content">
                  <div className="selection-item-header">
                    <strong>{request.procesoTitulo || 'Proceso sin título'}</strong>
                    <span className="status-chip status-chip-state">{mapCandidateState(request.estado)}</span>
                  </div>
                  <p>{request.tecnologiasClave || 'Tecnologías no indicadas'}</p>
                  <p className="selection-item-muted">
                    Visibilidad: {mapVisibilityState(request.solicitudVisibilidad)} ·{' '}
                    {request.anonimo ? 'Identidad oculta' : 'Identidad visible'}
                  </p>
                </div>

                <div className="selection-item-actions">
                  {request.estado === 'PENDIENTE' && request.candidaturaId ? (
                    <>
                      <button
                        type="button"
                        className="button button-small"
                        onClick={() => void handleCandidatureDecision(request.candidaturaId!, 'accept')}
                        disabled={busyId === request.candidaturaId}
                      >
                        {busyId === request.candidaturaId ? 'Guardando...' : 'Aceptar solicitud'}
                      </button>
                      <button
                        type="button"
                        className="button button-secondary button-small"
                        onClick={() => void handleCandidatureDecision(request.candidaturaId!, 'reject')}
                        disabled={busyId === request.candidaturaId}
                      >
                        Rechazar solicitud
                      </button>
                    </>
                  ) : null}

                  {request.solicitudVisibilidad === 'SOLICITADO' && request.candidaturaId ? (
                    <>
                      <button
                        type="button"
                        className="button button-small"
                        onClick={() => void handleVisibilityDecision(request.candidaturaId!, 'accept')}
                        disabled={busyId === request.candidaturaId}
                      >
                        {busyId === request.candidaturaId ? 'Guardando...' : 'Aceptar identidad'}
                      </button>
                      <button
                        type="button"
                        className="button button-secondary button-small"
                        onClick={() => void handleVisibilityDecision(request.candidaturaId!, 'reject')}
                        disabled={busyId === request.candidaturaId}
                      >
                        Rechazar identidad
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </article>
    </section>
  );
}
