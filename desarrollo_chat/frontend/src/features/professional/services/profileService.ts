import { apiClient } from '../../../services/apiClient';

export type BackendAvailability = 'AVAILABLE' | 'OPEN_TO_OFFERS' | 'NOT_AVAILABLE';

export interface ProfessionalProfileResponse {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  tecnologiasClave: string | null;
  titulacionesAcademicas: string | null;
  idiomas: string | null;
  softSkills: string | null;
  aniosExperiencia: number | null;
  rangoSalarialEsperadoMin: number | null;
  rangoSalarialEsperadoMax: number | null;
  descripcionPersonal: string | null;
  disponibilidad: BackendAvailability;
  perfilVisible: boolean;
  activo: boolean;
}

export interface UpdateProfessionalProfileRequest {
  nombre: string;
  apellidos: string;
  tecnologiasClave: string;
  titulacionesAcademicas: string;
  idiomas: string;
  softSkills: string;
  aniosExperiencia: number;
  rangoSalarialEsperadoMin: number | null;
  rangoSalarialEsperadoMax: number | null;
  descripcionPersonal: string;
  disponibilidad: BackendAvailability;
  perfilVisible: boolean;
}

export function getMyProfessionalProfile(token: string): Promise<ProfessionalProfileResponse> {
  return apiClient.get<ProfessionalProfileResponse>('/v1/profesionales/me', { token });
}

export function updateMyProfessionalProfile(
  token: string,
  payload: UpdateProfessionalProfileRequest,
): Promise<ProfessionalProfileResponse> {
  return apiClient.put<ProfessionalProfileResponse>('/v1/profesionales/me', payload, { token });
}
