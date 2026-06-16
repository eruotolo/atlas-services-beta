import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { storage } from '@/shared/lib/storage';
import { setClientToken, setRefreshCallback } from '@/shared/lib/apiClient';
import { authService } from '@/features/auth/services/authService';
import type { AuthUser, LoginRequest, RegisterRequest } from '@/features/auth/types';

export type UserRole = 'CLIENT' | 'PROVIDER';
const ROLE_STORAGE_KEY = 'hireeo.activeRole';

interface AuthContextValue {
  readonly user: AuthUser | null;
  readonly isLoading: boolean;
  readonly isAuthenticated: boolean;
  readonly activeRole: UserRole;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  toggleRole: () => Promise<void>;
  updateUser: (patch: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [user, setUser]         = useState<AuthUser | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<UserRole>('CLIENT');

  // Restore session on mount
  useEffect(() => {
    void (async () => {
      try {
        const [storedUser, token, storedRole] = await Promise.all([
          authService.getStoredUser(),
          authService.getAccessToken(),
          storage.getItem(ROLE_STORAGE_KEY),
        ]);
        if (storedUser && token) {
          setClientToken(token);
          setUser(storedUser);
          if (storedRole === 'CLIENT' || storedRole === 'PROVIDER') {
            setActiveRole(storedRole);
          } else if (storedUser.roles?.includes('PROVIDER')) {
             // Default to PROVIDER if they have the role, or CLIENT otherwise
            setActiveRole('PROVIDER');
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Wire up token-refresh callback so apiClient can call it on 401
  const handleRefresh = useCallback(async (): Promise<string | null> => {
    const result = await authService.refresh();
    if (!result) {
      await authService.clearSession();
      setClientToken(null);
      setUser(null);
      return null;
    }
    setClientToken(result.accessToken);
    return result.accessToken;
  }, []);

  useEffect(() => {
    setRefreshCallback(handleRefresh);
  }, [handleRefresh]);

  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    const response = await authService.login(credentials);
    setClientToken(response.accessToken);
    setUser(response.user);
    if (response.user.roles?.includes('PROVIDER')) {
      setActiveRole('PROVIDER');
      await storage.setItem(ROLE_STORAGE_KEY, 'PROVIDER');
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest): Promise<void> => {
    const response = await authService.register(data);
    setClientToken(response.accessToken);
    setUser(response.user);
    if (response.user.roles?.includes('PROVIDER')) {
      setActiveRole('PROVIDER');
      await storage.setItem(ROLE_STORAGE_KEY, 'PROVIDER');
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await authService.clearSession();
    await storage.deleteItem(ROLE_STORAGE_KEY);
    setClientToken(null);
    setRefreshCallback(async () => null); // replace with no-op to prevent stale setState on unmounted context
    setUser(null);
    setActiveRole('CLIENT');
  }, []);

  const toggleRole = useCallback(async (): Promise<void> => {
    const nextRole = activeRole === 'CLIENT' ? 'PROVIDER' : 'CLIENT';
    setActiveRole(nextRole);
    await storage.setItem(ROLE_STORAGE_KEY, nextRole);
  }, [activeRole]);

  const updateUser = useCallback(async (patch: Partial<AuthUser>): Promise<void> => {
    if (!user) return;
    const updated = { ...user, ...patch } as AuthUser;
    await authService.updateStoredUser(updated);
    setUser(updated);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: user !== null, activeRole, login, register, logout, toggleRole, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
