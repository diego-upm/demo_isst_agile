import { createContext, useEffect, useMemo, useState } from 'react';
import type { AuthContextValue, AuthUser, LoginCredentials } from '../../types/auth';
import { clearStoredUser, getStoredUser, loginWithMock } from '../../features/auth/services/authService';

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  async function login(credentials: LoginCredentials) {
    const authenticatedUser = await loginWithMock(credentials);
    setUser(authenticatedUser);
  }

  function logout() {
    clearStoredUser();
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
