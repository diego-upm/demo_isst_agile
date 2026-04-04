import { PageHeader } from '../../../components/common/PageHeader';

const mockProcesses = [
  {
    id: 'PHH-001',
    title: 'Arquitecto/a Cloud Senior',
    status: 'ACTIVO',
    technologies: 'AWS, Kubernetes, Terraform',
  },
  {
    id: 'PHH-002',
    title: 'Lead Backend Java',
    status: 'EN_SELECCION',
    technologies: 'Java, Spring Boot, PostgreSQL',
  },
];

export function ProcessesPage() {
  return (
    <section>
      <PageHeader
        title="Procesos de headhunting"
        description="Listado base para el caso de uso iniciar y gestionar procesos de selección."
      />

      <div className="list-stack">
        {mockProcesses.map((process) => (
          <article key={process.id} className="card">
            <div className="card-row">
              <div>
                <span className="badge">{process.status}</span>
                <h3>{process.title}</h3>
                <p>{process.technologies}</p>
              </div>
              <button type="button" className="button button-secondary">
                Abrir detalle
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
