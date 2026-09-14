import { AxiosError } from 'axios';

export type ApiErrorKind =
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'validation'
  | 'conflict'
  | 'rateLimit'
  | 'server'
  | 'unknown';

export interface NormalizedApiError {
  kind: ApiErrorKind;
  status: number | null;
  code: string;
  message: string;
  details?: Record<string, string[]>;
  requestId?: string;
  raw: unknown;
}

const DEFAULT_MESSAGES: Record<ApiErrorKind, string> = {
  network: 'Network error. Please check your connection and try again.',
  unauthorized: 'Your session has expired. Please sign in again.',
  forbidden: 'You do not have permission to perform this action.',
  notFound: 'The requested resource was not found.',
  validation: 'Some fields need your attention.',
  conflict: 'This action conflicts with the current state.',
  rateLimit: 'Too many requests. Please slow down and try again shortly.',
  server: 'Something went wrong on our side. Please try again.',
  unknown: 'An unexpected error occurred.',
};

export function normalizeApiError(err: unknown): NormalizedApiError {
  if (err instanceof AxiosError) {
    const status = err.response?.status ?? null;
    const body = err.response?.data as
      | {
          error?: {
            code?: string;
            message?: string;
            details?: Record<string, string[]>;
            requestId?: string;
          };
        }
      | undefined;

    const kind = classify(status);
    return {
      kind,
      status,
      code: body?.error?.code ?? kind,
      message: body?.error?.message ?? DEFAULT_MESSAGES[kind],
      details: body?.error?.details,
      requestId: body?.error?.requestId,
      raw: err,
    };
  }

  if (err instanceof Error) {
    return {
      kind: 'unknown',
      status: null,
      code: 'unknown',
      message: err.message || DEFAULT_MESSAGES.unknown,
      raw: err,
    };
  }

  return {
    kind: 'unknown',
    status: null,
    code: 'unknown',
    message: DEFAULT_MESSAGES.unknown,
    raw: err,
  };
}

function classify(status: number | null): ApiErrorKind {
  if (status === null) return 'network';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'notFound';
  if (status === 409) return 'conflict';
  if (status === 422 || status === 400) return 'validation';
  if (status === 429) return 'rateLimit';
  if (status >= 500) return 'server';
  return 'unknown';
}
