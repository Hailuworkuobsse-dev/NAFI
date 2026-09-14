import type { AxiosInstance, AxiosRequestConfig } from 'axios';

import { apiClient as baseClient } from '@/auth/api';

import { normalizeApiError } from './errors';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

/**
 * Domain-facing wrapper around the auth API client.
 *  - Normalizes errors via throwing NormalizedApiError
 *  - Unwraps the { data } envelope
 */
class HttpClient {
  constructor(private readonly client: AxiosInstance) {}

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.client.get<{ data: T }>(url, config);
      return res.data.data;
    } catch (err) {
      throw normalizeApiError(err);
    }
  }

  async post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.client.post<{ data: T }>(url, body, config);
      return res.data.data;
    } catch (err) {
      throw normalizeApiError(err);
    }
  }

  async put<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.client.put<{ data: T }>(url, body, config);
      return res.data.data;
    } catch (err) {
      throw normalizeApiError(err);
    }
  }

  async patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.client.patch<{ data: T }>(url, body, config);
      return res.data.data;
    } catch (err) {
      throw normalizeApiError(err);
    }
  }

  async delete<T = void>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const res = await this.client.delete<{ data: T }>(url, config);
      return res.data.data;
    } catch (err) {
      throw normalizeApiError(err);
    }
  }
}

export const http = new HttpClient(baseClient);

/**
 * Build query strings safely, dropping undefined/null values.
 */
export function buildQuery(params: Record<string, unknown>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v)) {
      v.forEach((item) => usp.append(k, String(item)));
    } else {
      usp.append(k, String(v));
    }
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : '';
}

export { BASE_URL };
