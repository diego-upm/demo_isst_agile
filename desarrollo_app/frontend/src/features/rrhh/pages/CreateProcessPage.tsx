import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/common/PageHeader';
import { useAuth } from '../../auth/hooks/useAuth';
import { PATHS } from '../../../routes/paths';
import { createProceso, getMyRrhhContext, type NivelConfidencialidad } from '../services/processService';

type Senioridad = 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD';

interface ProcessFormData {
  titulo: string;
  descripcion: string;
  nivelConfidencialidad: NivelConfidencialidad;
  tecnologiasRequeridas: string;
  nivelExperienciaMinimo: string;
  tipoContrato: string;
  rangoSalarialMinimo: string;
  rangoSalarialMaximo: string;
  puestoTitulo: string;
  puestoSenioridad: Senioridad;
  puestoModalidad: string;
  puestoUbicacion: string;
  puestoArea: string;
  puestoDescripcion: string;
}

const DEFAULT_FORM: ProcessFormData = {
  titulo: '',
  descripcion: '',
  nivelConfidencialidad: 'INTERNAL',
  tecnologiasRequeridas: '',
  nivelExperienciaMinimo: '',
  tipoContrato: '',
  rangoSalarialMinimo: '',
  rangoSalarialMaximo: '',
  puestoTitulo: '',
  puestoSenioridad: 'SENIOR',
  puestoModalidad: '',
  puestoUbicacion: '',
  puestoArea: '',
  puestoDescripcion: '',
};

function toOptionalNumber(rawValue: string): number | undefined {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function CreateProcessPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [form, setForm] = useState<ProcessFormData>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      const salaryMin = toOptionalNumber(form.rangoSalarialMinimo);
      const salaryMax = toOptionalNumber(form.rangoSalarialMaximo);

      if (
        salaryMin !== undefined &&
        salaryMax !== undefined &&
        Number.isFinite(salaryMin) &&
        Number.isFinite(salaryMax) &&
        salaryMin > salaryMax
      ) {
        setError('El salario minimo no puede ser mayor que el maximo.');
        setIsSubmitting(false);
        return;
      }

      await createProceso(token, {
        empresaClienteId: rrhhContext.empresaClienteId,
        responsableRrhhId: rrhhContext.id,
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        nivelConfidencialidad: form.nivelConfidencialidad,
        tecnologiasRequeridas: form.tecnologiasRequeridas.trim() || undefined,
        nivelExperienciaMinimo: form.nivelExperienciaMinimo.trim() || undefined,
        tipoContrato: form.tipoContrato.trim() || undefined,
        rangoSalarialMinimo: salaryMin,
        rangoSalarialMaximo: salaryMax,
        puestos: [
          {
            titulo: form.puestoTitulo.trim(),
            senioridad: form.puestoSenioridad,
            modalidad: form.puestoModalidad.trim() || undefined,
            ubicacion: form.puestoUbicacion.trim() || undefined,
            area: form.puestoArea.trim() || undefined,
            descripcion: form.puestoDescripcion.trim() || undefined,
          },
        ],
      });

      setSuccess('Proceso creado correctamente.');
      setForm(DEFAULT_FORM);
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
        description="Completa los datos del proceso y del primer puesto a cubrir."
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
          <span>Tecnologias requeridas</span>
          <input
            type="text"
            value={form.tecnologiasRequeridas}
            onChange={(event) => setForm((current) => ({ ...current, tecnologiasRequeridas: event.target.value }))}
          />
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

        <label>
          <span>Tipo de contrato</span>
          <input
            type="text"
            value={form.tipoContrato}
            onChange={(event) => setForm((current) => ({ ...current, tipoContrato: event.target.value }))}
          />
        </label>

        <div className="grid-cards">
          <label>
            <span>Salario minimo</span>
            <input
              type="number"
              value={form.rangoSalarialMinimo}
              onChange={(event) => setForm((current) => ({ ...current, rangoSalarialMinimo: event.target.value }))}
            />
          </label>

          <label>
            <span>Salario maximo</span>
            <input
              type="number"
              value={form.rangoSalarialMaximo}
              onChange={(event) => setForm((current) => ({ ...current, rangoSalarialMaximo: event.target.value }))}
            />
          </label>
        </div>

        <h3>Datos del puesto a cubrir</h3>

        <label>
          <span>Nombre del puesto vacante</span>
          <input
            type="text"
            value={form.puestoTitulo}
            required
            onChange={(event) => setForm((current) => ({ ...current, puestoTitulo: event.target.value }))}
          />
        </label>

        <label>
          <span>Senioridad</span>
          <select
            value={form.puestoSenioridad}
            onChange={(event) => setForm((current) => ({ ...current, puestoSenioridad: event.target.value as Senioridad }))}
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
            value={form.puestoModalidad}
            onChange={(event) => setForm((current) => ({ ...current, puestoModalidad: event.target.value }))}
          />
        </label>

        <label>
          <span>Ubicacion</span>
          <input
            type="text"
            value={form.puestoUbicacion}
            onChange={(event) => setForm((current) => ({ ...current, puestoUbicacion: event.target.value }))}
          />
        </label>

        <label>
          <span>Area</span>
          <input
            type="text"
            value={form.puestoArea}
            onChange={(event) => setForm((current) => ({ ...current, puestoArea: event.target.value }))}
          />
        </label>

        <label>
          <span>Descripcion del puesto</span>
          <textarea
            value={form.puestoDescripcion}
            onChange={(event) => setForm((current) => ({ ...current, puestoDescripcion: event.target.value }))}
          ></textarea>
        </label>

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
