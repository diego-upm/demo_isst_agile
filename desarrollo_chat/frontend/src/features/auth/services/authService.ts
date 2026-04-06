import { apiClient } from '../../../services/apiClient';
import type { AuthSession, AuthUser, LoginCredentials, UserRole } from '../../../types/auth';

const STORAGE_KEY = 'agileict.auth.session';

interface LoginApiResponse {
  token: string;
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}

export interface RegisterProfessionalPayload {
  nombre: string;
  apellidos: string;
  email: string;
  password: string;
  tecnologiasClave?: string;
  aniosExperiencia?: number;
  titulacionesAcademicas?: string;
  idiomas?: string;
  softSkills?: string;
  rangoSalarialEsperadoMin?: number;
  rangoSalarialEsperadoMax?: number;
  descripcionPersonal?: string;
}

export interface RegisterRrhhPayload {
  empresaClienteId: string;
  responsableNombre: string;
  responsableApellidos: string;
  responsableEmail: string;
  password: string;
  cargo?: string;
}

export interface CompanyOption {
  id: string;
  nombre: string;
  cif: string;
  sector?: string | null;
  activa: boolean;
}

export interface CreateCompanyPayload {
  nombre: string;
  cif: string;
  sector?: string;
}

function mapRole(roles: string[]): UserRole {
  if (roles.includes('ROLE_RRHH')) {
    return 'RRHH';
  }

  if (roles.includes('ROLE_PROFESSIONAL')) {
    return 'PROFESSIONAL';
  }

  throw new Error('El usuario no tiene un rol permitido para esta aplicación.');
}

function buildDisplayName(email: string, role: UserRole): string {
  const baseName = email.split('@')[0]?.trim();
  if (baseName) {
    return baseName;
  }

  return role === 'RRHH' ? 'Usuario RRHH' : 'Profesional';
}

function saveSession(session: AuthSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function toSession(response: LoginApiResponse): AuthSession {
  const mappedRole = mapRole(response.user.roles);

  const user: AuthUser = {
    id: response.user.id,
    email: response.user.email,
    role: mappedRole,
    fullName: buildDisplayName(response.user.email, mappedRole),
  };

  return {
    user,
    token: response.token,
  };
}

export async function loginWithBackend(credentials: LoginCredentials): Promise<AuthSession> {
  const response = await apiClient.post<LoginApiResponse>('/v1/auth/login', {
    email: credentials.email,
    password: credentials.password,
  });

  const session = toSession(response);
  saveSession(session);
  return session;
}

export async function registerProfessionalWithBackend(payload: RegisterProfessionalPayload): Promise<void> {
  await apiClient.post<LoginApiResponse>('/v1/auth/register-professional', payload);
}

export async function registerRrhhWithBackend(payload: RegisterRrhhPayload): Promise<void> {
  await apiClient.post<LoginApiResponse>('/v1/auth/register-rrhh', payload);
}

export async function listCompaniesWithBackend(): Promise<CompanyOption[]> {
  return apiClient.get<CompanyOption[]>('/v1/auth/companies');
}

export async function createCompanyWithBackend(payload: CreateCompanyPayload): Promise<CompanyOption> {
  return apiClient.post<CompanyOption>('/v1/auth/companies', payload);
}

export function getStoredSession(): AuthSession | null {
  const rawValue = localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const session = JSON.parse(rawValue) as Partial<AuthSession>;

    if (!session.user || !session.token) {
      clearStoredSession();
      return null;
    }

    return session as AuthSession;
  } catch {
    clearStoredSession();
    return null;
  }
}

export function clearStoredSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}
