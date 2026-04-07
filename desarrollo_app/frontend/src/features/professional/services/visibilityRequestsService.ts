import { apiClient } from '../../../services/apiClient';
import type { SelectionBoardItemResponse } from '../../rrhh/services/selectionService';

interface UpdateCandidateStateRequest {
  estado: 'ACEPTADO' | 'RECHAZADO';
}

export async function getMyCandidatures(token: string): Promise<SelectionBoardItemResponse[]> {
  return apiClient.get<SelectionBoardItemResponse[]>('/v1/profesionales/me/candidaturas', { token });
}

export async function getMyPendingVisibilityRequests(token: string): Promise<SelectionBoardItemResponse[]> {
  return apiClient.get<SelectionBoardItemResponse[]>('/v1/profesionales/me/solicitudes-visibilidad', { token });
}

export async function acceptVisibilityRequest(token: string, candidaturaId: string): Promise<SelectionBoardItemResponse> {
  return apiClient.put<SelectionBoardItemResponse>(
    `/v1/profesionales/me/candidaturas/${encodeURIComponent(candidaturaId)}/solicitud-visibilidad/aceptar`,
    undefined,
    { token },
  );
}

export async function rejectVisibilityRequest(token: string, candidaturaId: string): Promise<SelectionBoardItemResponse> {
  return apiClient.put<SelectionBoardItemResponse>(
    `/v1/profesionales/me/candidaturas/${encodeURIComponent(candidaturaId)}/solicitud-visibilidad/rechazar`,
    undefined,
    { token },
  );
}

export async function acceptCandidatureRequest(token: string, candidaturaId: string): Promise<SelectionBoardItemResponse> {
  return apiClient.put<SelectionBoardItemResponse>(
    `/v1/profesionales/me/candidaturas/${encodeURIComponent(candidaturaId)}/estado`,
    { estado: 'ACEPTADO' } satisfies UpdateCandidateStateRequest,
    { token },
  );
}

export async function rejectCandidatureRequest(token: string, candidaturaId: string): Promise<SelectionBoardItemResponse> {
  return apiClient.put<SelectionBoardItemResponse>(
    `/v1/profesionales/me/candidaturas/${encodeURIComponent(candidaturaId)}/estado`,
    { estado: 'RECHAZADO' } satisfies UpdateCandidateStateRequest,
    { token },
  );
}