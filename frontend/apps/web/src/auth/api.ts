import { createApiClient } from '@nafi/api-client';

import { tokenStore } from './tokenStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

/**
 * Single shared API client.
 *  - Attaches access token from memory
 *  - On 401, attempts refresh via httpOnly cookie, then retries once
 *  - On refresh failure, dispatches a global logout event
 */
export const apiClient = createApiClient({
  baseURL: BASE_URL,
  clientVersion: import.meta.env.VITE_APP_VERSION ?? '1.0.0',
  getAccessToken: () => tokenStore.get(),
  onUnauthorized: () => {
    tokenStore.clear();
    window.dispatchEvent(new CustomEvent('nafi:logout'));
  },
  onRefreshToken: async () => {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('Refresh failed');
    const json = (await res.json()) as { data: { accessToken: string } };
    tokenStore.set(json.data.accessToken);
    return json.data.accessToken;
  },
});

export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface LoginResponse {
  accessToken: string;
  user: import('./authStore').AuthUser;
  mfaRequired?: boolean;
}

export interface RegisterRequest {
  role: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  locale: 'en' | 'am' | 'om' | 'ti';
  acceptTerms: true;
}

export const authApi = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const res = await apiClient.post<{ data: LoginResponse }>('/auth/login', payload);
    return res.data.data;
  },

  async register(payload: RegisterRequest): Promise<{ userId: string }> {
    const res = await apiClient.post<{ data: { userId: string } }>('/auth/register', payload);
    return res.data.data;
  },

  async me(): Promise<import('./authStore').AuthUser> {
    const res = await apiClient.get<{ data: import('./authStore').AuthUser }>('/auth/me');
    return res.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/auth/password/forgot', { email });
  },

  async confirmPasswordReset(token: string, password: string): Promise<void> {
    await apiClient.post('/auth/password/reset', { token, password });
  },

  async verifyMfa(code: string): Promise<{ accessToken: string }> {
    const res = await apiClient.post<{ data: { accessToken: string } }>('/auth/mfa/verify', {
      code,
    });
    return res.data.data;
  },
};
