import { apiClient } from '../../../services/apiClient';
import type { BusinessAreaValue } from '../../professional/types/businessAreas';

export type NivelConfidencialidad = 'INTERNAL' | 'CONFIDENTIAL';

interface ResponsableRrhhMeResponse {
  id: string;
  nombre: string;
  apellidos: string;
  email: string;
  empresaClienteId: string;
  empresaClienteNombre: string;
  empresaClienteSector?: string | null;
}

interface CreateProcesoRequest {
  empresaClienteId: string;
  responsableRrhhId: string;
  titulo: string;
  descripcion: string;
  nivelConfidencialidad: NivelConfidencialidad;
  nivelExperienciaMinimo?: string;
  puestos: Array<{
    titulo: string;
    senioridad: 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD';
    modalidad?: string;
    ubicacion?: string;
    area?: string;
    descripcion?: string;
    tecnologiasRequeridas?: string;
    tipoContrato?: string;
    sectorRequerido?: BusinessAreaValue;
  }>;
}

export interface ProcesoResponse {
  id: string;
  titulo?: string;
  descripcion?: string;
  estado?: 'ACTIVE' | 'IN_SELECTION' | 'CLOSED' | 'CANCELLED';
}

export interface CandidatoSugerido {
  profesionalId: string;
  displayName: string;
  tecnologiasClave?: string | null;
  aniosExperiencia?: number | null;
  areaNegocio?: string | null;
  softSkills?: string | null;
  idiomas?: string | null;
  titulacionesAcademicas?: string | null;
  disponibilidad?: string | null;
}

export interface CreateProcesoResponse {
  proceso: ProcesoResponse;
  candidatosSugeridos: CandidatoSugerido[];
}

export async function getMyRrhhContext(token: string): Promise<ResponsableRrhhMeResponse> {
  return apiClient.get<ResponsableRrhhMeResponse>('/v1/rrhh/me', { token });
}

export async function createProceso(token: string, payload: CreateProcesoRequest): Promise<CreateProcesoResponse> {
  return apiClient.post<CreateProcesoResponse>('/v1/procesos', payload, { token });
}

export async function listProcesosByEmpresa(token: string, empresaClienteId: string): Promise<ProcesoResponse[]> {
  return apiClient.get<ProcesoResponse[]>(`/v1/procesos?empresaClienteId=${encodeURIComponent(empresaClienteId)}`, {
    token,
  });
}

export async function deleteProceso(token: string, procesoId: string): Promise<void> {
  return apiClient.delete<void>(`/v1/procesos/${encodeURIComponent(procesoId)}`, { token });
}
