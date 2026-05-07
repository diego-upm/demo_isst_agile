import { apiClient } from '../../../services/apiClient';

export type CandidateState = 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';
export type VisibilityState = 'NO_SOLICITADO' | 'SOLICITADO' | 'RECHAZADO' | 'ACEPTADO';

export interface SelectionBoardItemResponse {
  candidaturaId: string | null;
  procesoId: string | null;
  procesoTitulo: string | null;
  procesoDescripcion: string | null;
  procesoEstado: string | null;
  procesoNivelConfidencialidad: string | null;
  procesoNivelExperienciaMinimo: string | null;
  puesto: {
    id: string;
    titulo: string;
    senioridad: string;
    modalidad: string | null;
    ubicacion: string | null;
    area: string | null;
    descripcion: string | null;
    tecnologiasRequeridas: string | null;
    tipoContrato: string | null;
    sectorRequerido: string | null;
  } | null;
  profesionalId: string;
  displayName: string;
  nombre: string | null;
  apellidos: string | null;
  email: string | null;
  descripcionPersonal: string | null;
  tecnologiasClave: string | null;
  titulacionesAcademicas: string | null;
  idiomas: string | null;
  softSkills: string | null;
  aniosExperiencia: number | null;
  rangoSalarialEsperadoMin: number | null;
  rangoSalarialEsperadoMax: number | null;
  areaNegocio: string | null;
  sector: string | null;
  activo: boolean;
  disponibilidad: string | null;
  estado: CandidateState | null;
  solicitudVisibilidad: VisibilityState | null;
  fechaInclusion: string | null;
  fechaActualizacion: string | null;
  anonimo: boolean;
}

export interface SelectionBoardResponse {
  procesoId: string;
  procesoTitulo: string;
  puestos: Array<{
    id: string;
    titulo: string;
    senioridad: string;
    modalidad: string | null;
    ubicacion: string | null;
    area: string | null;
    descripcion: string | null;
    tecnologiasRequeridas: string | null;
    tipoContrato: string | null;
    sectorRequerido: string | null;
  }>;
  candidatosSugeridosPorPuesto: Record<string, SelectionBoardItemResponse[]>;
  profesionalesDisponibles: SelectionBoardItemResponse[];
  candidatos: SelectionBoardItemResponse[];
  solicitudesVisibilidad: SelectionBoardItemResponse[];
}

export interface CreateCandidateRequest {
  profesionalId: string;
  puestoTicId: string;
}

export async function getSelectionBoard(
  token: string,
  procesoId: string,
  search?: string,
): Promise<SelectionBoardResponse> {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiClient.get<SelectionBoardResponse>(`/v1/procesos/${encodeURIComponent(procesoId)}/candidatos${query}`, {
    token,
  });
}

export async function addCandidateToProcess(
  token: string,
  procesoId: string,
  profesionalId: string,
  puestoTicId: string,
): Promise<SelectionBoardItemResponse> {
  return apiClient.post<SelectionBoardItemResponse>(
    `/v1/procesos/${encodeURIComponent(procesoId)}/candidatos`,
    { profesionalId, puestoTicId } satisfies CreateCandidateRequest,
    { token },
  );
}

export async function requestCandidateVisibility(
  token: string,
  procesoId: string,
  candidaturaId: string,
): Promise<SelectionBoardItemResponse> {
  return apiClient.put<SelectionBoardItemResponse>(
    `/v1/procesos/${encodeURIComponent(procesoId)}/candidatos/${encodeURIComponent(candidaturaId)}/solicitud-visibilidad`,
    undefined,
    { token },
  );
}

export async function deleteCandidateFromProcess(
  token: string,
  procesoId: string,
  candidaturaId: string,
): Promise<void> {
  return apiClient.delete<void>(
    `/v1/procesos/${encodeURIComponent(procesoId)}/candidatos/${encodeURIComponent(candidaturaId)}`,
    { token },
  );
}