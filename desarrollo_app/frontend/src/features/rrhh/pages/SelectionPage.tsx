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
import { BUSINESS_AREA_OPTIONS, getBusinessAreaLabel } from '../../professional/types/businessAreas';

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
  const [pendingAddCandidate, setPendingAddCandidate] = useState<SelectionBoardItemResponse | null>(null);
  const [selectedPuestoId, setSelectedPuestoId] = useState('');
  const [showAvailableFilters, setShowAvailableFilters] = useState(false);
  const [minimumExperienceFilter, setMinimumExperienceFilter] = useState('');
  const [businessAreaFilter, setBusinessAreaFilter] = useState('');

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

  const filteredAvailableProfessionals = useMemo(() => {
    if (!board?.profesionalesDisponibles.length) {
      return [];
    }

    const normalizedMinimumExperience = minimumExperienceFilter.trim() === '' ? null : Number(minimumExperienceFilter);
    const hasExperienceFilter = normalizedMinimumExperience !== null && !Number.isNaN(normalizedMinimumExperience);
    const hasBusinessAreaFilter = businessAreaFilter.trim() !== '';

    return board.profesionalesDisponibles.filter((item) => {
      if (hasExperienceFilter && (item.aniosExperiencia ?? 0) < normalizedMinimumExperience) {
        return false;
      }

      if (hasBusinessAreaFilter && item.areaNegocio !== businessAreaFilter) {
        return false;
      }

      return true;
    });
  }, [board?.profesionalesDisponibles, businessAreaFilter, minimumExperienceFilter]);

  const availableCountLabel = useMemo(() => {
    const total = visibleCounts.disponibles;
    const filtered = filteredAvailableProfessionals.length;

    if (total === filtered) {
      return `${filtered}`;
    }

    return `${filtered} / ${total}`;
  }, [filteredAvailableProfessionals.length, visibleCounts.disponibles]);

  function clearAvailableFilters(): void {
    setMinimumExperienceFilter('');
    setBusinessAreaFilter('');
  }

  function handleOpenAddCandidate(item: SelectionBoardItemResponse) {
    const defaultPuestoId = board?.puestos[0]?.id ?? '';
    setPendingAddCandidate(item);
    setSelectedPuestoId(defaultPuestoId);
  }

  function handleCloseAddCandidate() {
    setPendingAddCandidate(null);
    setSelectedPuestoId('');
  }

  async function handleAddCandidate() {
    if (!token || !processId) {
      return;
    }

    if (!pendingAddCandidate) {
      return;
    }

    if (!selectedPuestoId) {
      setError('Debes seleccionar un puesto del proceso para enviar la invitación.');
      return;
    }

    setBusyCandidateId(pendingAddCandidate.profesionalId);
    setError(null);
    setActionMessage(null);

    try {
      await addCandidateToProcess(token, processId, pendingAddCandidate.profesionalId, selectedPuestoId);
      const refreshed = await getSelectionBoard(token, processId, searchTerm);
      setBoard(refreshed);
      setActionMessage('Profesional añadido al proceso correctamente.');
      handleCloseAddCandidate();
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
                  <p>Todos los candidatos aparecen por defecto. El filtro solo afecta a esta columna.</p>
                </div>
                <span className="badge">{availableCountLabel}</span>
              </div>

              <div className="selection-filter-shell">
                <button
                  type="button"
                  className="button button-secondary button-small selection-filter-toggle"
                  onClick={() => setShowAvailableFilters((current) => !current)}
                >
                  {showAvailableFilters ? 'Ocultar filtros' : 'Filtrar'}
                </button>

                {showAvailableFilters ? (
                  <div className="selection-filter-panel">
                    <div className="selection-filter-grid">
                      <label>
                        <span>Años mínimos de experiencia</span>
                        <input
                          type="number"
                          min={0}
                          max={60}
                          placeholder="Ej. 5"
                          value={minimumExperienceFilter}
                          onChange={(event) => setMinimumExperienceFilter(event.target.value)}
                        />
                      </label>

                      <label>
                        <span>Área de negocio</span>
                        <select value={businessAreaFilter} onChange={(event) => setBusinessAreaFilter(event.target.value)}>
                          <option value="">Todas</option>
                          {BUSINESS_AREA_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="selection-filter-actions">
                      <button type="button" className="button button-secondary button-small" onClick={clearAvailableFilters}>
                        Limpiar
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="selection-list">
                {filteredAvailableProfessionals.length ? (
                  filteredAvailableProfessionals.map((item) => {
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
                          onClick={() => handleOpenAddCandidate(item)}
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
                        <p className="selection-item-muted">
                          Puesto invitado: {item.puesto?.titulo || 'No indicado'}
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
                        <p className="selection-item-muted">
                          Puesto invitado: {item.puesto?.titulo || 'No indicado'}
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

          {pendingAddCandidate ? (
            <div className="confirm-overlay" role="dialog" aria-modal="true" onClick={handleCloseAddCandidate}>
              <article className="card confirm-card" onClick={(event) => event.stopPropagation()}>
                <h3>Seleccionar puesto para invitación</h3>
                <p>
                  Profesional: <strong>{pendingAddCandidate.displayName}</strong>
                </p>

                <label>
                  <span>Puesto del proceso</span>
                  <select value={selectedPuestoId} onChange={(event) => setSelectedPuestoId(event.target.value)}>
                    <option value="">Selecciona un puesto</option>
                    {(board?.puestos ?? []).map((puesto) => (
                      <option key={puesto.id} value={puesto.id}>
                        {puesto.titulo} ({puesto.senioridad})
                      </option>
                    ))}
                  </select>
                </label>

                <div className="page-actions">
                  <button type="button" className="button button-secondary" onClick={handleCloseAddCandidate}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="button"
                    onClick={() => void handleAddCandidate()}
                    disabled={busyCandidateId === pendingAddCandidate.profesionalId}
                  >
                    {busyCandidateId === pendingAddCandidate.profesionalId ? 'Enviando...' : 'Enviar invitación'}
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
