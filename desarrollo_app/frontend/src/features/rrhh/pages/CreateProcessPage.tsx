import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/common/PageHeader';
import { useAuth } from '../../auth/hooks/useAuth';
import { PATHS } from '../../../routes/paths';
import { createProceso, getMyRrhhContext, type NivelConfidencialidad } from '../services/processService';
import { BUSINESS_AREA_OPTIONS, type BusinessAreaValue, getBusinessAreaLabel } from '../../professional/types/businessAreas';

type Senioridad = 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD';

interface ProcessFormData {
  titulo: string;
  descripcion: string;
  nivelConfidencialidad: NivelConfidencialidad;
  nivelExperienciaMinimo: string;
}

interface PositionDraft {
  puestoTitulo: string;
  puestoSenioridad: Senioridad;
  puestoModalidad: string;
  puestoUbicacion: string;
  puestoArea: string;
  puestoDescripcion: string;
  puestoTecnologiasRequeridas: string;
  puestoTipoContrato: string;
  puestoSectorRequerido: '' | BusinessAreaValue;
}

const DEFAULT_FORM: ProcessFormData = {
  titulo: '',
  descripcion: '',
  nivelConfidencialidad: 'INTERNAL',
  nivelExperienciaMinimo: '',
};

const DEFAULT_POSITION: PositionDraft = {
  puestoTitulo: '',
  puestoSenioridad: 'SENIOR',
  puestoModalidad: '',
  puestoUbicacion: '',
  puestoArea: '',
  puestoDescripcion: '',
  puestoTecnologiasRequeridas: '',
  puestoTipoContrato: '',
  puestoSectorRequerido: '',
};

