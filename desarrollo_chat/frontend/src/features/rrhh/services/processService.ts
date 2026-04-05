import { apiClient } from '../../../services/apiClient';

export type NivelConfidencialidad = 'INTERNAL' | 'CONFIDENTIAL';

interface ResponsableRrhhMeResponse {
  id: string;
  empresaClienteId: string;
}

interface CreateProcesoRequest {
  empresaClienteId: string;
  responsableRrhhId: string;
  titulo: string;
  descripcion: string;
  nivelConfidencialidad: NivelConfidencialidad;
  tecnologiasRequeridas?: string;
  nivelExperienciaMinimo?: string;
  tipoContrato?: string;
  rangoSalarialMinimo?: number;
  rangoSalarialMaximo?: number;
  puestos: Array<{
    titulo: string;
    senioridad: 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD';
    modalidad?: string;
    ubicacion?: string;
    area?: string;
    descripcion?: string;
  }>;
}

export interface ProcesoResponse {
  id: string;
  titulo?: string;
  estado?: 'ACTIVE' | 'IN_SELECTION' | 'CLOSED' | 'CANCELLED';
  tecnologiasRequeridas?: string | null;
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
