import { FormEvent, useState } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';

export function ProfilePage() {
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <section>
      <PageHeader
        title="Mi perfil profesional"
        description="Formulario base para el caso de uso gestionar perfil profesional."
      />

      <form className="card form-stack" onSubmit={handleSubmit}>
        <label>
          <span>Titular profesional</span>
          <input type="text" placeholder="Ej. Senior Cloud Architect" />
        </label>

        <label>
          <span>Experiencia</span>
          <textarea placeholder="Resume tu experiencia, tecnologías y sectores."></textarea>
        </label>

        <label>
          <span>Tecnologías clave</span>
          <input type="text" placeholder="Java, Spring, AWS, Kubernetes" />
        </label>

        <label>
          <span>Disponibilidad</span>
          <select defaultValue="OPEN">
            <option value="OPEN">Disponible</option>
            <option value="LIMITED">Escucho propuestas</option>
            <option value="CLOSED">No disponible</option>
          </select>
        </label>

        <label className="checkbox-row">
          <input type="checkbox" defaultChecked />
          <span>Autorizo la visibilidad de mi perfil solo bajo solicitud explícita.</span>
        </label>

        {saved ? <div className="alert alert-success">Cambios guardados en local como placeholder visual.</div> : null}

        <button type="submit" className="button">
          Guardar perfil
        </button>
      </form>
    </section>
  );
}
