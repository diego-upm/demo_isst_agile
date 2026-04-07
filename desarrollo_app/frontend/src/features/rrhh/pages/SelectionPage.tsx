import { FormEvent, useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  addCandidateToProcess,
  deleteCandidateFromProcess,
  getSelectionBoard,
  requestCandidateVisibility,
  type SelectionBoardItemResponse,
  type SelectionBoardResponse,
} from '../services/selectionService';
import { getBusinessAreaLabel } from '../../professional/types/businessAreas';

function mapCandidateState(state?: string | null): string {
  if (state === 'ACEPTADO') return 'Aceptado';
  if (state === 'RECHAZADO') return 'Rechazado';
  if (state === 'PENDIENTE') return 'Pendiente';
  return 'Sin estado';
}

function mapVisibilityState(state?: string | null): string {
  if (state === 'ACEPTADO') return 'Aceptada';
  if (state === 'RECHAZADO') return 'Rechazada';
  if (state === 'SOLICITADO') return 'Solicitada';
  if (state === 'NO_SOLICITADO') return 'No solicitada';
  return 'Sin solicitud';
}

function formatExperience(years?: number | null): string {
  if (years == null) {
    return 'Experiencia no indicada';
  }

  return `${years} años de experiencia`;
}

function formatSalaryRange(min?: number | null, max?: number | null): string {
  if (min == null && max == null) {
    return 'No indicado';
  }

  return `${min ?? '-'} - ${max ?? '-'} €`;
}

