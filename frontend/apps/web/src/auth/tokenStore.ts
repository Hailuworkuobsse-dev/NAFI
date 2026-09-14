/**
 * Access token is kept ONLY in memory — never in localStorage or sessionStorage.
 * Refresh token lives in an httpOnly cookie set by the API.
 * This file is the single source of truth for the access token at runtime.
 */

let accessToken: string | null = null;

export const tokenStore = {
  get: () => accessToken,
  set: (token: string | null) => {
    accessToken = token;
  },
  clear: () => {
    accessToken = null;
  },
};
