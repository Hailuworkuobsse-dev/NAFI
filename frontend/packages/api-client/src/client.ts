import axios, {
  type AxiosInstance,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  getAccessToken: () => string | null;
  onUnauthorized: () => void;
  onRefreshToken: () => Promise<string>;
  clientVersion?: string;
  timeoutMs?: number;
}

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeoutMs ?? 30_000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use((req) => {
    const token = config.getAccessToken();
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    if (config.clientVersion) {
      req.headers['X-Client-Version'] = config.clientVersion;
    }
    return req;
  });

  client.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const original = error.config as RetryableConfig | undefined;
      if (!original) return Promise.reject(error);

      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        try {
          const newToken = await config.onRefreshToken();
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${newToken}`;
          return client(original);
        } catch (refreshErr) {
          config.onUnauthorized();
          return Promise.reject(refreshErr);
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
}
