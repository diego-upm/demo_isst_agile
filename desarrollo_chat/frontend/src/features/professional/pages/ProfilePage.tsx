import { FormEvent, useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../../../components/common/PageHeader';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  getMyProfessionalProfile,
  type BackendAvailability,
  updateMyProfessionalProfile,
  type ProfessionalProfileResponse,
} from '../services/profileService';

type Availability = 'AVAILABLE' | 'OPEN_TO_OFFERS' | 'NOT_AVAILABLE';

type ProfileData = {
  nombre: string;
  apellidos: string;
  keyTechnologies: string;
  yearsExperience: number;
  availability: Availability;
  visibilityConsent: boolean;
  email: string;
};

const DEFAULT_PROFILE: ProfileData = {
  nombre: '',
  apellidos: '',
  keyTechnologies: '',
  yearsExperience: 0,
  availability: 'OPEN_TO_OFFERS',
  visibilityConsent: false,
  email: '',
};

const FALLBACK_TEXT = 'Sin definir';

function mapAvailabilityLabel(availability: Availability): string {
  if (availability === 'AVAILABLE') return 'Disponible';
  if (availability === 'OPEN_TO_OFFERS') return 'Abierto a ofertas';
  return 'No disponible';
}

function mapResponseToProfileData(response: ProfessionalProfileResponse): ProfileData {
  return {
    nombre: response.nombre ?? '',
    apellidos: response.apellidos ?? '',
    keyTechnologies: response.tecnologiasClave ?? '',
    yearsExperience: response.aniosExperiencia ?? 0,
    availability: response.disponibilidad,
    visibilityConsent: response.perfilVisible,
    email: response.email ?? '',
  };
}

function normalizeBackendAvailability(value: string): BackendAvailability {
  if (value === 'AVAILABLE' || value === 'OPEN_TO_OFFERS' || value === 'NOT_AVAILABLE') {
    return value;
  }

  return 'OPEN_TO_OFFERS';
}


