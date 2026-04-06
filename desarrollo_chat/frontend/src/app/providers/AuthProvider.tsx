import { createContext, useEffect, useMemo, useState } from 'react';
import type { AuthContextValue, AuthUser, LoginCredentials } from '../../types/auth';
import {
  clearStoredSession,
  getStoredSession,
  loginWithBackend,
} from '../../features/auth/services/authService';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedSession = getStoredSession();
    setUser(storedSession?.user ?? null);
    setToken(storedSession?.token ?? null);
    setIsLoading(false);
  }, []);

  async function login(credentials: LoginCredentials) {
    const session = await loginWithBackend(credentials);
    setUser(session.user);
    setToken(session.token);
    return session.user;
  }

  function logout() {
    clearStoredSession();
    setUser(null);
    setToken(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [user, token, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
