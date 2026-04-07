import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerProfessionalWithBackend } from '../services/authService';
import { PATHS } from '../../../routes/paths';
import {
  BUSINESS_AREA_OPTIONS,
  type BusinessAreaValue,
} from '../../professional/types/businessAreas';

type FieldKey =
  | 'nombre'
  | 'apellidos'
  | 'email'
  | 'password'
  | 'confirmPassword'
  | 'tecnologiasClave'
  | 'aniosExperiencia'
  | 'titulacionesAcademicas'
  | 'idiomas'
  | 'softSkills'
  | 'areaNegocio'
  | 'rangoSalarialEsperadoMin'
  | 'rangoSalarialEsperadoMax'
  | 'descripcionPersonal';

type ValidationErrors = Partial<Record<FieldKey, string>>;

export function RegisterProfessionalPage() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tecnologiasClave, setTecnologiasClave] = useState('');
  const [aniosExperiencia, setAniosExperiencia] = useState('');
  const [titulacionesAcademicas, setTitulacionesAcademicas] = useState('');
  const [idiomas, setIdiomas] = useState('');
  const [softSkills, setSoftSkills] = useState('');
  const [areaNegocio, setAreaNegocio] = useState<BusinessAreaValue | ''>('');
  const [rangoSalarialEsperadoMin, setRangoSalarialEsperadoMin] = useState('');
  const [rangoSalarialEsperadoMax, setRangoSalarialEsperadoMax] = useState('');
  const [descripcionPersonal, setDescripcionPersonal] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validationErrors: ValidationErrors = {};

  if (nombre.trim() === '') {
    validationErrors.nombre = 'El nombre es obligatorio.';
  }

  if (apellidos.trim() === '') {
    validationErrors.apellidos = 'Los apellidos son obligatorios.';
  }

  if (email.trim() === '') {
    validationErrors.email = 'El email es obligatorio.';
  }

  if (password.trim() === '') {
    validationErrors.password = 'La contrasena es obligatoria.';
  } else if (password.length < 8) {
    validationErrors.password = 'La contrasena debe tener al menos 8 caracteres.';
  }

  if (confirmPassword.trim() === '') {
    validationErrors.confirmPassword = 'Confirma la contrasena para continuar.';
  } else if (password !== confirmPassword) {
    validationErrors.confirmPassword = 'La confirmacion de contrasena no coincide.';
  }

  if (areaNegocio === '') {
    validationErrors.areaNegocio = 'El area de negocio es obligatoria.';
  }

  const parsedYears = aniosExperiencia.trim() === '' ? undefined : Number(aniosExperiencia);
  const parsedSalaryMin = rangoSalarialEsperadoMin.trim() === '' ? undefined : Number(rangoSalarialEsperadoMin);
  const parsedSalaryMax = rangoSalarialEsperadoMax.trim() === '' ? undefined : Number(rangoSalarialEsperadoMax);

  if (
    parsedYears !== undefined &&
    (Number.isNaN(parsedYears) || parsedYears < 0 || parsedYears > 60)
  ) {
    validationErrors.aniosExperiencia = 'Los anos de experiencia deben estar entre 0 y 60.';
  }

  if (parsedSalaryMin !== undefined && (Number.isNaN(parsedSalaryMin) || parsedSalaryMin < 0)) {
    validationErrors.rangoSalarialEsperadoMin = 'El salario minimo esperado no es valido.';
  }

  if (parsedSalaryMax !== undefined && (Number.isNaN(parsedSalaryMax) || parsedSalaryMax < 0)) {
    validationErrors.rangoSalarialEsperadoMax = 'El salario maximo esperado no es valido.';
  }

  if (
    parsedSalaryMin !== undefined &&
    parsedSalaryMax !== undefined &&
    parsedSalaryMin > parsedSalaryMax
  ) {
    validationErrors.rangoSalarialEsperadoMax = 'El salario maximo debe ser igual o superior al minimo.';
  }

  function markFieldTouched(field: FieldKey): void {
    setTouchedFields((current) => ({ ...current, [field]: true }));
  }

  function shouldShowFieldError(field: FieldKey): boolean {
    return Boolean(touchedFields[field] || submitAttempted);
  }

  function getFieldClassName(field: FieldKey): string {
    return shouldShowFieldError(field) && validationErrors[field] ? 'input input-error' : 'input';
  }

  const canSubmit = Object.keys(validationErrors).length === 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitAttempted(true);

    if (!canSubmit) {
      setError('Revisa los campos marcados antes de continuar.');
      return;
    }

    setIsSubmitting(true);

    try {
      await registerProfessionalWithBackend({
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        email: email.trim(),
        password,
        tecnologiasClave: tecnologiasClave.trim() || undefined,
        aniosExperiencia: parsedYears,
        titulacionesAcademicas: titulacionesAcademicas.trim() || undefined,
        idiomas: idiomas.trim() || undefined,
        softSkills: softSkills.trim() || undefined,
        rangoSalarialEsperadoMin: parsedSalaryMin,
        rangoSalarialEsperadoMax: parsedSalaryMax,
        descripcionPersonal: descripcionPersonal.trim() || undefined,
        areaNegocio: areaNegocio as BusinessAreaValue,
      });

      navigate(PATHS.login, {
        replace: true,
        state: { registrationSuccess: 'Usuario profesional creado correctamente. Ya puedes iniciar sesion.' },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el usuario profesional.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="centered-screen auth-screen">
      <div className="card auth-card">
        <span className="badge">Alta profesional</span>
        <h1>Crear perfil profesional</h1>
        <p>Completa los datos para registrar una cuenta profesional en la base de datos.</p>
        <div className="field-hint field-hint-info">
          Los campos principales son obligatorios. Los datos del perfil puedes completarlos después,
          pero cuanto más completos estén, mejor encajará tu candidatura.
        </div>

        <form onSubmit={handleSubmit} className="form-stack">
          <label>
            <span>Nombre</span>
            <input
              className={getFieldClassName('nombre')}
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              onBlur={() => markFieldTouched('nombre')}
              aria-invalid={shouldShowFieldError('nombre') && Boolean(validationErrors.nombre)}
              required
            />
            {shouldShowFieldError('nombre') && validationErrors.nombre ? (
              <span className="field-error">{validationErrors.nombre}</span>
            ) : null}
          </label>

          <label>
            <span>Apellidos</span>
            <input
              className={getFieldClassName('apellidos')}
              value={apellidos}
              onChange={(event) => setApellidos(event.target.value)}
              onBlur={() => markFieldTouched('apellidos')}
              aria-invalid={shouldShowFieldError('apellidos') && Boolean(validationErrors.apellidos)}
              required
            />
            {shouldShowFieldError('apellidos') && validationErrors.apellidos ? (
              <span className="field-error">{validationErrors.apellidos}</span>
            ) : null}
          </label>

          <label>
            <span>Email</span>
            <input
              className={getFieldClassName('email')}
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => markFieldTouched('email')}
              aria-invalid={shouldShowFieldError('email') && Boolean(validationErrors.email)}
              required
            />
            {shouldShowFieldError('email') && validationErrors.email ? (
              <span className="field-error">{validationErrors.email}</span>
            ) : null}
          </label>

          <label>
            <span>Contrasena</span>
            <input
              className={getFieldClassName('password')}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={() => markFieldTouched('password')}
              minLength={8}
              aria-invalid={shouldShowFieldError('password') && Boolean(validationErrors.password)}
              required
            />
            <span className="field-hint">Debe tener al menos 8 caracteres.</span>
            {shouldShowFieldError('password') && validationErrors.password ? (
              <span className="field-error">{validationErrors.password}</span>
            ) : null}
          </label>

          <label>
            <span>Confirmar contrasena</span>
            <input
              className={getFieldClassName('confirmPassword')}
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              onBlur={() => markFieldTouched('confirmPassword')}
              minLength={8}
              aria-invalid={shouldShowFieldError('confirmPassword') && Boolean(validationErrors.confirmPassword)}
              required
            />
            {shouldShowFieldError('confirmPassword') && validationErrors.confirmPassword ? (
              <span className="field-error">{validationErrors.confirmPassword}</span>
            ) : null}
          </label>

          <label>
            <span>Area de negocio</span>
            <select
              className={getFieldClassName('areaNegocio')}
              value={areaNegocio}
              onChange={(event) => setAreaNegocio(event.target.value as BusinessAreaValue | '')}
              onBlur={() => markFieldTouched('areaNegocio')}
              aria-invalid={shouldShowFieldError('areaNegocio') && Boolean(validationErrors.areaNegocio)}
              required
            >
              <option value="">Selecciona un area</option>
              {BUSINESS_AREA_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {shouldShowFieldError('areaNegocio') && validationErrors.areaNegocio ? (
              <span className="field-error">{validationErrors.areaNegocio}</span>
            ) : null}
          </label>

          <label>
            <span>Tecnologias clave</span>
            <input
              className={getFieldClassName('tecnologiasClave')}
              value={tecnologiasClave}
              onChange={(event) => setTecnologiasClave(event.target.value)}
              onBlur={() => markFieldTouched('tecnologiasClave')}
              placeholder="Java, Spring, AWS"
            />
            <span className="field-hint">Separa cada tecnología con comas.</span>
          </label>

          <label>
            <span>Titulaciones academicas</span>
            <textarea
              className={getFieldClassName('titulacionesAcademicas')}
              value={titulacionesAcademicas}
              onChange={(event) => setTitulacionesAcademicas(event.target.value)}
              onBlur={() => markFieldTouched('titulacionesAcademicas')}
              placeholder="Grado, master, cursos relevantes..."
            />
          </label>

          <label>
            <span>Idiomas</span>
            <input
              className={getFieldClassName('idiomas')}
              value={idiomas}
              onChange={(event) => setIdiomas(event.target.value)}
              onBlur={() => markFieldTouched('idiomas')}
              placeholder="Ingles C1, Frances B2"
            />
          </label>

          <label>
            <span>Soft skills</span>
            <textarea
              className={getFieldClassName('softSkills')}
              value={softSkills}
              onChange={(event) => setSoftSkills(event.target.value)}
              onBlur={() => markFieldTouched('softSkills')}
              placeholder="Liderazgo, comunicacion, trabajo en equipo..."
            />
          </label>

          <label>
            <span>Anos de experiencia</span>
            <input
              className={getFieldClassName('aniosExperiencia')}
              type="number"
              min={0}
              max={60}
              value={aniosExperiencia}
              onChange={(event) => setAniosExperiencia(event.target.value)}
              onBlur={() => markFieldTouched('aniosExperiencia')}
            />
            {shouldShowFieldError('aniosExperiencia') && validationErrors.aniosExperiencia ? (
              <span className="field-error">{validationErrors.aniosExperiencia}</span>
            ) : null}
          </label>

          <div className="grid-cards">
            <label>
              <span>Salario esperado minimo</span>
              <input
                className={getFieldClassName('rangoSalarialEsperadoMin')}
                type="number"
                min={0}
                value={rangoSalarialEsperadoMin}
                onChange={(event) => setRangoSalarialEsperadoMin(event.target.value)}
                onBlur={() => markFieldTouched('rangoSalarialEsperadoMin')}
              />
              {shouldShowFieldError('rangoSalarialEsperadoMin') && validationErrors.rangoSalarialEsperadoMin ? (
                <span className="field-error">{validationErrors.rangoSalarialEsperadoMin}</span>
              ) : null}
            </label>

            <label>
              <span>Salario esperado maximo</span>
              <input
                className={getFieldClassName('rangoSalarialEsperadoMax')}
                type="number"
                min={0}
                value={rangoSalarialEsperadoMax}
                onChange={(event) => setRangoSalarialEsperadoMax(event.target.value)}
                onBlur={() => markFieldTouched('rangoSalarialEsperadoMax')}
              />
              {shouldShowFieldError('rangoSalarialEsperadoMax') && validationErrors.rangoSalarialEsperadoMax ? (
                <span className="field-error">{validationErrors.rangoSalarialEsperadoMax}</span>
              ) : null}
            </label>
          </div>

          <label>
            <span>Descripcion personal</span>
            <textarea
              className={getFieldClassName('descripcionPersonal')}
              value={descripcionPersonal}
              onChange={(event) => setDescripcionPersonal(event.target.value)}
              onBlur={() => markFieldTouched('descripcionPersonal')}
              placeholder="Cuéntanos brevemente tu perfil profesional..."
            />
            <span className="field-hint">Puedes resumir aquí tu objetivo profesional o tu especialidad.</span>
          </label>

          {error ? <div className="alert alert-error">{error}</div> : null}

          <button type="submit" className="button" disabled={isSubmitting}>
            {isSubmitting ? 'Creando...' : 'Crear usuario profesional'}
          </button>
        </form>
      </div>

      <div className="return-actions">
        <Link to={PATHS.login} className="button button-secondary">
          Volver
        </Link>
      </div>
    </div>
  );
}