export function SelectionPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const processId = searchParams.get('processId');
  const [board, setBoard] = useState<SelectionBoardResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [busyCandidateId, setBusyCandidateId] = useState<string | null>(null);
  const [busyRemovalId, setBusyRemovalId] = useState<string | null>(null);
  const [expandedDetailCards, setExpandedDetailCards] = useState<Record<string, boolean>>({});
  const [visibleDetailsModalItem, setVisibleDetailsModalItem] = useState<SelectionBoardItemResponse | null>(null);

  useEffect(() => {
    if (!processId || !token) {
      setBoard(null);
      return;
    }

    let isMounted = true;
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        setIsLoading(true);
        setError(null);

        try {
          const response = await getSelectionBoard(token, processId, searchTerm);
          if (!isMounted) {
            return;
          }

          setBoard(response);
        } catch (err) {
          if (!isMounted) {
            return;
          }

          setError(err instanceof Error ? err.message : 'No se pudo cargar la selección.');
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      })();
    }, 250);

    return () => {
      isMounted = false;
      window.clearTimeout(timeoutId);
    };
  }, [processId, searchTerm, token]);

  const visibleCounts = useMemo(
    () => ({
      disponibles: board?.profesionalesDisponibles.length ?? 0,
      candidatos: board?.candidatos.length ?? 0,
      solicitudes: board?.solicitudesVisibilidad.length ?? 0,
    }),
    [board],
  );

  async function handleAddCandidate(item: SelectionBoardItemResponse) {
    if (!token || !processId) {
      return;
    }

    setBusyCandidateId(item.profesionalId);
    setError(null);
    setActionMessage(null);

    try {
      await addCandidateToProcess(token, processId, item.profesionalId);
      const refreshed = await getSelectionBoard(token, processId, searchTerm);
      setBoard(refreshed);
      setActionMessage('Profesional añadido al proceso correctamente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo añadir el profesional.');
    } finally {
      setBusyCandidateId(null);
    }
  }

  async function handleRequestVisibility(item: SelectionBoardItemResponse) {
    if (!token || !processId || !item.candidaturaId) {
      return;
    }

    setBusyCandidateId(item.candidaturaId);
    setError(null);
    setActionMessage(null);

    try {
      await requestCandidateVisibility(token, processId, item.candidaturaId);
      const refreshed = await getSelectionBoard(token, processId, searchTerm);
      setBoard(refreshed);
      setActionMessage('Solicitud de visibilidad enviada correctamente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo solicitar la visibilidad.');
    } finally {
      setBusyCandidateId(null);
    }
  }

  async function handleRemoveCandidate(item: SelectionBoardItemResponse) {
    if (!token || !processId || !item.candidaturaId) {
      return;
    }

    setBusyRemovalId(item.candidaturaId);
    setError(null);
    setActionMessage(null);

    try {
      await deleteCandidateFromProcess(token, processId, item.candidaturaId);
      const refreshed = await getSelectionBoard(token, processId, searchTerm);
      setBoard(refreshed);
      setActionMessage('Profesional eliminado del proceso correctamente.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el profesional del proceso.');
    } finally {
      setBusyRemovalId(null);
    }
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!processId || !token) {
      return;
    }

    void (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getSelectionBoard(token, processId, searchTerm);
        setBoard(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo actualizar la búsqueda.');
      } finally {
        setIsLoading(false);
      }
    })();
  }

  function toggleDetails(cardKey: string): void {
    setExpandedDetailCards((current) => ({
      ...current,
      [cardKey]: !current[cardKey],
    }));
  }

  function isIdentityVisible(item: SelectionBoardItemResponse): boolean {
    return item.solicitudVisibilidad === 'ACEPTADO' || !item.anonimo;
  }

  function renderCollapsedSummary(item: SelectionBoardItemResponse): string {
    const sectorLabel = item.sector ? getBusinessAreaLabel(item.sector) : 'Sector no indicado';
    return `Sector: ${sectorLabel}`;
  }

  function renderDetails(item: SelectionBoardItemResponse) {
    return (
      <dl className="description-list" style={{ marginTop: '0.75rem' }}>
        <div>
          <dt>Área de negocio</dt>
          <dd>{item.areaNegocio ? getBusinessAreaLabel(item.areaNegocio) : 'No indicada'}</dd>
        </div>
        <div>
          <dt>Activo</dt>
          <dd>{item.activo ? 'Sí' : 'No'}</dd>
        </div>
        <div>
          <dt>Tecnologías clave</dt>
          <dd>{item.tecnologiasClave || 'No indicadas'}</dd>
        </div>
        <div>
          <dt>Soft skills</dt>
          <dd>{item.softSkills || 'No indicadas'}</dd>
        </div>
        <div>
          <dt>Áreas de experiencia</dt>
          <dd>{formatExperience(item.aniosExperiencia)}</dd>
        </div>
        <div>
          <dt>Idiomas</dt>
          <dd>{item.idiomas || 'No indicados'}</dd>
        </div>
        <div>
          <dt>Titulaciones académicas</dt>
          <dd>{item.titulacionesAcademicas || 'No indicadas'}</dd>
        </div>
      </dl>
    );
  }

  function renderVisibleModalDetails(item: SelectionBoardItemResponse) {
    return (
      <dl className="description-list" style={{ marginTop: '0.75rem' }}>
        <div>
          <dt>Nombre</dt>
          <dd>{item.nombre || 'No indicado'}</dd>
        </div>
        <div>
          <dt>Apellidos</dt>
          <dd>{item.apellidos || 'No indicado'}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{item.email || 'No indicado'}</dd>
        </div>
        <div>
          <dt>Descripción personal</dt>
          <dd>{item.descripcionPersonal || 'No indicada'}</dd>
        </div>
        <div>
          <dt>Rango salarial</dt>
          <dd>{formatSalaryRange(item.rangoSalarialEsperadoMin, item.rangoSalarialEsperadoMax)}</dd>
        </div>
        <div>
          <dt>Área de negocio</dt>
          <dd>{item.areaNegocio ? getBusinessAreaLabel(item.areaNegocio) : 'No indicada'}</dd>
        </div>
        <div>
          <dt>Sector</dt>
          <dd>{item.sector ? getBusinessAreaLabel(item.sector) : 'No indicado'}</dd>
        </div>
        <div>
          <dt>Activo</dt>
          <dd>{item.activo ? 'Sí' : 'No'}</dd>
        </div>
        <div>
          <dt>Tecnologías clave</dt>
          <dd>{item.tecnologiasClave || 'No indicadas'}</dd>
        </div>
        <div>
          <dt>Soft skills</dt>
          <dd>{item.softSkills || 'No indicadas'}</dd>
        </div>
        <div>
          <dt>Áreas de experiencia</dt>
          <dd>{formatExperience(item.aniosExperiencia)}</dd>
        </div>
        <div>
          <dt>Idiomas</dt>
          <dd>{item.idiomas || 'No indicados'}</dd>
        </div>
        <div>
          <dt>Titulaciones académicas</dt>
          <dd>{item.titulacionesAcademicas || 'No indicadas'}</dd>
        </div>
      </dl>
    );
  }

  function handleOpenDetails(item: SelectionBoardItemResponse, cardKey: string): void {
    if (isIdentityVisible(item)) {
      setVisibleDetailsModalItem(item);
      return;
    }

    toggleDetails(cardKey);
  }

  const processTitle = board?.procesoTitulo ?? 'Gestión de selección';

  return (
    <section>
      <PageHeader
        title={processTitle}
        description={processId ? `Proceso activo: ${processId}` : 'Selecciona un proceso para gestionar candidatos.'}
      />

      {error ? <div className="alert alert-error">{error}</div> : null}
      {actionMessage ? <div className="alert alert-success">{actionMessage}</div> : null}

      {!processId ? (
        <div className="card">
          <p>No hay ningún proceso abierto. Vuelve al listado de procesos para entrar en uno.</p>
        </div>
      ) : null}

      {processId ? (
        <>
          <form className="card selection-toolbar" onSubmit={handleSearchSubmit}>
            <label>
              <span>Buscar profesionales</span>
              <input
                type="search"
                placeholder="Nombre, apellidos, email o tecnologías"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>
            <div className="selection-toolbar-meta">
              <p>
                {visibleCounts.disponibles} disponibles · {visibleCounts.candidatos} candidatos ·{' '}
                {visibleCounts.solicitudes} solicitudes de visibilidad
              </p>
              <button type="submit" className="button button-secondary">
                Aplicar filtro
              </button>
            </div>
          </form>

          {isLoading ? <div className="card">Cargando selección...</div> : null}

          <div className="selection-board">
            <article className="card selection-column">
              <div className="selection-column-header">
                <div>
                  <h3>Buscador de profesionales</h3>
                  <p>Resultados filtrados entre todos los profesionales activos de la plataforma.</p>
                </div>
                <span className="badge">{visibleCounts.disponibles}</span>
              </div>

              <div className="selection-list">
                {board?.profesionalesDisponibles.length ? (
                  board.profesionalesDisponibles.map((item) => {
                    const cardKey = `disponible-${item.profesionalId}`;
                    const detailsOpen = Boolean(expandedDetailCards[cardKey]);

                    return (
                    <div key={item.profesionalId} className="selection-item">
                      <div>
                        <div className="selection-item-header">
                          <strong>{item.displayName}</strong>
                          <span className={item.anonimo ? 'status-chip status-chip-neutral' : 'status-chip status-chip-info'}>
                            {item.anonimo ? 'Anónimo' : 'Visible'}
                          </span>
                        </div>
                        <p>{renderCollapsedSummary(item)}</p>
                        {detailsOpen ? renderDetails(item) : null}
                      </div>

                      <div className="selection-item-actions">
                        <button
                          type="button"
                          className="button button-secondary button-small"
                          onClick={() => handleOpenDetails(item, cardKey)}
                        >
                          {isIdentityVisible(item)
                            ? 'Ver detalles'
                            : detailsOpen
                              ? 'Ocultar detalles'
                              : 'Ver detalles'}
                        </button>
                        <button
                          type="button"
                          className="button button-secondary button-small"
                          onClick={() => void handleAddCandidate(item)}
                          disabled={busyCandidateId === item.profesionalId}
                        >
                          {busyCandidateId === item.profesionalId ? 'Añadiendo...' : 'Añadir'}
                        </button>
                      </div>
                    </div>
                  );})
                ) : (
                  <div className="selection-empty">No hay profesionales que coincidan con el filtro actual.</div>
                )}
              </div>
            </article>

            <article className="card selection-column">
              <div className="selection-column-header">
                <div>
                  <h3>Candidatos solicitados</h3>
                  <p>Profesionales ya asociados al proceso con su estado de candidatura.</p>
                </div>
                <span className="badge">{visibleCounts.candidatos}</span>
              </div>

              <div className="selection-list">
                {board?.candidatos.length ? (
                  board.candidatos.map((item) => {
                    const cardKey = `candidato-${item.candidaturaId ?? item.profesionalId}`;
                    const detailsOpen = Boolean(expandedDetailCards[cardKey]);

                    return (
                    <div key={item.candidaturaId ?? item.profesionalId} className="selection-item">
                      <div>
                        <div className="selection-item-header">
                          <strong>{item.displayName}</strong>
                          <span className="status-chip status-chip-state">{mapCandidateState(item.estado)}</span>
                        </div>
                        <p>{renderCollapsedSummary(item)}</p>
                        <p className="selection-item-muted">
                          {mapVisibilityState(item.solicitudVisibilidad)} ·{' '}
                          {formatExperience(item.aniosExperiencia)}
                        </p>
                        {detailsOpen ? renderDetails(item) : null}
                      </div>

                      <div className="selection-item-actions">
                        <button
                          type="button"
                          className="button button-secondary button-small"
                          onClick={() => handleOpenDetails(item, cardKey)}
                        >
                          {isIdentityVisible(item)
                            ? 'Ver detalles'
                            : detailsOpen
                              ? 'Ocultar detalles'
                              : 'Ver detalles'}
                        </button>
                        {item.solicitudVisibilidad === 'NO_SOLICITADO' && item.candidaturaId ? (
                          <button
                            type="button"
                            className="button button-secondary button-small"
                            onClick={() => void handleRequestVisibility(item)}
                            disabled={busyCandidateId === item.candidaturaId || item.estado !== 'ACEPTADO'}
                            title={
                              item.estado !== 'ACEPTADO'
                                ? 'Solo puedes solicitar visibilidad cuando el candidato acepte la candidatura.'
                                : undefined
                            }
                          >
                            {busyCandidateId === item.candidaturaId ? 'Solicitando...' : 'Visibilidad'}
                          </button>
                        ) : null}

                        {item.candidaturaId ? (
                          <button
                            type="button"
                            className="button button-secondary button-small button-danger"
                            onClick={() => void handleRemoveCandidate(item)}
                            disabled={busyRemovalId === item.candidaturaId}
                          >
                            {busyRemovalId === item.candidaturaId ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );})
                ) : (
                  <div className="selection-empty">Todavía no hay candidatos añadidos al proceso.</div>
                )}
              </div>
            </article>

            <article className="card selection-column">
              <div className="selection-column-header">
                <div>
                  <h3>Solicitudes de visibilidad</h3>
                  <p>Solicitudes pendientes, rechazadas o aceptadas por el profesional.</p>
                </div>
                <span className="badge">{visibleCounts.solicitudes}</span>
              </div>

              <div className="selection-list">
                {board?.solicitudesVisibilidad.length ? (
                  board.solicitudesVisibilidad.map((item) => {
                    const cardKey = `solicitud-${item.candidaturaId ?? item.profesionalId}`;
                    const detailsOpen = Boolean(expandedDetailCards[cardKey]);

                    return (
                    <div key={item.candidaturaId ?? item.profesionalId} className="selection-item">
                      <div>
                        <div className="selection-item-header">
                          <strong>{item.displayName}</strong>
                          <span className="status-chip status-chip-visibility">
                            {mapVisibilityState(item.solicitudVisibilidad)}
                          </span>
                        </div>
                        <p>{renderCollapsedSummary(item)}</p>
                        <p className="selection-item-muted">
                          Estado candidatura: {mapCandidateState(item.estado)}
                        </p>
                        {detailsOpen ? renderDetails(item) : null}
                      </div>

                      <div className="selection-item-actions">
                        <button
                          type="button"
                          className="button button-secondary button-small"
                          onClick={() => handleOpenDetails(item, cardKey)}
                        >
                          {isIdentityVisible(item)
                            ? 'Ver detalles'
                            : detailsOpen
                              ? 'Ocultar detalles'
                              : 'Ver detalles'}
                        </button>
                        {item.anonimo ? <span className="status-chip status-chip-neutral">Anónimo</span> : null}
                      </div>
                    </div>
                  );})
                ) : (
                  <div className="selection-empty">No hay solicitudes de visibilidad todavía.</div>
                )}
              </div>
            </article>
          </div>

          {visibleDetailsModalItem ? (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Detalles del candidato"
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                zIndex: 1000,
              }}
              onClick={() => setVisibleDetailsModalItem(null)}
            >
              <article
                className="card"
                style={{
                  width: '100%',
                  maxWidth: '820px',
                  maxHeight: '80vh',
                  overflowY: 'auto',
                }}
                onClick={(event) => event.stopPropagation()}
              >
                <h3 style={{ marginTop: 0 }}>{visibleDetailsModalItem.displayName}</h3>
                <p className="selection-item-muted">{renderCollapsedSummary(visibleDetailsModalItem)}</p>
                {renderVisibleModalDetails(visibleDetailsModalItem)}
                <div className="page-actions" style={{ marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="button"
                    onClick={() => setVisibleDetailsModalItem(null)}
                  >
                    Cerrar
                  </button>
                </div>
              </article>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
