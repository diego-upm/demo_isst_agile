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

function mapProcessState(state?: string | null): string {
  if (state === 'ACTIVE') return 'Activo';
  if (state === 'IN_SELECTION') return 'En selección';
  if (state === 'CLOSED') return 'Cerrado';
  if (state === 'CANCELLED') return 'Cancelado';
  return 'No indicado';
}

function mapConfidentiality(value?: string | null): string {
  if (value === 'INTERNAL') return 'Interno';
  if (value === 'CONFIDENTIAL') return 'Confidencial';
  return 'No indicada';
}

function formatProcessPositionSummary(position: NonNullable<SelectionBoardItemResponse['puesto']>): string {
  const parts = [position.modalidad, position.area, position.ubicacion]
    .filter((value) => value && value.trim() !== '')
    .join(' · ');

  return parts || 'Sin información adicional';
}

type CandidateFilter = 'all' | 'pending' | 'accepted' | 'rejected' | 'visibilityRequested' | 'identityVisible';

export function ProfessionalDashboardPage() {
  const { token } = useAuth();
  const [processRequests, setProcessRequests] = useState<SelectionBoardItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<CandidateFilter>('all');
  const [visibleDetailsModalItem, setVisibleDetailsModalItem] = useState<SelectionBoardItemResponse | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No hay sesion activa para cargar tus procesos.');
      setIsLoading(false);
      return;
    }

    const authToken = token;
    let isMounted = true;

    async function loadProcessRequests() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getMyCandidatures(authToken);
        if (!isMounted) {
          return;
        }

        setProcessRequests(response);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(err instanceof Error ? err.message : 'No se pudieron cargar tus procesos.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProcessRequests();

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
      setProcessRequests(refreshed);
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
      setProcessRequests(refreshed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la solicitud.');
    } finally {
      setBusyId(null);
    }
  }

  const filteredProcessRequests = useMemo(
    () =>
      processRequests.filter((item) => {
        if (filter === 'pending') return item.estado === 'PENDIENTE';
        if (filter === 'accepted') return item.estado === 'ACEPTADO';
        if (filter === 'rejected') return item.estado === 'RECHAZADO';
        if (filter === 'visibilityRequested') return item.solicitudVisibilidad === 'SOLICITADO';
        if (filter === 'identityVisible') return item.solicitudVisibilidad === 'ACEPTADO';
        return true;
      }),
    [processRequests, filter],
  );

  return (
    <section>
      <PageHeader
        title="Mis procesos"
        description="Consulta todas tus invitaciones y filtra por estado o visibilidad."
        actions={
          <Link to={PATHS.professionalProfile} className="button">
            Editar perfil
          </Link>
        }
      />

      <div className="grid-cards">
        <article className="card">
          <h3>Todos los procesos</h3>
          <p>Se muestran todas tus invitaciones, independientemente del estado interno.</p>
        </article>
        <article className="card">
          <h3>Filtros rápidos</h3>
          <p>Puedes filtrar por fase, visibilidad solicitada o identidad ya visible.</p>
        </article>
        <article className="card">
          <h3>Acciones</h3>
          <p>Responde a solicitudes de identidad o revisa el estado de cada invitación.</p>
        </article>
      </div>

      <article className="card" style={{ marginTop: '1rem' }}>
        <div className="selection-column-header">
          <div>
            <h3>Histórico de procesos</h3>
            <p>Primero aparecen todos los procesos; después puedes filtrar por fase o visibilidad.</p>
          </div>
          <span className="badge">{processRequests.length}</span>
        </div>

        {error ? <div className="alert alert-error">{error}</div> : null}
        {isLoading ? <div className="selection-empty" style={{ marginTop: '1rem' }}>Cargando procesos...</div> : null}

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

        {!isLoading && filteredProcessRequests.length === 0 ? (
          <div className="selection-empty" style={{ marginTop: '1rem' }}>
            No hay procesos para el filtro seleccionado.
          </div>
        ) : null}

        {!isLoading && filteredProcessRequests.length > 0 ? (
          <div className="selection-list" style={{ marginTop: '1rem' }}>
            {filteredProcessRequests.map((request) => (
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
                  <button
                    type="button"
                    className="button button-secondary button-small"
                    onClick={() => setVisibleDetailsModalItem(request)}
                  >
                    Ver detalles
                  </button>

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

      {visibleDetailsModalItem ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Detalles del proceso"
          className="confirm-overlay"
          onClick={() => setVisibleDetailsModalItem(null)}
        >
          <article
            className="card confirm-card"
            style={{ width: 'min(100%, 860px)', maxHeight: '84vh', overflowY: 'auto' }}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>{visibleDetailsModalItem.procesoTitulo || 'Proceso sin título'}</h3>
            <p className="selection-item-muted">
              {mapProcessState(visibleDetailsModalItem.procesoEstado)} ·{' '}
              {mapConfidentiality(visibleDetailsModalItem.procesoNivelConfidencialidad)}
            </p>

            <dl className="description-list">
              <div>
                <dt>Descripción del proceso</dt>
                <dd>{visibleDetailsModalItem.procesoDescripcion || 'No indicada'}</dd>
              </div>
              <div>
                <dt>Experiencia mínima</dt>
                <dd>{visibleDetailsModalItem.procesoNivelExperienciaMinimo || 'No indicada'}</dd>
              </div>
              <div>
                <dt>Estado de la solicitud</dt>
                <dd>{mapCandidateState(visibleDetailsModalItem.estado)}</dd>
              </div>
              <div>
                <dt>Visibilidad</dt>
                <dd>{mapVisibilityState(visibleDetailsModalItem.solicitudVisibilidad)}</dd>
              </div>
            </dl>

            <h4 style={{ marginTop: '1.5rem' }}>Puesto de la invitación</h4>
            {visibleDetailsModalItem.puesto ? (
              <div className="selection-list">
                <div key={visibleDetailsModalItem.puesto.id} className="selection-item">
                  <div className="selection-item-header">
                    <strong>{visibleDetailsModalItem.puesto.titulo}</strong>
                  </div>
                  <p className="selection-item-muted">{formatProcessPositionSummary(visibleDetailsModalItem.puesto)}</p>
                  <dl className="description-list">
                    <div>
                      <dt>Modalidad</dt>
                      <dd>{visibleDetailsModalItem.puesto.modalidad || 'No indicada'}</dd>
                    </div>
                    <div>
                      <dt>Ubicación</dt>
                      <dd>{visibleDetailsModalItem.puesto.ubicacion || 'No indicada'}</dd>
                    </div>
                    <div>
                      <dt>Área</dt>
                      <dd>{visibleDetailsModalItem.puesto.area || 'No indicada'}</dd>
                    </div>
                    <div>
                      <dt>Descripción</dt>
                      <dd>{visibleDetailsModalItem.puesto.descripcion || 'No indicada'}</dd>
                    </div>
                    <div>
                      <dt>Tecnologías requeridas</dt>
                      <dd>{visibleDetailsModalItem.puesto.tecnologiasRequeridas || 'No indicadas'}</dd>
                    </div>
                    <div>
                      <dt>Tipo de contrato</dt>
                      <dd>{visibleDetailsModalItem.puesto.tipoContrato || 'No indicado'}</dd>
                    </div>
                    <div>
                      <dt>Sector requerido</dt>
                      <dd>{visibleDetailsModalItem.puesto.sectorRequerido || 'No indicado'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            ) : (
              <div className="selection-empty" style={{ marginTop: '1rem' }}>
                No hay puesto asociado a esta invitación.
              </div>
            )}

            <div className="page-actions" style={{ marginTop: '1rem' }}>
              <button type="button" className="button" onClick={() => setVisibleDetailsModalItem(null)}>
                Cerrar
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
