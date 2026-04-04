import type { AuthUser, LoginCredentials } from '../../../types/auth';

const STORAGE_KEY = 'agileict.auth.user';

const DEMO_USERS: Record<string, AuthUser> = {
  'rrhh@agileict.local': {
    id: 'usr-rrhh-001',
    fullName: 'Laura Martín',
    email: 'rrhh@agileict.local',
    role: 'RRHH',
  },
  'pro@agileict.local': {
    id: 'usr-pro-001',
    fullName: 'Diego Serrano',
    email: 'pro@agileict.local',
    role: 'PROFESSIONAL',
  },
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function loginWithMock(credentials: LoginCredentials): Promise<AuthUser> {
  await delay(350);

  const foundUser = DEMO_USERS[credentials.email.toLowerCase()];

  if (!foundUser || foundUser.role !== credentials.role) {
    throw new Error('Credenciales o rol no válidos.');
  }

  if (credentials.password !== 'demo1234') {
    throw new Error('La contraseña de demo es demo1234.');
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(foundUser));
  return foundUser;
}

export function getStoredUser(): AuthUser | null {
  const rawValue = localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AuthUser;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearStoredUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}
