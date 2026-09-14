import * as Sentry from '@sentry/react';

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.VITE_APP_ENV ?? 'development',
    release: import.meta.env.VITE_APP_VERSION,
    tracesSampleRate: import.meta.env.VITE_APP_ENV === 'production' ? 0.1 : 1.0,
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      /Failed to fetch/,
      /NetworkError/,
    ],
    beforeSend(event) {
      if (event.request?.url) {
        event.request.url = event.request.url.replace(/([?&])token=[^&]*/g, '$1token=[redacted]');
      }
      if (event.request?.headers) {
        delete event.request.headers.Authorization;
        delete event.request.headers.authorization;
      }
      return event;
    },
    integrations: [Sentry.browserTracingIntegration()],
  });
}

export function identifyUser(user: {
  id: string;
  role: string;
  institutionId?: string;
}): void {
  Sentry.setUser({ id: user.id, role: user.role, institutionId: user.institutionId });
}

export function clearUser(): void {
  Sentry.setUser(null);
}

export { Sentry };