export function ProfilePage() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [draft, setDraft] = useState<ProfileData>(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No hay sesion activa para cargar el perfil.');
      setIsLoading(false);
      return;
    }

    const authToken = token;

    let isMounted = true;

    async function loadProfile() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getMyProfessionalProfile(authToken);
        if (!isMounted) {
          return;
        }

        const mappedProfile = mapResponseToProfileData(response);
        setProfile(mappedProfile);
        setDraft(mappedProfile);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(err instanceof Error ? err.message : 'No se pudo cargar el perfil.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const profileSummary = useMemo(
    () => ({
      headline: `${profile.nombre} ${profile.apellidos}`.trim() || FALLBACK_TEXT,
      experience: profile.yearsExperience > 0 ? `${profile.yearsExperience} anos` : FALLBACK_TEXT,
      keyTechnologies: profile.keyTechnologies.trim() || FALLBACK_TEXT,
      availability: mapAvailabilityLabel(profile.availability),
      visibility: profile.visibilityConsent ? 'Autorizada bajo solicitud explicita' : 'No autorizada',
      email: profile.email.trim() || FALLBACK_TEXT,
    }),
    [profile],
  );

  function handleStartEdit() {
    setDraft(profile);
    setSaved(false);
    setIsEditing(true);
  }

  function handleCancelEdit() {
    setDraft(profile);
    setSaved(false);
    setIsEditing(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      setError('No hay sesion activa para guardar cambios.');
      return;
    }

    setError(null);
    setSaved(false);

    const payload = {
      nombre: draft.nombre.trim(),
      apellidos: draft.apellidos.trim(),
      tecnologiasClave: draft.keyTechnologies.trim(),
      aniosExperiencia: draft.yearsExperience,
      disponibilidad: normalizeBackendAvailability(draft.availability),
      perfilVisible: draft.visibilityConsent,
    };

    void (async () => {
      try {
        const updatedProfile = await updateMyProfessionalProfile(token, payload);
        const mappedProfile = mapResponseToProfileData(updatedProfile);
        setProfile(mappedProfile);
        setDraft(mappedProfile);
        setSaved(true);
        setIsEditing(false);
        window.setTimeout(() => setSaved(false), 2500);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo guardar el perfil.');
      }
    })();
  }

  if (isLoading) {
    return (
      <section>
        <PageHeader title="Mi perfil profesional" description="Cargando informacion del perfil..." />
        <div className="card">Cargando perfil...</div>
      </section>
    );
  }

  return (
    <section>
      <PageHeader
        title="Mi perfil profesional"
        description="Consulta tu informacion actual y actualizala cuando lo necesites."
      />

      {error ? <div className="alert alert-error">{error}</div> : null}

      <article className="card">
        <h3>Informacion actual del perfil</h3>
        <dl className="description-list">
          <div>
            <dt>Titular</dt>
            <dd>{profileSummary.headline}</dd>
          </div>
          <div>
            <dt>Experiencia</dt>
            <dd>{profileSummary.experience}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{profileSummary.email}</dd>
          </div>
          <div>
            <dt>Tecnologias clave</dt>
            <dd>{profileSummary.keyTechnologies}</dd>
          </div>
          <div>
            <dt>Disponibilidad</dt>
            <dd>{profileSummary.availability}</dd>
          </div>
          <div>
            <dt>Visibilidad del perfil</dt>
            <dd>{profileSummary.visibility}</dd>
          </div>
        </dl>

        {!isEditing ? (
          <div style={{ marginTop: '1rem' }}>
            <button type="button" className="button" onClick={handleStartEdit}>
              Editar perfil
            </button>
          </div>
        ) : null}
      </article>

      {isEditing ? (
        <form className="card form-stack" style={{ marginTop: '1rem' }} onSubmit={handleSubmit}>
          <label>
            <span>Nombre</span>
            <input
              type="text"
              placeholder="Ej. Carlos"
              value={draft.nombre}
              onChange={(event) => setDraft((current) => ({ ...current, nombre: event.target.value }))}
            />
          </label>

          <label>
            <span>Apellidos</span>
            <input
              type="text"
              placeholder="Ej. Serrano"
              value={draft.apellidos}
              onChange={(event) => setDraft((current) => ({ ...current, apellidos: event.target.value }))}
            />
          </label>

          <label>
            <span>Tecnologias clave</span>
            <input
              type="text"
              placeholder="Java, Spring, AWS, Kubernetes"
              value={draft.keyTechnologies}
              onChange={(event) => setDraft((current) => ({ ...current, keyTechnologies: event.target.value }))}
            />
          </label>

          <label>
            <span>Anos de experiencia</span>
            <input
              type="number"
              min={0}
              max={60}
              value={draft.yearsExperience}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  yearsExperience: Number.isNaN(Number(event.target.value)) ? 0 : Number(event.target.value),
                }))
              }
            />
          </label>

          <label>
            <span>Disponibilidad</span>
            <select
              value={draft.availability}
              onChange={(event) =>
                setDraft((current) => ({ ...current, availability: event.target.value as Availability }))
              }
            >
              <option value="AVAILABLE">Disponible</option>
              <option value="OPEN_TO_OFFERS">Abierto a ofertas</option>
              <option value="NOT_AVAILABLE">No disponible</option>
            </select>
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={draft.visibilityConsent}
              onChange={(event) =>
                setDraft((current) => ({ ...current, visibilityConsent: event.target.checked }))
              }
            />
            <span>Autorizo la visibilidad de mi perfil solo bajo solicitud explicita.</span>
          </label>

          <div className="page-actions">
            <button type="submit" className="button">
              Guardar perfil
            </button>
            <button type="button" className="button button-secondary" onClick={handleCancelEdit}>
              Cancelar
            </button>
          </div>
        </form>
      ) : null}

      {saved ? <div className="alert alert-success">Perfil actualizado correctamente.</div> : null}
    </section>
  );
}
