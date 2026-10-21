/**
 * Access token is kept ONLY in memory — never in localStorage or sessionStorage.
 * Refresh token lives in an httpOnly cookie set by the API.
 * This file is the single source of truth for the access token at runtime.
 */

let accessToken: string | null = null;

/**
 * Non-sensitive persistence flag: "a session existed in this browser".
 * The httpOnly refresh cookie is unreadable from JS, so without this marker
 * every cold start would fire a doomed POST /auth/refresh (401 console noise)
 * even for first-time visitors. Set on login, cleared on logout and when the
 * backend rejects a refresh (session truly gone).
 */
const SESSION_MARKER = 'nafi:session';

export const tokenStore = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token;
  },
  clear: () => {
    accessToken = null;
  },
  hasSessionMarker: (): boolean => {
    try {
      return localStorage.getItem(SESSION_MARKER) === '1';
    } catch {
      return false;
    }
  },
  markSession: () => {
    try {
      localStorage.setItem(SESSION_MARKER, '1');
    } catch {
      /* storage unavailable — refresh probe simply stays disabled */
    }
  },
  clearSessionMarker: () => {
    try {
      localStorage.removeItem(SESSION_MARKER);
    } catch {
      /* ignore */
    }
  },
};
