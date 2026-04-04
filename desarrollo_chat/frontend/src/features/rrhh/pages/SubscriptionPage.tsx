import { PageHeader } from '../../../components/common/PageHeader';

export function SubscriptionPage() {
  return (
    <section>
      <PageHeader
        title="Suscripción"
        description="Pantalla base para consultar y editar la contratación del servicio AgileICT."
      />

      <div className="card">
        <dl className="description-list">
          <div>
            <dt>Plan actual</dt>
            <dd>Bronce</dd>
          </div>
          <div>
            <dt>Estado</dt>
            <dd>Activo</dd>
          </div>
          <div>
            <dt>Renovación</dt>
            <dd>Pendiente de conectar con backend</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
