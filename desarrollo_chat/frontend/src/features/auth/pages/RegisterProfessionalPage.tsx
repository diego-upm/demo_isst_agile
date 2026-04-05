import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerProfessionalWithBackend } from '../services/authService';
import { PATHS } from '../../../routes/paths';

export function RegisterProfessionalPage() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tecnologiasClave, setTecnologiasClave] = useState('');
  const [aniosExperiencia, setAniosExperiencia] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('La contrasena debe tener al menos 8 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('La confirmacion de contrasena no coincide.');
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedYears = aniosExperiencia.trim() === '' ? undefined : Number(aniosExperiencia);

      if (parsedYears !== undefined && (Number.isNaN(parsedYears) || parsedYears < 0 || parsedYears > 60)) {
        throw new Error('Los anos de experiencia deben estar entre 0 y 60.');
      }

      await registerProfessionalWithBackend({
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        email: email.trim(),
        password,
        tecnologiasClave: tecnologiasClave.trim() || undefined,
        aniosExperiencia: parsedYears,
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

        <form onSubmit={handleSubmit} className="form-stack">
          <label>
            <span>Nombre</span>
            <input value={nombre} onChange={(event) => setNombre(event.target.value)} required />
          </label>

          <label>
            <span>Apellidos</span>
            <input value={apellidos} onChange={(event) => setApellidos(event.target.value)} required />
          </label>

          <label>
            <span>Email</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>

          <label>
            <span>Contrasena</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
          </label>

          <label>
            <span>Confirmar contrasena</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              required
            />
          </label>

          <label>
            <span>Tecnologias clave</span>
            <input
              value={tecnologiasClave}
              onChange={(event) => setTecnologiasClave(event.target.value)}
              placeholder="Java, Spring, AWS"
            />
          </label>

          <label>
            <span>Anos de experiencia</span>
            <input
              type="number"
              min={0}
              max={60}
              value={aniosExperiencia}
              onChange={(event) => setAniosExperiencia(event.target.value)}
            />
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
