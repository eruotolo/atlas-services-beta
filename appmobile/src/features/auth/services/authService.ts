import { storage } from '@/shared/lib/storage';
import { apiClient } from '@/shared/lib/apiClient';
import type { AuthResponse, AuthUser, LoginRequest, RefreshResponse, RegisterRequest } from '@/features/auth/types';

const KEYS = {
  ACCESS_TOKEN:  'hireeo.access_token',
  REFRESH_TOKEN: 'hireeo.refresh_token',
  USER:          'hireeo.user',
} as const;

async function storeTokens(accessToken: string, refreshToken: string): Promise<void> {
  await Promise.all([
    storage.setItem(KEYS.ACCESS_TOKEN,  accessToken),
    storage.setItem(KEYS.REFRESH_TOKEN, refreshToken),
  ]);
}

async function storeUser(user: AuthUser): Promise<void> {
  await storage.setItem(KEYS.USER, JSON.stringify(user));
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    await storeTokens(response.accessToken, response.refreshToken);
    await storeUser(response.user);
    return response;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    await storeTokens(response.accessToken, response.refreshToken);
    await storeUser(response.user);
    return response;
  },

  async refresh(): Promise<RefreshResponse | null> {
    try {
      const refreshToken = await storage.getItem(KEYS.REFRESH_TOKEN);
      if (!refreshToken) return null;
      const response = await apiClient.post<RefreshResponse>('/auth/refresh', { refreshToken });
      await storeTokens(response.accessToken, response.refreshToken);
      return response;
    } catch {
      return null;
    }
  },

  async getAccessToken(): Promise<string | null> {
    return storage.getItem(KEYS.ACCESS_TOKEN);
  },

  async getStoredUser(): Promise<AuthUser | null> {
    const raw = await storage.getItem(KEYS.USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  },

  async updateStoredUser(user: AuthUser): Promise<void> {
    await storeUser(user);
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },

  async clearSession(): Promise<void> {
    await Promise.all([
      storage.deleteItem(KEYS.ACCESS_TOKEN),
      storage.deleteItem(KEYS.REFRESH_TOKEN),
      storage.deleteItem(KEYS.USER),
    ]);
  },
};
