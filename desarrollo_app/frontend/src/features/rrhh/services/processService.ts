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

export async function getMyRrhhContext(token: string): Promise<ResponsableRrhhMeResponse> {
  return apiClient.get<ResponsableRrhhMeResponse>('/v1/rrhh/me', { token });
}

export async function createProceso(token: string, payload: CreateProcesoRequest): Promise<ProcesoResponse> {
  return apiClient.post<ProcesoResponse>('/v1/procesos', payload, { token });
}

export async function listProcesosByEmpresa(token: string, empresaClienteId: string): Promise<ProcesoResponse[]> {
  return apiClient.get<ProcesoResponse[]>(`/v1/procesos?empresaClienteId=${encodeURIComponent(empresaClienteId)}`, {
    token,
  });
}

export async function deleteProceso(token: string, procesoId: string): Promise<void> {
  return apiClient.delete<void>(`/v1/procesos/${encodeURIComponent(procesoId)}`, { token });
}
