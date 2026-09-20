/**
 * CSRF token handling for the Django backend.
 *
 * The backend sets CSRF_COOKIE_HTTPONLY, so the token cannot be read from
 * document.cookie the way Django's SPA examples assume. It is fetched from a
 * bootstrap endpoint instead and held in module scope, never in localStorage
 * or sessionStorage.
 */

import { apiUrl } from "./config";

const CSRF_ENDPOINT = "/auth/csrf/";

let token: string | null = null;
let inFlight: Promise<string> | null = null;

/** Fetch the CSRF token, reusing the in-memory value when present. */
export async function getCsrfToken(): Promise<string> {
  if (token) return token;
  inFlight ??= fetchCsrfToken();
  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}

/** Discard the cached token so the next request fetches a fresh one. */
export function clearCsrfToken(): void {
  token = null;
}

async function fetchCsrfToken(): Promise<string> {
  const response = await fetch(apiUrl(CSRF_ENDPOINT), {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`No se pudo obtener el token CSRF (${response.status})`);
  }
  const data: unknown = await response.json();
  const value = (data as { csrfToken?: string }).csrfToken;
  if (!value) {
    throw new Error("La respuesta CSRF no incluye csrfToken");
  }
  token = value;
  return value;
}