export function CreateProcessPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [form, setForm] = useState<ProcessFormData>(DEFAULT_FORM);
  const [positionForm, setPositionForm] = useState<PositionDraft>(DEFAULT_POSITION);
  const [positions, setPositions] = useState<PositionDraft[]>([]);
  const [isAddPositionOpen, setIsAddPositionOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleAddPosition() {
    if (!positionForm.puestoTitulo.trim()) {
      setError('El nombre del puesto es obligatorio para añadirlo al proceso.');
      return;
    }

    setPositions((current) => [...current, positionForm]);
    setPositionForm(DEFAULT_POSITION);
    setIsAddPositionOpen(false);
    setError(null);
  }

  function handleRemovePosition(index: number) {
    setPositions((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!token) {
      setError('No hay sesion activa para crear procesos.');
      return;
    }

    setIsSubmitting(true);

    try {
      const rrhhContext = await getMyRrhhContext(token);

      if (!positions.length) {
        setError('Debes añadir al menos un puesto antes de crear el proceso.');
        setIsSubmitting(false);
        return;
      }

      await createProceso(token, {
        empresaClienteId: rrhhContext.empresaClienteId,
        responsableRrhhId: rrhhContext.id,
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        nivelConfidencialidad: form.nivelConfidencialidad,
        nivelExperienciaMinimo: form.nivelExperienciaMinimo.trim() || undefined,
        puestos: positions.map((position) => ({
          titulo: position.puestoTitulo.trim(),
          senioridad: position.puestoSenioridad,
          modalidad: position.puestoModalidad.trim() || undefined,
          ubicacion: position.puestoUbicacion.trim() || undefined,
          area: position.puestoArea.trim() || undefined,
          descripcion: position.puestoDescripcion.trim() || undefined,
          tecnologiasRequeridas: position.puestoTecnologiasRequeridas.trim() || undefined,
          tipoContrato: position.puestoTipoContrato.trim() || undefined,
          sectorRequerido: position.puestoSectorRequerido || undefined,
        })),
      });

      setSuccess('Proceso creado correctamente.');
      setForm(DEFAULT_FORM);
      setPositionForm(DEFAULT_POSITION);
      setPositions([]);
      setIsAddPositionOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el proceso.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <PageHeader
        title="Nuevo proceso de headhunting"
        description="Define los datos generales del proceso y añade uno o varios puestos."
      />

      <form className="card form-stack" onSubmit={handleSubmit}>
        <h3>Datos del proceso</h3>

        <label>
          <span>Titulo del proceso (interno)</span>
          <input
            type="text"
            value={form.titulo}
            required
            onChange={(event) => setForm((current) => ({ ...current, titulo: event.target.value }))}
          />
        </label>

        <label>
          <span>Descripcion general del proceso</span>
          <textarea
            value={form.descripcion}
            required
            onChange={(event) => setForm((current) => ({ ...current, descripcion: event.target.value }))}
          ></textarea>
        </label>

        <label>
          <span>Nivel de confidencialidad</span>
          <select
            value={form.nivelConfidencialidad}
            onChange={(event) =>
              setForm((current) => ({ ...current, nivelConfidencialidad: event.target.value as NivelConfidencialidad }))
            }
          >
            <option value="INTERNAL">Interno</option>
            <option value="CONFIDENTIAL">Confidencial</option>
          </select>
        </label>

        <label>
          <span>Nivel minimo de experiencia</span>
          <input
            type="text"
            value={form.nivelExperienciaMinimo}
            onChange={(event) =>
              setForm((current) => ({ ...current, nivelExperienciaMinimo: event.target.value }))
            }
          />
        </label>

        <h3>Puestos a cubrir</h3>
        <p>Añade los puestos que quieras incluir en este proceso. Podrás invitar profesionales a cada puesto por separado.</p>

        <div className="page-actions">
          <button type="button" className="button button-secondary" onClick={() => setIsAddPositionOpen((value) => !value)}>
            {isAddPositionOpen ? 'Ocultar formulario de puesto' : 'Añadir puesto'}
          </button>
        </div>

        {isAddPositionOpen ? (
          <article className="card form-stack" style={{ marginTop: '0.75rem' }}>
            <h4>Nuevo puesto</h4>

            <label>
              <span>Nombre del puesto vacante</span>
              <input
                type="text"
                value={positionForm.puestoTitulo}
                onChange={(event) => setPositionForm((current) => ({ ...current, puestoTitulo: event.target.value }))}
              />
            </label>

            <label>
              <span>Senioridad</span>
              <select
                value={positionForm.puestoSenioridad}
                onChange={(event) => setPositionForm((current) => ({ ...current, puestoSenioridad: event.target.value as Senioridad }))}
              >
                <option value="JUNIOR">Junior</option>
                <option value="MID">Mid</option>
                <option value="SENIOR">Senior</option>
                <option value="LEAD">Lead</option>
              </select>
            </label>

            <label>
              <span>Modalidad</span>
              <input
                type="text"
                value={positionForm.puestoModalidad}
                onChange={(event) => setPositionForm((current) => ({ ...current, puestoModalidad: event.target.value }))}
              />
            </label>

            <label>
              <span>Ubicación</span>
              <input
                type="text"
                value={positionForm.puestoUbicacion}
                onChange={(event) => setPositionForm((current) => ({ ...current, puestoUbicacion: event.target.value }))}
              />
            </label>

            <label>
              <span>Área</span>
              <input
                type="text"
                value={positionForm.puestoArea}
                onChange={(event) => setPositionForm((current) => ({ ...current, puestoArea: event.target.value }))}
              />
            </label>

            <label>
              <span>Descripción del puesto</span>
              <textarea
                value={positionForm.puestoDescripcion}
                onChange={(event) => setPositionForm((current) => ({ ...current, puestoDescripcion: event.target.value }))}
              ></textarea>
            </label>

            <label>
              <span>Tecnologías requeridas</span>
              <input
                type="text"
                value={positionForm.puestoTecnologiasRequeridas}
                onChange={(event) =>
                  setPositionForm((current) => ({ ...current, puestoTecnologiasRequeridas: event.target.value }))
                }
              />
            </label>

            <label>
              <span>Tipo de contrato</span>
              <input
                type="text"
                value={positionForm.puestoTipoContrato}
                onChange={(event) => setPositionForm((current) => ({ ...current, puestoTipoContrato: event.target.value }))}
              />
            </label>

            <label>
              <span>Categoría de sector requerido</span>
              <select
                value={positionForm.puestoSectorRequerido}
                onChange={(event) =>
                  setPositionForm((current) => ({
                    ...current,
                    puestoSectorRequerido: event.target.value as '' | BusinessAreaValue,
                  }))
                }
              >
                <option value="">No especificado</option>
                {BUSINESS_AREA_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="page-actions">
              <button type="button" className="button" onClick={handleAddPosition}>
                Guardar puesto
              </button>
            </div>
          </article>
        ) : null}

        {positions.length ? (
          <div className="list-stack">
            {positions.map((position, index) => (
              <article key={`${position.puestoTitulo}-${index}`} className="card">
                <div className="card-row">
                  <div>
                    <h4>{position.puestoTitulo}</h4>
                    <p>
                      {position.puestoSenioridad} · {position.puestoModalidad || 'Modalidad no indicada'} ·{' '}
                      {position.puestoUbicacion || 'Ubicación no indicada'}
                    </p>
                    <p className="selection-item-muted">
                      Sector: {position.puestoSectorRequerido ? getBusinessAreaLabel(position.puestoSectorRequerido) : 'No especificado'}
                    </p>
                  </div>
                  <button type="button" className="button button-secondary button-danger" onClick={() => handleRemovePosition(index)}>
                    Eliminar puesto
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="selection-empty">Todavía no has añadido ningún puesto.</div>
        )}

        {error ? <div className="alert alert-error">{error}</div> : null}
        {success ? <div className="alert alert-success">{success}</div> : null}

        <button type="submit" className="button" disabled={isSubmitting}>
          {isSubmitting ? 'Creando proceso...' : 'Crear proceso'}
        </button>
      </form>

      <div className="return-actions">
        <button type="button" className="button button-secondary" onClick={() => navigate(PATHS.rrhhProcesses)}>
          Volver
        </button>
      </div>
    </section>
  );
}
