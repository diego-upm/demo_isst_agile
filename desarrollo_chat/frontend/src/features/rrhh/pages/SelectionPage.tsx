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
                  board.profesionalesDisponibles.map((item) => (
                    <div key={item.profesionalId} className="selection-item">
                      <div>
                        <div className="selection-item-header">
                          <strong>{item.displayName}</strong>
                          <span className={item.anonimo ? 'status-chip status-chip-neutral' : 'status-chip status-chip-info'}>
                            {item.anonimo ? 'Anónimo' : 'Visible'}
                          </span>
                        </div>
                        <p>{item.tecnologiasClave || 'Tecnologías no indicadas'}</p>
                        <p className="selection-item-muted">
                          {formatExperience(item.aniosExperiencia)} · {item.disponibilidad || 'Disponibilidad no indicada'}
                        </p>
                      </div>

                      <div className="selection-item-actions">
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
                  ))
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
                  board.candidatos.map((item) => (
                    <div key={item.candidaturaId ?? item.profesionalId} className="selection-item">
                      <div>
                        <div className="selection-item-header">
                          <strong>{item.displayName}</strong>
                          <span className="status-chip status-chip-state">{mapCandidateState(item.estado)}</span>
                        </div>
                        <p>{item.tecnologiasClave || 'Tecnologías no indicadas'}</p>
                        <p className="selection-item-muted">
                          {mapVisibilityState(item.solicitudVisibilidad)} ·{' '}
                          {formatExperience(item.aniosExperiencia)}
                        </p>
                      </div>

                      <div className="selection-item-actions">
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
                  ))
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
                  board.solicitudesVisibilidad.map((item) => (
                    <div key={item.candidaturaId ?? item.profesionalId} className="selection-item">
                      <div>
                        <div className="selection-item-header">
                          <strong>{item.displayName}</strong>
                          <span className="status-chip status-chip-visibility">
                            {mapVisibilityState(item.solicitudVisibilidad)}
                          </span>
                        </div>
                        <p>{item.tecnologiasClave || 'Tecnologías no indicadas'}</p>
                        <p className="selection-item-muted">
                          Estado candidatura: {mapCandidateState(item.estado)}
                        </p>
                      </div>

                      {item.anonimo ? <span className="status-chip status-chip-neutral">Anónimo</span> : null}
                    </div>
                  ))
                ) : (
                  <div className="selection-empty">No hay solicitudes de visibilidad todavía.</div>
                )}
              </div>
            </article>
          </div>
        </>
      ) : null}
    </section>
  );
}
