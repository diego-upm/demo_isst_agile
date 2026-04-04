import { PageHeader } from '../../../components/common/PageHeader';

export function SelectionPage() {
  return (
    <section>
      <PageHeader
        title="Gestión de selección"
        description="Zona preparada para visualizar candidatos, autorizaciones y decisiones del proceso."
      />

      <div className="grid-cards">
        <article className="card">
          <h3>Candidatos pendientes</h3>
          <p>Preparado para futuros endpoints de candidatos asociados a cada proceso.</p>
        </article>

        <article className="card">
          <h3>Solicitudes de visibilidad</h3>
          <p>Placeholder para modelar la autorización explícita del profesional antes del acceso completo.</p>
        </article>

        <article className="card">
          <h3>Estados</h3>
          <p>PENDIENTE, AUTORIZADO, DESCARTADO y SELECCIONADO como base visual inicial.</p>
        </article>
      </div>
    </section>
  );
}
